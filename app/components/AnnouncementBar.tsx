"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getLocaleFromPath, localizeHref } from "@/lib/i18n";
import { getBengaliDate } from "@/lib/bengaliDate";
import { siteConfig } from "@/lib/siteConfig";
import BangladeshFlagWave from "./BangladeshFlagWave";

export default function AnnouncementBar() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [rotateIndex, setRotateIndex] = useState(0);

  // ইনডেক্স ০ = পতাকা (২.৫ সে.), ১ = সময়, ২ = ইংরেজি তারিখ, ৩ = বাংলা তারিখ, ৪ = ঋতু (প্রতিটা ৫ সে.)
  // বাংলা ভার্সনে ৫টি স্টেপ হবে, ইংরেজি ভার্সনে ৪টি স্টেপ হবে (কারণ সেখানে আলাদা বাংলা তারিখ নেই)
  const rotateDurations =
    locale === "en" ? [2500, 5000, 5000, 5000] : [2500, 5000, 5000, 5000, 5000];

  useEffect(() => {
    setMounted(true);
    const timeTimer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timeTimer);
  }, []);

  useEffect(() => {
    const rotateTimer = setTimeout(() => {
      setRotateIndex((i) => (i + 1) % rotateDurations.length);
    }, rotateDurations[rotateIndex]);
    return () => clearTimeout(rotateTimer);
  }, [rotateIndex]);

  const bDate = getBengaliDate(now);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const englishDateStr = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const englishDateShort = now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // বাংলা ভার্সনে ইংরেজি তারিখটি বাংলা হরফে দেখানোর জন্য ফরম্যাট
  const englishDateInBengali = now.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const englishDateInBengaliShort = now.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // ইংরেজি ভার্সনের আইটেম লিস্ট (আগের মতোই ৩টি আইটেম)
  const itemsDesktopEn = [timeStr, englishDateStr, "Rainy Season"];
  const itemsMobileEn = [timeStr, englishDateShort, "Rainy Season"];

  // বাংলা ভার্সনের আইটেম লিস্ট (১ম: সময়, ২য়: ইংরেজি তারিখ, ৩য়: বাংলা তারিখ, ৪র্থ: ঋতু)
  const itemsDesktopBn = [
    timeStr,
    englishDateInBengali,
    `${bDate.dayBnOrdinal} ${bDate.month}, ${bDate.yearBn} বঙ্গাব্দ`,
    `${bDate.ritu} কাল`,
  ];
  const itemsMobileBn = [
    timeStr,
    englishDateInBengaliShort,
    `${bDate.dayBnOrdinal} ${bDate.month},\n${bDate.yearBn} বঙ্গাব্দ`,
    `${bDate.ritu} কাল`,
  ];

  const itemsDesktop = locale === "en" ? itemsDesktopEn : itemsDesktopBn;
  const itemsMobile = locale === "en" ? itemsMobileEn : itemsMobileBn;

  return (
    <div className="fixed top-0 left-0 w-full bg-green-950 text-white text-xs md:text-sm font-bold z-[60] flex items-center h-8">
      {mounted && (
        <div className="shrink-0 px-1.5 md:px-3 overflow-hidden w-[70px] md:w-[190px] text-left md:text-center flex items-center justify-center h-full">
          {rotateIndex === 0 ? (
            <span
              key="flag"
              className="inline-flex items-center animate-fadeIn"
            >
              <BangladeshFlagWave className="w-6 h-4 md:w-7 md:h-4.5 rounded-[2px] shadow-sm" />
            </span>
          ) : (
            <>
              <span
                key={`m-${rotateIndex}`}
                className="inline-block animate-fadeIn text-[10px] leading-tight whitespace-pre-line md:hidden"
              >
                {itemsMobile[rotateIndex - 1]}
              </span>
              <span
                key={`d-${rotateIndex}`}
                className="hidden md:inline-block animate-fadeIn text-xs md:text-sm"
              >
                {itemsDesktop[rotateIndex - 1]}
              </span>
            </>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap inline-block">
          {[...Array(3)].map((_, i) => (
            <span key={i}>
              {locale === "en" ? (
                <>
                  Nomoskar / Assalamu Alaikum Pure Honey, Ghee, Mustard oil &
                  Duck Chicks — straight from our farm to your door. Welcome
                  &nbsp;
                  <a
                    href={localizeHref("/", locale)}
                    className="text-yellow-400 font-bold hover:underline"
                  >
                    {siteConfig.brand.name}
                  </a>
                  &nbsp;Family. For our products or any inquiry, WhatsApp or
                  call us at:&nbsp;
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="text-yellow-400 font-bold hover:underline"
                  >
                    {siteConfig.contact.phoneDisplay}
                  </a>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </>
              ) : (
                <>
                  নমস্কার / আসসালামুআলাইকুম, {siteConfig.brand.name}-এ পেয়ে
                  যাচ্ছেন খাঁটিমধু - ঘি - সরিষার তেল ও হাঁসের বাচ্চা — সরাসরি
                  খামার থেকে আপনার দরজায়।&nbsp;
                  <a
                    href={localizeHref("/", locale)}
                    className="text-yellow-400 font-bold hover:underline"
                  >
                    {siteConfig.brand.name}
                  </a>
                  &nbsp;পরিবারে স্বাগতম। আমাদের পণ্য ও যেকোনো প্রয়োজনে WhatsApp
                  অথবা কল করুন:&nbsp;
                  <a
                    href={`tel:${siteConfig.contact.phone}`}
                    className="text-yellow-400 font-bold hover:underline"
                  >
                    {siteConfig.contact.phoneDisplay}
                  </a>
                  &nbsp;। ঢাকার মধ্যে হোম ডেলিভারি ২৪ ঘন্টার মধ্যে, ঢাকার বাইরে
                  ৪৮ ঘন্টায়।&nbsp;
                </>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
