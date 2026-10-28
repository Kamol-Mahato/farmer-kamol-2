export type ContestStatus = "upcoming" | "live" | "ended";

export const CONTEST_TYPE_KEYS = ["CONTEST", "OFFER", "NEWS"] as const;

export function getContestStatus(item: {
  startsAt: Date | null;
  endsAt: Date | null;
}): ContestStatus {
  const now = Date.now();
  if (item.endsAt && item.endsAt.getTime() < now) return "ended";
  if (item.startsAt && item.startsAt.getTime() > now) return "upcoming";
  return "live";
}

export function statusClass(s: ContestStatus) {
  if (s === "live") return "bg-green-100 text-green-700";
  if (s === "upcoming") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-200 text-gray-600";
}

export function isImageUrl(u?: string | null) {
  return !!u && (u.startsWith("/") || u.startsWith("http"));
}

export function plainText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatDhaka(d: Date, locale: "bn" | "en") {
  return d.toLocaleString(locale === "bn" ? "bn-BD" : "en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "long",
    timeStyle: "short",
  });
}

export const T = {
  bn: {
    home: "হোম",
    section: "প্রতিযোগিতা ও অফার",
    heading: "প্রতিযোগিতা, অফার ও খবর",
    sub: "আমাদের সর্বশেষ প্রতিযোগিতা, বিশেষ অফার ও ঘোষণা এখানে পাবেন",
    empty: "এখনো কিছু প্রকাশ করা হয়নি।",
    all: "সব",
    types: { CONTEST: "প্রতিযোগিতা", OFFER: "অফার", NEWS: "খবর" } as Record<
      string,
      string
    >,
    status: {
      upcoming: "শীঘ্রই শুরু",
      live: "চলমান",
      ended: "শেষ হয়েছে",
    } as Record<string, string>,
    starts: "শুরু",
    ends: "শেষ",
    pinned: "পিন করা",
    watchFb: "Facebook-এ দেখুন",
    watchYt: "YouTube-এ দেখুন",
    winners: "🏆 বিজয়ী ঘোষণা",
    posterAlt: "পোস্টার",
    contestNote:
      "এই প্রতিযোগিতায় অংশগ্রহণ সম্পূর্ণ বিনামূল্যে, কোনো টাকা বা কেনাকাটা লাগবে না। এই প্রতিযোগিতার সাথে Facebook & YouTube এর কোনো সম্পর্ক নেই।",
    locale: "bn-BD",
  },
  en: {
    home: "Home",
    section: "Contests & Offers",
    heading: "Contests, Offers & News",
    sub: "Find our latest contests, special offers and announcements here",
    empty: "Nothing has been published yet.",
    all: "All",
    types: { CONTEST: "Contest", OFFER: "Offer", NEWS: "News" } as Record<
      string,
      string
    >,
    status: {
      upcoming: "Starting soon",
      live: "Ongoing",
      ended: "Ended",
    } as Record<string, string>,
    starts: "Starts",
    ends: "Ends",
    pinned: "Pinned",
    watchFb: "Watch on Facebook",
    watchYt: "Watch on YouTube",
    winners: "🏆 Winners",
    posterAlt: "Poster",
    contestNote:
      "Entry is completely free. No payment or purchase is required. This contest is not affiliated with Facebook & YouTube.",
    locale: "en-US",
  },
} as const;