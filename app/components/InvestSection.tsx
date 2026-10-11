"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Handshake,
  Sprout,
  FileText,
  Banknote,
  Eye,
  ShieldAlert,
  BadgeCheck,
  Video,
  type LucideIcon,
} from "lucide-react";

type InvestSectionProps = {
  activeProjects?: number;
  partnerCount?: number;
  progressPct?: number | null;
};

export default function InvestSection({
  activeProjects = 1,
  partnerCount = 1,
  progressPct = null,
}: InvestSectionProps) {
  const chips = ["স্বচ্ছ হিসাব", "বাস্তব খামার", "লিখিত চুক্তি"];

  const stats = [
    { label: "চলমান প্রকল্প", value: String(activeProjects) },
    { label: "অংশীদার", value: partnerCount > 0 ? `${partnerCount}+` : "—" },
    { label: "সংগ্রহ", value: progressPct != null ? `${progressPct}%` : "—" },
  ];

  // দুই পাশের কার্ড — বড় স্ক্রিনে মাঝের কনটেন্টের ডানে-বামে, মোবাইলে নিচে ২ কলামে দেখাবে
  const leftCards = [
    {
      icon: Handshake,
      title: "লাভের অংশীদারিত্ব",
      desc: "প্রকৃত লাভের ৩৫% বিনিয়োগকারীর, বাকিটা খামারের",
    },
    {
      icon: Sprout,
      title: "বাস্তব প্রকল্প",
      desc: "চিনা হাঁস প্রজনন দিয়ে আমাদের যাত্রা শুরু",
    },
    {
      icon: FileText,
      title: "লিখিত ই-চুক্তি",
      desc: "প্রতিটি বিনিয়োগে সিরিয়াল নম্বরসহ বিস্তারিত চুক্তি",
    },
    {
      icon: Banknote,
      title: "নগদ লভ্যাংশ",
      desc: "লাভ নগদে পাবেন, মূলধন প্রকল্পে খাটতে থাকবে",
    },
  ];

  const rightCards = [
    {
      icon: Eye,
      title: "স্বচ্ছ হিসাব",
      desc: "আয়-ব্যয়ের প্রকৃত হিসাব খোলাখুলি জানানো হবে",
    },
    {
      icon: ShieldAlert,
      title: "ঝুঁকির কথা সরাসরি",
      desc: "লোকসান হলে অবশিষ্ট মূলধন ফেরত — পূর্ণ ফেরতের নিশ্চয়তা নয়",
    },
    {
      icon: BadgeCheck,
      title: "যাচাইকৃত অংশীদার",
      desc: "প্রোফাইল সম্পূর্ণ ও যাচাই হলেই বিনিয়োগ করা যায়",
    },
    {
      icon: Video,
      title: "খামারের যাত্রা",
      desc: "ভিডিও ও ছবিতে দেখুন খামারের আসল অগ্রগতি",
    },
  ];

  // একবারই স্ক্রিনে আসার সময় হালকা fade-slide-up — বারবার না, শুধু প্রথমবার
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#FAF9F6] py-8 md:py-10 px-4 border-y border-green-100/80"
    >
      <div
        className={`max-w-6xl mx-auto grid gap-6 lg:grid-cols-[1fr_minmax(0,42rem)_1fr] lg:gap-8 lg:items-center transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* বাম পাশের কার্ড (মোবাইলে মাঝের কনটেন্টের নিচে) */}
        <div className="order-2 lg:order-1 grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
          {leftCards.map((c) => (
            <SideCard key={c.title} {...c} />
          ))}
        </div>

      <div className="order-1 lg:order-2 text-center">
        {/* হেডিং — Product সেকশনের মতো pill স্টাইল */}
<div className="text-center mb-6">
  <h2 className="inline-flex items-center border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2.5 rounded-full">
    আমাদের খামারে অংশীদার হোন
  </h2>
</div>

        {/* হেডলাইন */}
        <p className="text-2xl md:text-3xl font-black text-gray-900 leading-snug mb-4">
  বিশ্বাস আর লাভের ভিত্তিতে গড়ে উঠুক আমাদের খামার
</p>

        {/* সাব-টেক্সট */}
        <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 max-w-md mx-auto">
          আপনিও হতে পারেন এই যাত্রার একজন অংশীদার — বাস্তব সম্পদ, স্বচ্ছ হিসাব।
        </p>

        {/* chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {chips.map((c) => (
            <span
              key={c}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-green-100 text-green-800 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {c}
            </span>
          ))}
        </div>

        {/* স্ট্যাট কার্ড */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-9 max-w-md mx-auto">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-green-100/80 px-3 py-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-xl md:text-2xl font-black text-green-700">
                {s.value}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
  <div className="flex items-center justify-center gap-4">
    <Link
      href="/invest"
      className="inline-flex items-center gap-2 bg-green-700 text-white px-8 py-3.5 rounded-full font-bold text-base md:text-lg shadow-md shadow-green-900/10 transition-all duration-300 hover:bg-green-800 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
    >
      বিনিয়োগ করুন →
    </Link>
    <Link
      href="/invest"
      className="inline-flex items-center gap-2 text-green-800 border-2 border-green-700 px-6 py-3 rounded-full font-bold text-base md:text-lg transition-all duration-300 hover:bg-green-700 hover:text-white"
    >
      বিস্তারিত
    </Link>
  </div>
  <p className="text-xs text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
  গ্যারান্টিড রিটার্ন নয় — শুধু প্রকৃত লাভের অংশীদারিত্ব ও লিখিত চুক্তি।
  </p>
</div>
      </div>

        {/* ডান পাশের কার্ড */}
        <div className="order-3 grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
          {rightCards.map((c) => (
            <SideCard key={c.title} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ছোট ইনফো কার্ড — আইকন + শিরোনাম + এক লাইনের বিবরণ
function SideCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 bg-white rounded-2xl border border-green-100/80 p-4 shadow-sm text-center lg:text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <span className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}