import { Redis } from "@upstash/redis";
import { sendTelegramAlert } from "@/lib/telegram";

// 🔒 Upstash Redis — build-time এ env variable না থাকলেও যেন crash না করে, তাই lazy init
let redis: Redis | null = null;
export function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    });
  }
  return redis;
}

const MAX_ATTEMPTS = 10;
const LOCK_DURATION_SECONDS = 15 * 60; // ১৫ মিনিট

/** IP-based soft limit — সাধারণ ইউজারকে বিরক্ত না করে spam আটকানো */
const IP_DEFAULT_LIMIT = 60;
const IP_DEFAULT_WINDOW_SECONDS = 60 * 60; // ১ ঘণ্টা

type Attempt = { count: number; lockedUntil: number | null };

/** Request থেকে client IP বের করা (Render / proxy friendly) */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function checkRateLimit(
  identifier: string,
): Promise<{ allowed: boolean; remainingMs?: number }> {
  try {
    const record = await getRedis().get<Attempt>(`ratelimit:${identifier}`);
    if (!record) return { allowed: true };

    if (record.lockedUntil && record.lockedUntil > Date.now()) {
      return { allowed: false, remainingMs: record.lockedUntil - Date.now() };
    }

    return { allowed: true };
  } catch (error) {
    // Redis-এ সাময়িক সমস্যা হলেও যেন লগইন বন্ধ না হয়ে যায় (fail-open)
    console.error("Rate limiter check error:", error);
    await sendTelegramAlert(
      `⚠️ <b>Rate limiter সমস্যা</b>\nRedis-এ পৌঁছানো যাচ্ছে না, brute-force protection সাময়িকভাবে বন্ধ আছে (fail-open)।\nIdentifier: ${identifier}`,
    );
    return { allowed: true };
  }
}

export async function recordFailedAttempt(identifier: string) {
  try {
    const key = `ratelimit:${identifier}`;
    const record = (await getRedis().get<Attempt>(key)) || {
      count: 0,
      lockedUntil: null,
    };
    record.count += 1;

    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = Date.now() + LOCK_DURATION_SECONDS * 1000;

      // 🚨 লক হলে অ্যাডমিনকে জানানো
      await sendTelegramAlert(
        `🚨 <b>Rate limit লক</b>\n` +
          `Identifier: <code>${identifier}</code>\n` +
          `${MAX_ATTEMPTS} বার ব্যর্থ চেষ্টা → ${LOCK_DURATION_SECONDS / 60} মিনিট লক করা হয়েছে।`,
      );
    } else if (record.count === 5) {
      // আগেভাগে সতর্কতা (স্প্যাম শুরু হলে)
      await sendTelegramAlert(
        `⚠️ <b>বারবার ব্যর্থ চেষ্টা</b>\n` +
          `Identifier: <code>${identifier}</code>\n` +
          `ইতিমধ্যে ${record.count} বার fail হয়েছে (লক ${MAX_ATTEMPTS} এ)।`,
      );
    }

    await getRedis().set(key, record, { ex: LOCK_DURATION_SECONDS });
  } catch (error) {
    console.error("Rate limiter record error:", error);
    await sendTelegramAlert(
      `⚠️ <b>Rate limiter সমস্যা</b>\nফেইল্ড অ্যাটেম্পট রেকর্ড করা যায়নি (Redis error)।\nIdentifier: ${identifier}`,
    );
  }
}

export async function checkAndIncrementRate(
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean }> {
  try {
    const key = `rl:${identifier}`;
    const count = await getRedis().incr(key);
    if (count === 1) {
      await getRedis().expire(key, windowSeconds);
    }
    return { allowed: count <= limit };
  } catch (error) {
    console.error("Chat rate limiter error:", error);
    return { allowed: true };
  }
}

/**
 * IP ভিত্তিক হালকা rate limit (ডিফল্ট: ৬০ রিকোয়েস্ট / ঘণ্টা)।
 * সাধারণ ইউজার/শেয়ারড নেটওয়ার্কের সাথে conflict কম রাখতে limit বেশি রাখা হয়েছে।
 */
export async function checkIpRateLimit(
  ip: string,
  limit: number = IP_DEFAULT_LIMIT,
  windowSeconds: number = IP_DEFAULT_WINDOW_SECONDS,
): Promise<{ allowed: boolean }> {
  if (!ip || ip === "unknown") {
    return { allowed: true };
  }
  return checkAndIncrementRate(`ip:${ip}`, limit, windowSeconds);
}

export async function clearAttempts(identifier: string) {
  try {
    await getRedis().del(`ratelimit:${identifier}`);
  } catch (error) {
    console.error("Rate limiter clear error:", error);
  }
}
