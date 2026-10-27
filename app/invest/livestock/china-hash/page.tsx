import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { prisma } from "@/lib/prisma";
import Reveal from "@/app/invest/Reveal";
import InvestPhoto from "@/app/invest/InvestPhoto";
import { DetailToggle, StepAccordion } from "@/app/invest/InvestAccordion";
import InvestSubNav from "@/app/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `চিনা হাঁস বিনিয়োগ | Chinese Duck Investment - ${siteConfig.brand.name}`,
  description:
    "কৃষক কমলের চিনা হাঁস সম্প্রসারণ প্রকল্পে বিনিয়োগ করুন। স্বচ্ছ হিসাব, লিখিত চুক্তি, বাস্তব খামার। Agriculture Invest, Livestock Invest ও কৃষি বিনিয়োগের অংশ।",
  keywords: [
    "চিনা হাঁস বিনিয়োগ",
    "Chinese Duck Investment",
    "চিনা হাঁস প্রজনন",
    "Livestock Invest",
    "কৃষি বিনিয়োগ",
    "Agriculture Invest",
    "খামারে বিনিয়োগ",
    "Farmer Kamol Duck",
  ],
  openGraph: {
    title: `চিনা হাঁস সম্প্রসারণ প্রকল্পে বিনিয়োগ | Farmer Kamol`,
    description:
      "বাস্তব খামারে চিনা হাঁস প্রজনন ও সম্প্রসারণ। স্বচ্ছ অংশীদারিত্ব, লিখিত চুক্তি।",
    url: "https://farmerkamol.com/invest/livestock/china-hash",
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
  },
  alternates: {
    canonical: "/invest/livestock/china-hash",
    languages: {
      bn: "/invest/livestock/china-hash",
      en: "/en/invest/livestock/china-hash",
    },
  },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full">
      {children}
    </h2>
  );
}

export default async function ChinaHashInvestPage() {
  const featuredProject = await prisma.project.findFirst({
    where: { isFeaturedOnInvestPage: true },
    include: {
      investments: {
        where: { status: "ACTIVE" },
        select: { amount: true },
      },
    },
  });

  const raisedAmount =
    featuredProject?.investments.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const targetAmount = featuredProject?.targetAmount ?? null;
  const progressPct =
    targetAmount && targetAmount > 0
      ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
      : null;

  const durationMonths = featuredProject?.durationMonths ?? null;
  const investorProfitPct = featuredProject?.investorProfitPct ?? 35;
  const totalLots = featuredProject?.totalLots ?? null;
  const lotUnitName = featuredProject?.lotUnitName ?? "শেয়ার";

  const soldLots =
    totalLots && targetAmount && targetAmount > 0
      ? Math.min(totalLots, Math.round((raisedAmount / targetAmount) * totalLots))
      : null;

  const projectName = featuredProject?.name ?? "চিনা হাঁস সম্প্রসারণ প্রকল্প";
  const projectDesc =
    featuredProject?.description ??
    "উন্নত জাতের চিনা হাঁসের প্রজনন ও সম্প্রসারণের মাধ্যমে খামারের উৎপাদন বাড়ানো এবং অংশীদারদের সাথে স্বচ্ছ লাভ বণ্টন।";

  return (
    <main className="min-h-screen bg-gray-50">
    <InvestSubNav />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-500 flex flex-wrap items-center gap-1.5">
          <Link href="/invest" className="hover:text-green-700">
            কৃষি বিনিয়োগ
          </Link>
          <span>/</span>
          <Link href="/invest/livestock" className="hover:text-green-700">
            লাইভস্টক
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">চিনা হাঁস</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              চলমান প্রকল্প
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              চিনা হাঁস সম্প্রসারণ প্রকল্পে বিনিয়োগ
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              {projectDesc}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition"
              >
                অংশীদার হতে আবেদন করুন
              </Link>
              <Link
                href="/invest/livestock"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-green-700 border border-green-300 hover:bg-green-50 transition"
              >
                সব লাইভস্টক প্রকল্প
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              এটি ব্যাংক আমানত বা নির্ধারিত সুদের স্কিম নয়। লাভ-লোকসান দুটোই হতে পারে।
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-green-100 shadow-lg aspect-[4/3] bg-green-50 flex items-center justify-center">
              <InvestPhoto name="invest-china-hash" alt="চিনা হাঁস প্রকল্প - Farmer Kamol">
                <img
                  src="/uploads/header-2nd-about.jpg"
                  alt="চিনা হাঁস প্রকল্প - Farmer Kamol"
                  className="w-full h-full object-cover"
                />
              </InvestPhoto>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-10 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <Reveal>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">মেয়াদ</p>
              <p className="text-xl font-black text-green-700">
                {durationMonths != null
                  ? `${durationMonths.toLocaleString("bn-BD")} মাস`
                  : "—"}
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">লাভ বণ্টন</p>
              <p className="text-xl font-black text-green-700">
                {investorProfitPct != null
                  ? `প্রফিটের ${investorProfitPct.toLocaleString("bn-BD")}%`
                  : "৩৫%"}
              </p>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">লক্ষ্য মূলধন</p>
              <p className="text-xl font-black text-green-700">
                {targetAmount != null
                  ? `৳ ${targetAmount.toLocaleString("bn-BD")}`
                  : "—"}
              </p>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">অগ্রগতি</p>
              <p className="text-xl font-black text-green-700">
                {progressPct != null ? `${progressPct}%` : "—"}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-14 md:py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>প্রকল্পের বিস্তারিত</SectionHeading>
          </Reveal>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <Reveal>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                কেন চিনা হাঁস?
              </h3>
              <p>
                চিনা হাঁস দ্রুত বড় হয়, রোগ প্রতিরোধ ক্ষমতা ভালো এবং বাজারে চাহিদা স্থিতিশীল।
                প্রজনন ও মাংস উৎপাদন দুটোই সম্ভব। ছোট পরিসর থেকে শুরু করে ধাপে ধাপে সম্প্রসারণ করা যায়।
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                টাকা কোথায় খরচ হবে
              </h3>
              <p>
                {featuredProject?.fundUsage ??
                  "হাঁসের বাচ্চা ক্রয়, খাবার, ঔষধ, শেড উন্নয়ন এবং প্রয়োজনীয় অবকাঠামোতে খরচ হবে। প্রতিটি খরচের হিসাব অংশীদারদের জানানো হবে।"}
              </p>
            </Reveal>

            <Reveal delay={160}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                লাভ-লোকসান বণ্টন
              </h3>
              <p>
                {featuredProject?.profitShareNote ??
                  `লাভ হলে খামারি ${(100 - (investorProfitPct ?? 35)).toLocaleString("bn-BD")}% এবং অংশীদার ${(investorProfitPct ?? 35).toLocaleString("bn-BD")}% পাবেন। লোকসান হলে অবশিষ্ট মূলধন ফেরত দেওয়ার চেষ্টা করা হবে, কোনো গ্যারান্টি ছাড়া।`}
              </p>
            </Reveal>

            {featuredProject?.risks && (
              <Reveal delay={200}>
                <h3 className="font-bold text-green-900 text-lg mb-2">ঝুঁকি</h3>
                <p>{featuredProject.risks}</p>
              </Reveal>
            )}

            {featuredProject?.timeline && (
              <Reveal delay={240}>
                <h3 className="font-bold text-green-900 text-lg mb-2">সময়সীমা</h3>
                <p>{featuredProject.timeline}</p>
              </Reveal>
            )}
          </div>

          {/* Funding Progress */}
          {targetAmount != null && (
            <Reveal className="mt-10">
              <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">সংগৃহীত</span>
                  <span className="font-bold text-green-700">
                    ৳{raisedAmount.toLocaleString("bn-BD")} / ৳
                    {targetAmount.toLocaleString("bn-BD")}
                  </span>
                </div>
                <div className="w-full bg-green-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${progressPct ?? 0}%` }}
                  />
                </div>
                {soldLots != null && totalLots != null && (
                  <p className="text-xs text-gray-500 mt-2">
                    {soldLots.toLocaleString("bn-BD")} / {totalLots.toLocaleString("bn-BD")} {lotUnitName} বিক্রি হয়েছে
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal className="mt-8 text-center">
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition shadow-md"
            >
              এই প্রকল্পে অংশীদার হতে আবেদন করুন
            </Link>
          </Reveal>
        </div>
      </section>

      {/* How to join */}
      <section className="py-14 px-4 bg-green-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-8">
            <SectionHeading>কীভাবে অংশীদার হবেন</SectionHeading>
          </Reveal>
          <div className="space-y-4">
            {[
              {
                step: "১",
                title: "অ্যাকাউন্ট তৈরি করুন",
                desc: "কাস্টমার প্যানেলে রেজিস্ট্রেশন করে প্রোফাইল সম্পূর্ণ করুন।",
              },
              {
                step: "২",
                title: "যাচাই করুন",
                desc: "প্রয়োজনীয় তথ্য ও ডকুমেন্ট দিয়ে প্রোফাইল যাচাই করুন।",
              },
              {
                step: "৩",
                title: "প্রকল্প নির্বাচন ও আবেদন",
                desc: "চিনা হাঁস প্রকল্পে বিনিয়োগের আবেদন জমা দিন।",
              },
              {
                step: "৪",
                title: "চুক্তি ও পেমেন্ট",
                desc: "লিখিত ই-চুক্তি স্বাক্ষর করে নির্ধারিত পরিমাণ জমা দিন।",
              },
            ].map((item, i) => (
              <Reveal key={item.step} delay={i * 60}>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Back links */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/invest/livestock" className="text-green-700 font-semibold hover:underline">
            ← সব লাইভস্টক প্রকল্প
          </Link>
          <Link href="/invest" className="text-green-700 font-semibold hover:underline">
            ← কৃষি বিনিয়োগ হোম
          </Link>
        </div>
      </section>
    </main>
  );
}