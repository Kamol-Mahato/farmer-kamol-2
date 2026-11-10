"use client";

import { usePathname } from "next/navigation";
import { safeJsonLd } from "@/lib/jsonLd";

const BASE = "https://farmerkamol.com";

// [বাংলা, English]
const NAMES: Record<string, [string, string]> = {
  invest: ["কৃষিতে বিনিয়োগ", "Agriculture Investment"],
  livestock: ["লাইভস্টক বিনিয়োগ", "Livestock Investment"],
  crop: ["ফসল চাষ বিনিয়োগ", "Crop Farming Investment"],
  aquaculture: ["মাছ চাষ বিনিয়োগ", "Fish Farming Investment"],
  "china-hash": ["চিনা হাঁস বিনিয়োগ", "Chinese Duck Investment"],
  "goru-palon": ["গরু পালন বিনিয়োগ", "Cattle Rearing Investment"],
  "fosol-chas": ["আবাদি জমিতে ফসল চাষ", "Crop Farming on Arable Land"],
  "mach-chas": ["পুকুরে মাছ চাষ", "Pond Fish Farming"],
};

export default function InvestBreadcrumbLd() {
  const pathname = usePathname() || "";
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const parts = pathname.split("/").filter(Boolean);
  if (isEn) parts.shift();
  if (parts[0] !== "invest") return null;

  const items: { name: string; url: string }[] = [
    { name: isEn ? "Home" : "হোম", url: isEn ? `${BASE}/en` : BASE },
  ];
  let path = isEn ? "/en" : "";
  for (const seg of parts) {
    path += `/${seg}`;
    const n = NAMES[seg];
    if (!n) break;
    items.push({ name: isEn ? n[1] : n[0], url: `${BASE}${path}` });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  );
}