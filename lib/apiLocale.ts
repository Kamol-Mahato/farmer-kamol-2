// API route-এ ইউজারের ভাষা বোঝার জন্য — EN page থেকে fetch করার সময় "x-locale: en" header আসে।
// header না থাকলে (বা অন্য কিছু থাকলে) ডিফল্ট বাংলা, তাই BN page-এর কিছুই ভাঙবে না।
export type ApiLocale = "bn" | "en";

export function getApiLocale(request: Request): ApiLocale {
  return request.headers.get("x-locale") === "en" ? "en" : "bn";
}

// tr(locale, "বাংলা", "English") — locale অনুযায়ী একটা বেছে দেয়
export function tr(locale: ApiLocale, bn: string, en: string): string {
  return locale === "en" ? en : bn;
}