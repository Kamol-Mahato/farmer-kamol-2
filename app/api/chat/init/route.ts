import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  signVisitorSession,
  verifyVisitorSession,
  generateVisitorId,
} from "@/lib/visitorSession";
import {
  checkAndIncrementRate,
  getClientIp,
  getRedis,
} from "@/lib/rateLimiter";

// 🔒 এই রুট কখনো CDN/ব্রাউজারে ক্যাশ হলে দুই ভিজিটর একই visitorId পেতে পারে
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE_HEADERS: HeadersInit = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Cloudflare-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE_HEADERS });
}

export async function GET(request: Request) {
  try {
    // 🔒 spam / mass init আটকাতে IP ভিত্তিক হালকা limit (২০ / মিনিট)
    const ip = getClientIp(request);
    const { allowed } = await checkAndIncrementRate(`chat-init:${ip}`, 20, 60);
    if (!allowed) {
      return json(
        { error: "একটু ধীরে চেষ্টা করুন। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
        429,
      );
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get("visitor_session")?.value;

    let visitorId = existingToken
      ? await verifyVisitorSession(existingToken)
      : null;
    let issuedNewSession = false;

    // 🔒 কুকি না থাকলে বা অবৈধ — প্রতি রিকোয়েস্টে নতুন UUID (ক্যাশড রেসপন্স দিয়ে শেয়ার হবে না)
    if (!visitorId) {
      visitorId = generateVisitorId();
      issuedNewSession = true;
      const newToken = await signVisitorSession(visitorId);
      cookieStore.set("visitor_session", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });

      // 🔢 সর্বমোট ভিজিটর কাউন্টার — শুধু নতুন visitor_session ইস্যু হলেই +১,
      // এক বছরের কুকি থাকা অবস্থায় বারবার এলে আবার গোনা হবে না
      try {
        await getRedis().incr("stats:total_visitors");
      } catch (err) {
        console.error("TOTAL VISITORS INCR ERROR:", err);
      }
    }

    // 🔒 এখন আর এখানে conversation তৈরি হয় না — ভিজিটর প্রথম মেসেজ পাঠালে
    // /api/chat/send-এ তৈরি হবে। শুধু ভিজিট করলে DB-তে কিছু জমবে না।
    const conversation = await prisma.chatConversation.findUnique({
      where: { visitorId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return json({
      conversationId: conversation?.id ?? null,
      visitorIdIssued: issuedNewSession,
      messages: conversation?.messages ?? [],
    });
  } catch (error) {
    console.error("CHAT INIT ERROR:", error);
    return json({ error: "চ্যাট শুরু করতে সমস্যা হয়েছে" }, 500);
  }
}
