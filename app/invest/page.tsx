import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { ExpandableText, StepAccordion } from "./InvestAccordion";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `আমাদের খামারে বিনিয়োগ করুন - ${siteConfig.brand.name}`,
  description:
    "কৃষক কমলের খামার সম্প্রসারণে স্বচ্ছ লাভ-ভাগাভাগির ভিত্তিতে বিনিয়োগের সুযোগ। প্রকৃত বিক্রয় ও খরচের হিসাব অনুযায়ী লাভ নির্ধারণ করা হয়।",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full">
      {children}
    </h2>
  );
}

export default function InvestPage() {
  /*
   * এই values এখন শুধুমাত্র UI/demo data।
   * Backend + Project schema তৈরি হলে এগুলো API থেকে আসবে।
   */
  const investmentOpen = false;

  const fundingCap = 100000;
  const currentRaised = 0;
  const maxInvestors = 6;
  const currentInvestors = 0;

  const exampleSales = 100000;
  const exampleExpense = 70000;
  const exampleProfit = exampleSales - exampleExpense;

  const farmerShare = exampleProfit * 0.65;
  const investorShare = exampleProfit * 0.35;

  const raisedPercent =
    fundingCap > 0 ? Math.min((currentRaised / fundingCap) * 100, 100) : 0;

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] text-gray-800">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="bg-gradient-to-b from-green-50 to-white py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs md:text-sm font-semibold mb-5 shadow-sm">
            🌱 Farmer Kamol Investment
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-green-900 mb-5 leading-tight">
            কৃষক কমলের খামারে
            <br className="hidden md:block" /> অংশীদার হোন
          </h1>

          <p className="text-green-900/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
            বাস্তব খামার, বাস্তব হিসাব এবং প্রকৃত লাভের অংশীদারিত্ব। কোনো
            নির্দিষ্ট লাভের নিশ্চয়তা নয়—প্রজেক্টের প্রকৃত ফলাফলের ওপর ভিত্তি
            করে লাভ ভাগ করা হবে।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/customer/dashboard"
              className={`inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-bold text-base shadow-md transition-all duration-300 ${
                investmentOpen
                  ? "bg-green-700 text-white hover:bg-green-800 hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed pointer-events-none"
              }`}
              aria-disabled={!investmentOpen}
            >
              {investmentOpen
                ? "বিনিয়োগের জন্য এগিয়ে যান →"
                : "বর্তমানে বিনিয়োগ বন্ধ"}
            </Link>

            <a
              href="#profit-model"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full font-semibold text-green-700 border border-green-300 bg-white hover:bg-green-50 transition"
            >
              লাভের হিসাব দেখুন ↓
            </a>
          </div>

          {!investmentOpen && (
            <div className="mt-5 inline-flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
              🔒 Investment Program বর্তমানে বন্ধ আছে
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          CURRENT PROJECT
      ========================================================== */}
      <section className="py-10 md:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <SectionHeading>🦆 বর্তমান প্রজেক্ট</SectionHeading>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Project header */}
            <div className="bg-green-50 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        investmentOpen ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs md:text-sm font-bold ${
                        investmentOpen ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {investmentOpen
                        ? "INVESTMENT OPEN"
                        : "INVESTMENT CLOSED"}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-green-900">
                    চিনা হাঁস প্রজনন প্রজেক্ট
                  </h2>

                  <p className="text-sm text-gray-600 mt-2">
                    প্রথম পর্যায়ে ১০০টি চিনা হাঁস দিয়ে প্রজনন কার্যক্রমের
                    ভিত্তি তৈরি করার পরিকল্পনা।
                  </p>
                </div>

                <div className="bg-white rounded-2xl px-5 py-4 border border-green-100 min-w-[180px]">
                  <p className="text-xs text-gray-500 mb-1">
                    সর্বোচ্চ বিনিয়োগ
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    ৳{fundingCap.toLocaleString("bn-BD")}
                  </p>
                </div>
              </div>
            </div>

            {/* Funding statistics */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-7">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">বর্তমানে সংগ্রহ</p>
                  <p className="text-lg md:text-xl font-bold text-green-800">
                    ৳{currentRaised.toLocaleString("bn-BD")}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">সর্বোচ্চ সীমা</p>
                  <p className="text-lg md:text-xl font-bold text-gray-800">
                    ৳{fundingCap.toLocaleString("bn-BD")}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">বিনিয়োগকারী</p>
                  <p className="text-lg md:text-xl font-bold text-gray-800">
                    {currentInvestors} / {maxInvestors}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500 mb-1">Funding Progress</p>
                  <p className="text-lg md:text-xl font-bold text-green-800">
                    {raisedPercent.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                  <span className="font-semibold text-gray-700">
                    Funding Progress
                  </span>
                  <span className="text-gray-500">
                    ৳{currentRaised.toLocaleString("bn-BD")} / ৳
                    {fundingCap.toLocaleString("bn-BD")}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-500"
                    style={{ width: `${raisedPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY INVESTMENT
      ========================================================== */}
      <section className="bg-green-50 py-12 md:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-7">
            <SectionHeading>কেন এই উদ্যোগ</SectionHeading>
          </div>

          <ExpandableText
            teaser="আমাদের পরিবারের জমিতে ধাপে ধাপে একটি পূর্ণাঙ্গ খামার গড়ে তোলার পরিকল্পনা রয়েছে। চিনা হাঁস প্রজনন, গরু-ছাগল পালন, মৌ চাষ এবং সরিষা আবাদ—সবকিছুই বাস্তব অভিজ্ঞতা ও ধাপে ধাপে সম্প্রসারণের মাধ্যমে করার লক্ষ্য।"
            rest="ভবিষ্যতে যখন কোনো নির্দিষ্ট প্রজেক্টের জন্য বিনিয়োগ নেওয়া হবে, তখন সেই প্রজেক্টের উদ্দেশ্য, সর্বোচ্চ অর্থের সীমা, সময়কাল এবং লাভ ভাগাভাগির নিয়ম আগে থেকেই পরিষ্কারভাবে জানানো হবে। প্রজেক্ট শেষ হলে প্রকৃত বিক্রয় ও প্রকৃত খরচের হিসাবের ভিত্তিতে চূড়ান্ত settlement তৈরি হবে।"
          />
        </div>
      </section>

      {/* =========================================================
          PROFIT MODEL
      ========================================================== */}
      <section id="profit-model" className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-3">
            <SectionHeading>📊 লাভ কীভাবে ভাগ হবে</SectionHeading>
          </div>

          <p className="text-center text-xs md:text-sm text-gray-500 max-w-2xl mx-auto mb-9">
            নিচের হিসাবটি শুধুমাত্র বোঝানোর জন্য একটি উদাহরণ। এটি কোনো
            নিশ্চিত লাভের পূর্বাভাস নয়।
          </p>

          {/* K - Y calculation */}
          <div className="grid md:grid-cols-3 gap-4 mb-7">
            <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
              <p className="text-sm text-gray-600 mb-1">
                মোট বিক্রয় — K
              </p>
              <p className="text-2xl font-bold text-green-800">
                ৳{exampleSales.toLocaleString("bn-BD")}
              </p>
            </div>

            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <p className="text-sm text-gray-600 mb-1">
                মোট খরচ — Y
              </p>
              <p className="text-2xl font-bold text-red-700">
                ৳{exampleExpense.toLocaleString("bn-BD")}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
              <p className="text-sm text-gray-600 mb-1">
                নিট লাভ — K − Y
              </p>
              <p className="text-2xl font-bold text-blue-800">
                ৳{exampleProfit.toLocaleString("bn-BD")}
              </p>
            </div>
          </div>

          {/* 65 / 35 */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Farmer */}
              <div className="rounded-2xl bg-green-50 border border-green-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Farmer Kamol</p>
                    <h3 className="text-xl font-bold text-green-900">
                      ৬৫% লাভ
                    </h3>
                  </div>

                  <div className="text-3xl font-black text-green-700">
                    65%
                  </div>
                </div>

                <div className="h-4 bg-white rounded-full overflow-hidden mb-4">
                  <div className="h-full w-[65%] bg-green-600 rounded-full" />
                </div>

                <p className="text-sm text-gray-600">
                  উদাহরণে Farmer Kamol-এর অংশ:
                </p>
                <p className="text-2xl font-bold text-green-800 mt-1">
                  ৳{farmerShare.toLocaleString("bn-BD")}
                </p>
              </div>

              {/* Investors */}
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Investor Pool</p>
                    <h3 className="text-xl font-bold text-blue-900">
                      ৩৫% লাভ
                    </h3>
                  </div>

                  <div className="text-3xl font-black text-blue-700">
                    35%
                  </div>
                </div>

                <div className="h-4 bg-white rounded-full overflow-hidden mb-4">
                  <div className="h-full w-[35%] bg-blue-600 rounded-full" />
                </div>

                <p className="text-sm text-gray-600">
                  উদাহরণে সকল Investor-এর মোট অংশ:
                </p>
                <p className="text-2xl font-bold text-blue-800 mt-1">
                  ৳{investorShare.toLocaleString("bn-BD")}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-5">
              <p className="font-bold text-gray-800 mb-2">
                Investor Pool কীভাবে ভাগ হবে?
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                সকল Investor-এর জন্য নির্ধারিত ৩৫% লাভের pool তাদের প্রত্যেকের
                প্রকৃত বিনিয়োগের অনুপাত অনুযায়ী ভাগ হবে। অর্থাৎ যে যত বেশি
                অংশ বিনিয়োগ করবেন, Investor Pool-এ তার অংশও সেই অনুপাতে হবে।
              </p>
            </div>
          </div>

          {/* Bonus */}
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:p-6">
            <div className="flex gap-3">
              <div className="text-2xl">⭐</div>

              <div>
                <h3 className="font-bold text-amber-900 mb-1">
                  অতিরিক্ত Investor Bonus
                </h3>

                <p className="text-sm text-amber-900/80 leading-relaxed">
                  কোনো প্রজেক্টে প্রকৃত লাভ প্রত্যাশার তুলনায় অনেক বেশি হলে
                  Farmer Kamol চাইলে Investor Pool-এর জন্য অতিরিক্ত bonus দিতে
                  পারবেন। এই bonus ৩৫% base share-এর অতিরিক্ত হবে এবং
                  Investor-দের প্রাপ্য কমিয়ে দেওয়ার জন্য ব্যবহার করা হবে না।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROJECT ACCOUNTING
      ========================================================== */}
      <section className="bg-green-50 py-12 md:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <SectionHeading>🧾 হিসাব কীভাবে রাখা হবে</SectionHeading>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                প্রকৃত বিক্রয়ের হিসাব
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                প্রজেক্টের প্রকৃত বিক্রয়/আয় হিসাব করা হবে। শুধু সম্ভাব্য
                বিক্রয় বা unsold stock-এর মূল্যকে চূড়ান্ত বিক্রয় হিসেবে
                ধরা হবে না।
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">🧾</div>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                Invoice সহ খরচের হিসাব
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                প্রজেক্টের খরচ quantity ও amount অনুযায়ী হিসাব রাখা হবে।
                প্রয়োজন হলে invoice বা সংশ্লিষ্ট প্রমাণ ভিডিও/ডকুমেন্টের
                মাধ্যমে দেখানো যেতে পারে।
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">🔎</div>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                আলাদা Project হিসাব
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                প্রতিটি investment project-এর বিক্রয়, খরচ, investment ও
                settlement আলাদাভাবে track করা হবে।
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-3xl mb-3">📹</div>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                বাস্তব খামার, বাস্তব প্রমাণ
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Farmer Kamol Journey-এর ভিডিওগুলোর মাধ্যমে প্রজেক্টের বাস্তব
                অগ্রগতি ও কাজের বিভিন্ন অংশ তুলে ধরা হবে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          E-AGREEMENT + FINAL SETTLEMENT
      ========================================================== */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <SectionHeading>📄 আপনার জন্য দুইটি গুরুত্বপূর্ণ Document</SectionHeading>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Agreement */}
            <div className="rounded-3xl border border-green-200 bg-white p-6 md:p-7 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl mb-4">
                📜
              </div>

              <h3 className="text-xl font-bold text-green-900 mb-3">
                e-Agreement Copy
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                বিনিয়োগ প্রক্রিয়া সম্পন্ন হলে আপনার investment-এর জন্য
                একটি স্বতন্ত্র e-Agreement তৈরি হবে। এতে project, investment
                amount, সময়কাল, profit-sharing terms এবং উভয় পক্ষের
                প্রয়োজনীয় তথ্য থাকবে।
              </p>

              <div className="text-xs text-gray-500 space-y-2">
                <p>✓ স্বতন্ত্র Agreement Number</p>
                <p>✓ Investor ও Project তথ্য</p>
                <p>✓ ৬৫% / ৩৫% profit-sharing terms</p>
                <p>✓ Investment amount ও date</p>
                <p>✓ Print/Save করার সুবিধা</p>
              </div>
            </div>

            {/* Settlement */}
            <div className="rounded-3xl border border-blue-200 bg-white p-6 md:p-7 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-4">
                📊
              </div>

              <h3 className="text-xl font-bold text-blue-900 mb-3">
                Final Settlement Statement
              </h3>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Project শেষ হলে প্রকৃত বিক্রয় ও খরচের হিসাব থেকে system
                automatically final settlement তৈরি করবে। অতিরিক্ত investor
                bonus থাকলে সেটিও একই settlement-এ দেখানো হবে।
              </p>

              <div className="text-xs text-gray-500 space-y-2">
                <p>✓ Total Sales (K)</p>
                <p>✓ Total Expenses (Y)</p>
                <p>✓ Net Profit (K − Y)</p>
                <p>✓ Farmer Share ও Investor Pool</p>
                <p>✓ Extra Investor Bonus</p>
                <p>✓ প্রত্যেক Investor-এর Final Amount</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}
      <section className="bg-green-50 py-12 md:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <SectionHeading>কিভাবে বিনিয়োগ করবেন</SectionHeading>
          </div>

          <StepAccordion
            steps={[
              {
                step: "১",
                title: "অ্যাকাউন্ট তৈরি করুন",
                text: "আপনার নাম, ফোন নম্বর ও ইমেইল দিয়ে সাধারণ customer account খুলুন। একই account দিয়ে পণ্য অর্ডার ও investment দুটোই করা যাবে।",
              },
              {
                step: "২",
                title: "ইমেইল ভেরিফাই করুন",
                text: "Investor profile-এর নিরাপত্তার জন্য email verification সম্পন্ন করতে হবে।",
              },
              {
                step: "৩",
                title: "Investor Profile সম্পূর্ণ করুন",
                text: "NID, ছবি, স্বাক্ষর এবং প্রয়োজনীয় payment information দিয়ে investor profile সম্পূর্ণ করতে হবে।",
              },
              {
                step: "৪",
                title: "e-Agreement তৈরি হবে",
                text: "Investment-এর terms নিশ্চিত হওয়ার পর আপনার investment-এর জন্য একটি স্বতন্ত্র e-Agreement তৈরি হবে।",
              },
              {
                step: "৫",
                title: "টাকা জমা দিন",
                text: "নির্ধারিত মাধ্যমে টাকা পাঠিয়ে payment proof/slip upload করতে হবে। যাচাইয়ের পর transaction নিশ্চিত করা হবে।",
              },
              {
                step: "৬",
                title: "Project শেষে Final Settlement",
                text: "Project শেষ হলে প্রকৃত sales ও expense হিসাব থেকে net profit নির্ধারণ করে ৬৫% Farmer Kamol এবং ৩৫% Investor Pool অনুযায়ী settlement তৈরি হবে।",
              },
            ]}
          />
        </div>
      </section>

      {/* =========================================================
          TRANSPARENCY
      ========================================================== */}
      <section className="py-12 md:py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <SectionHeading>🔐 নিরাপত্তা ও স্বচ্ছতা</SectionHeading>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              [
                "📄",
                "e-Agreement",
                "প্রতিটি investment-এর জন্য আলাদা agreement number সহ document থাকবে।",
              ],
              [
                "🧾",
                "হিসাবের প্রমাণ",
                "Project expense-এর quantity, amount এবং প্রয়োজনীয় invoice সংরক্ষণ করা হবে।",
              ],
              [
                "📊",
                "স্বচ্ছ Settlement",
                "Project শেষে K, Y এবং K−Y থেকে final হিসাব তৈরি হবে।",
              ],
              [
                "⭐",
                "Extra Bonus",
                "প্রকৃত লাভ বেশি হলে Farmer Kamol চাইলে অতিরিক্ত investor bonus দিতে পারবেন।",
              ],
            ].map(([icon, title, text]) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-green-800 text-sm mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center">
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              ⚠️ Investment-এর লাভ নির্দিষ্ট বা guaranteed নয়। প্রকৃত লাভ
              প্রজেক্টের বাস্তব বিক্রয় ও খরচের ওপর নির্ভর করবে। Investment
              চালু করার আগে সংশ্লিষ্ট আইনগত ও হিসাবসংক্রান্ত বিষয় যথাযথভাবে
              যাচাই করা হবে।
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="bg-green-900 py-14 md:py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-3xl mb-4">🌱</div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            খামারের যাত্রায় অংশীদার হোন
          </h2>

          <p className="text-green-100/80 text-sm md:text-base leading-relaxed mb-7">
            এখন Investment Program বন্ধ রয়েছে। ভবিষ্যতে নির্দিষ্ট Project
            এবং তার সম্পূর্ণ terms প্রকাশ করে investment গ্রহণ করা হবে।
          </p>

          <Link
            href="/customer/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white text-green-800 px-7 py-3 rounded-full font-bold shadow-md hover:bg-green-50 transition"
          >
            Customer Dashboard →
          </Link>
        </div>
      </section>
    </div>
  );
}