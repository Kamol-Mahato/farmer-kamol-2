import { revalidatePath } from "next/cache";
import { sanitizeHtml } from "@/lib/sanitize";
import { submitUrls } from "@/lib/indexnow";
import { siteConfig } from "@/lib/siteConfig";

export const CONTEST_TYPES = ["CONTEST", "OFFER", "NEWS"] as const;

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

function cleanHtml(v: unknown): string | null {
  const t = clean(v);
  return t ? sanitizeHtml(t) : null;
}

function cleanDate(v: unknown): Date | null {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function cleanUrl(v: unknown): string | null {
  const t = clean(v);
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : null;
}

export function buildContestData(body: any) {
  const title = clean(body?.title);
  const slug = clean(body?.slug)?.toLowerCase() ?? null;
  const content = cleanHtml(body?.content);

  if (!title) return { error: "বাংলা শিরোনাম দিন" } as const;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      error: "Slug শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন (-) দিয়ে লিখুন",
    } as const;
  }
  if (!content) return { error: "বাংলা বিস্তারিত লেখা দিন" } as const;

  const startsAt = cleanDate(body?.startsAt);
  const endsAt = cleanDate(body?.endsAt);
  if (startsAt && endsAt && endsAt < startsAt) {
    return { error: "শেষের তারিখ শুরুর আগে হতে পারে না" } as const;
  }

  const type = (CONTEST_TYPES as readonly string[]).includes(body?.type)
    ? (body.type as string)
    : "CONTEST";

  return {
    data: {
      type,
      title,
      titleEn: clean(body?.titleEn),
      slug,
      slugEn: slug,
      summary: clean(body?.summary),
      summaryEn: clean(body?.summaryEn),
      content,
      contentEn: cleanHtml(body?.contentEn),
      image: clean(body?.image),
      posterImage: clean(body?.posterImage),
      facebookUrl: cleanUrl(body?.facebookUrl),
      youtubeUrl: cleanUrl(body?.youtubeUrl),
      startsAt,
      endsAt,
      winners: cleanHtml(body?.winners),
      winnersEn: cleanHtml(body?.winnersEn),
      isPinned: !!body?.isPinned,
      isPublished: !!body?.isPublished,
    },
  } as const;
}

export function revalidateContests(slug?: string | null) {
  revalidatePath("/contests");
  revalidatePath("/en/contests");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/contests/${slug}`);
    revalidatePath(`/en/contests/${slug}`);
  }
}

export function submitContestToIndexNow(slug: string) {
  const base = siteConfig.domain.url;
  submitUrls(
    `${base}/contests`,
    `${base}/contests/${slug}`,
    `${base}/en/contests/${slug}`,
  ).catch((err) => console.error("IndexNow contest error:", err));
}