import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { prisma } from "@/lib/prisma";
import InvestCalculator from "./InvestCalculator";
import { DetailToggle, StepAccordion } from "./InvestAccordion";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `আমাদের খামারে অংশীদার হোন - ${siteConfig.brand.name}`,
  description:
    "কৃষক কমলের খামারে স্বচ্ছ অংশীদারিত্ব। প্রথমে কাজ, তারপর বিশ্বাস, তারপর অংশীদারিত্ব।",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full">
      {children}
    </h2>
  );
}

// ✅ deenagro-স্টাইলে ইন-পেজ সাব-নেভিগেশন — ক্লিক করলে সেই সেকশনে স্ক্রল করবে
function SubNav() {
  const links = [
    { href: "#projects", label: "প্রকল্পসমূহ" },
    { href: "#farm-status", label: "খামারের অবস্থা" },
    { href: "#calculator", label: "লাভ বণ্টন" },
    { href: "#how-to", label: "কীভাবে অংশীদার হবেন" },
    { href: "#principles", label: "নীতিমালা" },
    { href: "/contact", label: "যোগাযোগ" },
  ];
  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto text-sm scrollbar-hide">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="shrink-0 px-4 py-1.5 rounded-full font-semibold text-gray-600 hover:text-green-700 hover:bg-green-50 transition whitespace-nowrap"
            >
              {l.label}
            </a>
          ))}
        </div>
        <Link
          href="/customer/dashboard"
          className="shrink-0 inline-flex items-center gap-1.5 bg-green-700 text-white px-5 py-2 rounded-full font-bold text-sm shadow hover:bg-green-800 transition whitespace-nowrap"
        >
          বিনিয়োগ করুন →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
      <p className="text-2xl md:text-3xl font-black text-green-700">{value}</p>
      <p className="text-xs md:text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default async function InvestPage() {
  const exampleSales = 100000;
  const exampleExpense = 70000;
  const exampleProfit = exampleSales - exampleExpense;
  const farmerShare = exampleProfit * 0.65;
  const investorShare = exampleProfit * 0.35;

  const [systemSettings, featuredProject] = await Promise.all([
    prisma.systemControlCenter.findUnique({ where: { id: 1 } }),
    prisma.project.findFirst({
      where: { isFeaturedOnInvestPage: true },
      include: {
        investments: {
          where: { status: "ACTIVE" },
          select: { amount: true },
        },
      },
    }),
  ]);

  const raisedAmount =
    featuredProject?.investments.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const targetAmount = featuredProject?.targetAmount ?? null;
  const progressPct =
    targetAmount && targetAmount > 0
      ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
      : null;

  const duckProjectName = featuredProject?.name ?? "চিনা হাঁস সম্প্রসারণ প্রকল্প";
  const duckProjectDesc =
    featuredProject?.description ??
    "উন্নত জাতের চিনা হাঁস প্রজনন ও বাচ্চা উৎপাদন। দীর্ঘমেয়াদী স্থায়ী আয়ের উৎস।";

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] text-gray-800">

      <SubNav />

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative bg-gradient-to-b from-green-50 to-white pt-10 pb-16 md:pt-14 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  বাস্তব খামার, স্বচ্ছ অংশীদারিত্ব
                </span>
                {systemSettings?.farmLocation && (
                  <span className="inline-flex items-center bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
                    📍 {systemSettings.farmLocation}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
                কৃষক কমলের খামারে
                <br />
                <span className="text-green-700">অংশীদারিত্ব</span>
              </h1>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg mb-8">
                প্রথমে কাজ, তারপর বিশ্বাস, তারপর অংশীদারিত্ব।
                বাস্তব খামার, স্বচ্ছ হিসাব এবং ন্যায্য লাভ ভাগাভাগির মাধ্যমে একসাথে এগিয়ে চলা।
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/customer/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-7 py-3.5 rounded-full font-bold text-sm md:text-base shadow-md hover:bg-green-800 hover:-translate-y-0.5 transition-all"
                >
                  অংশীদার হওয়ার আবেদন করুন →
                </Link>
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-green-700 border border-green-300 bg-white hover:bg-green-50 transition"
                >
                  প্রকল্পসমূহ দেখুন
                </a>
              </div>

              {systemSettings?.youtubeChannelUrl && (
                <a
                  href={systemSettings.youtubeChannelUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm text-gray-500 hover:text-green-700 font-medium"
                >
                  ▶ খামারের সব ভিডিও ইউটিউবে দেখুন
                </a>
              )}
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-green-100 aspect-[4/3] bg-green-100 flex items-center justify-center text-green-700 font-medium">
                খামারের ছবি এখানে বসবে
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg px-4 py-3 border border-green-100">
                <p className="text-xs text-gray-500">লাভ বণ্টন</p>
                <p className="text-sm font-bold text-green-700">স্বচ্ছ ও ন্যায্য</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          JOURNEY
      ========================================================== */}
      <section className="py-14 md:py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeading>আমার খামারের যাত্রা</SectionHeading>
            <p className="text-gray-500 text-sm mt-3 max-w-2xl mx-auto">
              Investment দিয়ে শুরু করিনি। নিজের টাকা দিয়ে কাজ শুরু করেছি।
              নিচে সেই সত্য গল্প।
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "ব্যক্তিগত প্রকল্প", desc: "নিজের সামান্য পুঁজি দিয়ে খামার শুরু করেছি। কোনো বাইরের টাকা নেই।" },
              { title: "চ্যালেঞ্জসমূহ", desc: "রোগবালাই, খাবারের দাম, বাজার দর — প্রতিদিন নতুন সমস্যা এসেছে।" },
              { title: "ভুলগুলো", desc: "অনেক ভুল করেছি। শিখেছি। এখন সেই অভিজ্ঞতা কাজে লাগাচ্ছি।" },
              { title: "সমাধান", desc: "ধাপে ধাপে সমস্যা সমাধান করে এগিয়েছি। হিসাব ও রেকর্ড রাখা শুরু করেছি।" },
              { title: "বর্তমান অবস্থা", desc: "ছোট পরিসরে কাজ চলছে। মানুষ দেখছে আমি শুধু কথা বলি না, কাজও করি।" },
              { title: "ভবিষ্যৎ ভিশন", desc: "প্রথমে প্রমাণ, তারপর ছোট pilot, তারপর ধীরে ধীরে বড় করা।" },
            ].map((item) => (
              <div key={item.title} className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <h3 className="font-bold text-green-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FARM STATUS (নতুন সেকশন)
      ========================================================== */}
      <section id="farm-status" className="py-14 md:py-16 px-4 bg-gray-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeading>খামারের বর্তমান অবস্থা</SectionHeading>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="গরু" value={`${systemSettings?.farmCowCount ?? 0}টি`} />
            <StatCard label="চীনা হাঁস" value={`${systemSettings?.farmDuckCount ?? 0}টি`} />
            <StatCard label="ছাগল" value={`${systemSettings?.farmGoatCount ?? 0}টি`} />
            <StatCard
              label="জমি"
              value={`${systemSettings?.farmLandBigha ?? 0} বিঘা`}
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          PROJECTS
      ========================================================== */}
      <section id="projects" className="py-14 md:py-16 px-4 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeading>প্রকল্পসমূহ</SectionHeading>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Project 1 - চিনা হাঁস (dynamic, expandable) */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-40 bg-green-100 flex items-center justify-center text-green-700 font-medium">
                চিনা হাঁসের ছবি
              </div>
              <div className="p-5">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  চলমান
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{duckProjectName}</h3>
                <p className="text-sm text-gray-600 mb-1">{duckProjectDesc}</p>

                <DetailToggle>
                  <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
                    {targetAmount ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">মোট প্রয়োজন</span>
                          <span className="font-bold text-gray-800">
                            ৳{targetAmount.toLocaleString("bn-BD")}
                          </span>
                        </div>
                        {featuredProject?.ownContributionAmount != null && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">আমার নিজের বিনিয়োগ</span>
                            <span className="font-bold text-gray-800">
                              ৳{featuredProject.ownContributionAmount.toLocaleString("bn-BD")}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">এখন পর্যন্ত সংগ্রহ</span>
                          <span className="font-bold text-green-700">
                            ৳{raisedAmount.toLocaleString("bn-BD")}
                          </span>
                        </div>
                        {progressPct !== null && (
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-400 text-xs">
                        ফান্ডিংয়ের বিস্তারিত শীঘ্রই যোগ হবে।
                      </p>
                    )}

                    {featuredProject?.fundUsage && (
                      <div>
                        <p className="text-gray-500 text-xs font-semibold mb-1">টাকা কোথায় খরচ হবে</p>
                        <p className="text-gray-700">{featuredProject.fundUsage}</p>
                      </div>
                    )}
                    {featuredProject?.timeline && (
                      <div>
                        <p className="text-gray-500 text-xs font-semibold mb-1">সময়সীমা</p>
                        <p className="text-gray-700">{featuredProject.timeline}</p>
                      </div>
                    )}
                    {featuredProject?.risks && (
                      <div>
                        <p className="text-gray-500 text-xs font-semibold mb-1">ঝুঁকি</p>
                        <p className="text-gray-700">{featuredProject.risks}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 text-xs font-semibold mb-1">লাভ/ক্ষতি বণ্টন</p>
                      <p className="text-gray-700">
                        {featuredProject?.profitShareNote ??
                          "লাভ হলে খামারি ৬৫% ও অংশীদার ৩৫% পাবেন, প্রকৃত আয়-ব্যয়ের হিসাব অনুযায়ী। লোকসান হলে অবশিষ্ট মূলধন ফেরত দেওয়ার চেষ্টা করা হবে, কোনো গ্যারান্টি ছাড়া।"}
                      </p>
                    </div>
                    <Link
                      href="/customer/dashboard"
                      className="inline-flex items-center gap-1 text-green-700 font-bold text-sm hover:underline pt-1"
                    >
                      এই প্রকল্পে অংশীদার হতে আবেদন করুন →
                    </Link>
                  </div>
                </DetailToggle>
              </div>
            </div>

            {/* Project 2 - ফসল (static, শীঘ্রই) */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-40 bg-amber-50 flex items-center justify-center text-amber-700 font-medium">
                ফসলের ছবি
              </div>
              <div className="p-5">
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  শীঘ্রই আসছে
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">যোগ্য জমিতে ফসল চাষ</h3>
                <p className="text-sm text-gray-600 mb-4">
                  ধান, সরিষাসহ উচ্চমূল্যের ফসল চাষ। স্থায়ী ও টেকসই উৎপাদন।
                </p>
                <span className="text-gray-400 text-sm">শীঘ্রই চালু হবে</span>
              </div>
            </div>

            {/* Project 3 - কোরবানির গরু (static, ব্লগে লিংক) */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-40 bg-blue-50 flex items-center justify-center text-blue-700 font-medium">
                গরুর ছবি
              </div>
              <div className="p-5">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  চলমান
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">কোরবানির গরু স্পন্সরশিপ</h3>
                <p className="text-sm text-gray-600 mb-4">
                  কোরবানির উদ্দেশ্যে গরু পালানোর স্পন্সরশিপ প্রকল্প। বিস্তারিত জানুন আমাদের ব্লগে।
                </p>
                <Link href="/blog" className="text-blue-700 font-semibold text-sm hover:underline">
                  ব্লগে পড়ুন →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LIVE CALCULATOR
      ========================================================== */}
      <section id="calculator" className="py-14 md:py-16 px-4 scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <InvestCalculator />
        </div>
      </section>

      {/* =========================================================
          PROFIT SHARING
      ========================================================== */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeading>লাভ কীভাবে ভাগ হবে</SectionHeading>
            <p className="text-sm text-gray-500 mt-3 max-w-2xl mx-auto">
              কোনো নির্দিষ্ট লাভের প্রতিশ্রুতি নেই। প্রকৃত বিক্রয় ও খরচের হিসাব করে নিট লাভ বের করা হবে।
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">মোট বিক্রয়</span>
                <span className="text-lg font-bold text-green-800">৳{exampleSales.toLocaleString("bn-BD")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">মোট খরচ</span>
                <span className="text-lg font-bold text-red-600">− ৳{exampleExpense.toLocaleString("bn-BD")}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-5">
                <div className="flex justify-between items-center bg-blue-50 rounded-2xl px-5 py-4">
                  <span className="font-bold text-gray-800">নিট লাভ</span>
                  <span className="text-2xl font-black text-blue-800">৳{exampleProfit.toLocaleString("bn-BD")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-3xl bg-green-50 border border-green-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-green-700 font-medium">খামারি (Farmer Kamol)</p>
                  <h3 className="text-2xl font-bold text-green-900">৬৫% লাভ</h3>
                </div>
                <div className="text-4xl font-black text-green-700">65%</div>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden mb-4">
                <div className="h-full w-[65%] bg-green-600 rounded-full" />
              </div>
              <p className="text-sm text-gray-600">উদাহরণে প্রাপ্য:</p>
              <p className="text-2xl font-bold text-green-800">৳{farmerShare.toLocaleString("bn-BD")}</p>
            </div>

            <div className="rounded-3xl bg-blue-50 border border-blue-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-blue-700 font-medium">সকল বিনিয়োগকারী</p>
                  <h3 className="text-2xl font-bold text-blue-900">৩৫% লাভ</h3>
                </div>
                <div className="text-4xl font-black text-blue-700">35%</div>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden mb-4">
                <div className="h-full w-[35%] bg-blue-600 rounded-full" />
              </div>
              <p className="text-sm text-gray-600">উদাহরণে প্রাপ্য:</p>
              <p className="text-2xl font-bold text-blue-800">৳{investorShare.toLocaleString("bn-BD")}</p>
            </div>
          </div>

          {/* ঝুঁকি — calculator/লাভ বণ্টনের কাছাকাছি, বেশি prominent */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mt-8">
            <h3 className="font-bold text-amber-900 mb-2">⚠️ ঝুঁকির স্পষ্ট কথা</h3>
            <p className="text-sm text-amber-900/90 leading-relaxed">
              কৃষি ও খামার ব্যবসায় ঝুঁকি আছে। রোগবালাই, প্রাকৃতিক দুর্যোগ, বাজার মূল্য কমে যাওয়া ইত্যাদি কারণে লোকসান হতে পারে।
              আমরা কোনোভাবেই পুঁজি ফেরত বা নির্দিষ্ট লাভের গ্যারান্টি দিই না। বিনিয়োগ করার আগে ভালো করে বুঝে নিন।
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW TO PARTNER
      ========================================================== */}
      <section id="how-to" className="py-14 md:py-16 px-4 scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeading>কীভাবে অংশীদার হবেন</SectionHeading>
          </div>

          <StepAccordion
            steps={[
              { step: "১", title: "অ্যাকাউন্ট তৈরি", text: "নাম, ফোন ও ইমেইল দিয়ে সাধারণ অ্যাকাউন্ট খুলুন।" },
              { step: "২", title: "প্রোফাইল সম্পূর্ণ", text: "NID, ছবি, স্বাক্ষর ও পেমেন্ট তথ্য দিন।" },
              { step: "৩", title: "প্রকল্প বেছে নিন ও আবেদন করুন", text: "নির্দিষ্ট প্রকল্প বেছে নিয়ে অংশীদার হওয়ার আবেদন করুন, চুক্তিপত্র পড়ে ইলেকট্রনিক সম্মতি দিন।" },
              { step: "৪", title: "টাকা জমা দিন", text: "বিকাশ/ব্যাংকে টাকা পাঠিয়ে স্লিপ আপলোড করুন। নিশ্চিত হলে আপনি অংশীদার হয়ে যাবেন।" },
            ]}
          />

          <div className="text-center mt-10">
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center gap-2 bg-green-700 text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-green-800 transition"
            >
              অংশীদার হওয়ার আবেদন করুন →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRINCIPLES
      ========================================================== */}
      <section id="principles" className="py-14 md:py-16 px-4 bg-gray-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <SectionHeading>আমাদের নীতিমালা</SectionHeading>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "নির্দিষ্ট রিটার্নের গ্যারান্টি নেই", desc: "কোনো নির্দিষ্ট সুদ বা গ্যারান্টিড রিটার্ন নেই। শুধু প্রকৃত লাভের অংশীদারিত্ব।" },
              { title: "বাস্তব সম্পদভিত্তিক", desc: "টাকা সরাসরি খামারের বাস্তব সম্পদে (হাঁস, খাবার, অবকাঠামো) ব্যয় হয়।" },
              { title: "স্বচ্ছ লাভ বণ্টন", desc: "প্রকৃত আয়-ব্যয়ের হিসাব অনুযায়ী লাভ ভাগ করা হয়। সব হিসাব দেখানো হয়।" },
              { title: "নৈতিক ব্যবসা", desc: "কোনো প্রতারণা বা লুকোচুরি নেই। সবকিছু খোলাখুলি।" },
              { title: "ঝুঁকি ভাগাভাগি", desc: "লাভ-লোকসান দুটোই অংশীদারিত্বের ভিত্তিতে ভাগ হয়।" },
              { title: "চুক্তিভিত্তিক", desc: "প্রতিটি বিনিয়োগের জন্য লিখিত চুক্তি থাকে।" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-green-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="py-16 px-4 bg-green-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            একসাথে এগিয়ে চলুন
          </h2>
          <p className="text-green-100 mb-8">
            বাস্তব কাজ, স্বচ্ছ হিসাব এবং ন্যায্য অংশীদারিত্বের ভিত্তিতে।
          </p>
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-2 bg-white text-green-800 px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-green-50 transition"
          >
            অংশীদার হওয়ার আবেদন করুন →
          </Link>
        </div>
      </section>

      </div>
  );
}