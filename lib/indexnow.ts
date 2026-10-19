// lib/indexnow.ts
import { siteConfig } from "@/lib/siteConfig";

const INDEXNOW_KEY = "2b0cedfffbe24595abd6a2f368dd5fb9";
const KEY_LOCATION = `https://${siteConfig.domain.host}/${INDEXNOW_KEY}.txt`;
const HOST = siteConfig.domain.host;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * IndexNow-তে URL সাবমিট করে
 * @param urls - absolute URL গুলোর অ্যারে
 * @returns সাবমিট হওয়া URL সংখ্যা ও স্ট্যাটাস
 */
export async function submitToIndexNow(urls: string[]): Promise<{
  success: boolean;
  submitted: number;
  message?: string;
}> {
  if (!urls || urls.length === 0) {
    return { success: false, submitted: 0, message: "No URLs provided" };
  }

  // ডুপ্লিকেট বাদ + শুধু এই ডোমেইনের URL রাখা
  const uniqueUrls = [
    ...new Set(
      urls.filter(
        (u) =>
          typeof u === "string" &&
          u.startsWith(`https://${HOST}`)
      )
    ),
  ];

  if (uniqueUrls.length === 0) {
    return { success: false, submitted: 0, message: "No valid URLs" };
  }

  // IndexNow এক রিকোয়েস্টে ১০,০০০ পর্যন্ত নেয় — আমরা ১০০০ করে ব্যাচ করছি
  const BATCH_SIZE = 1000;
  let totalSubmitted = 0;

  try {
    for (let i = 0; i < uniqueUrls.length; i += BATCH_SIZE) {
      const batch = uniqueUrls.slice(i, i + BATCH_SIZE);

      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: HOST,
          key: INDEXNOW_KEY,
          keyLocation: KEY_LOCATION,
          urlList: batch,
        }),
      });

      // 200 বা 202 হলে সফল
      if (res.status === 200 || res.status === 202) {
        totalSubmitted += batch.length;
      } else {
        const text = await res.text().catch(() => "");
        console.error(
          `IndexNow batch failed (${res.status}):`,
          text.slice(0, 200)
        );
        return {
          success: false,
          submitted: totalSubmitted,
          message: `IndexNow returned ${res.status}`,
        };
      }
    }

    return {
      success: true,
      submitted: totalSubmitted,
      message: `Successfully submitted ${totalSubmitted} URLs`,
    };
  } catch (error: any) {
    console.error("IndexNow error:", error);
    return {
      success: false,
      submitted: totalSubmitted,
      message: error?.message || "Unknown error",
    };
  }
}

/**
 * একটা বা একাধিক URL সহজে সাবমিট করার হেল্পার
 */
export async function submitUrls(...urls: string[]) {
  return submitToIndexNow(urls);
}