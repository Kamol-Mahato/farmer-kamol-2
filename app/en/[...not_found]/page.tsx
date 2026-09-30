import { notFound, redirect } from "next/navigation";

// /en/... এ যে পেজের ইংরেজি সংস্করণ এখনো নেই, সেখানে 404 না দেখিয়ে বাংলা পেজে পাঠায়।
// Next.js আগে নির্দিষ্ট EN পেজ মেলায়, না মিললে তবেই এই catch-all চলে —
// তাই নতুন EN পেজ বানালেই সেটা নিজে থেকে চালু হয়ে যায়, আলাদা তালিকা লাগে না।
export default async function CatchAll({
  params,
  searchParams,
}: {
  params: Promise<{ not_found: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { not_found } = await params;
  const sp = await searchParams;

  // খালি segment বাদ (/en//evil.com → open-redirect ঠেকাতে) আর API রুট বাদ
  const segments = (not_found || []).filter(Boolean);
  if (segments.length === 0 || segments[0] === "api") {
    notFound();
  }

  const path =
    "/" +
    segments
      .map((s) => {
        try {
          return encodeURIComponent(decodeURIComponent(s));
        } catch {
          return encodeURIComponent(s);
        }
      })
      .join("/");

  // query string (যেমন ?productId=123) সাথে রাখা
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
    else if (value !== undefined) qs.append(key, value);
  }
  const query = qs.toString();

  redirect(query ? `${path}?${query}` : path);
}