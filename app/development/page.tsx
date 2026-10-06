import type { Metadata } from "next";
import DevelopmentContent from "./DevelopmentContent";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: {
    absolute:
      "ওয়েবসাইট ডেভেলপমেন্ট — ল্যান্ডিং পেজ ও ই-কমার্স | Kamol Kumar Mahato",
  },
  description:
    "প্রফেশনাল ল্যান্ডিং পেজ ও পূর্ণাঙ্গ ই-কমার্স ওয়েবসাইট ডেভেলপমেন্ট। প্যাকেজ, ফিচার ও মূল্য এক নজরে।",
  alternates: { canonical: "/development" },
  robots: { index: true, follow: true },
};

export default function DevelopmentPage() {
  return (
    <DevelopmentContent
      whatsapp={siteConfig.contact.whatsapp}
      phone={siteConfig.contact.phone}
      phoneDisplay={siteConfig.contact.phoneDisplay}
    />
  );
}