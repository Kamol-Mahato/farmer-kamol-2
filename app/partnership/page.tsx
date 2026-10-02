import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `Partnership Discussion & Confirmation - ${siteConfig.brand.name}`,
  description:
    "Farmer Kamol-এর proposed partnership নিয়ে আলোচনা, মতামত ও confirmation দেওয়ার জন্য নির্ধারিত page।",
  robots: {
    index: false,
    follow: false,
  },
};

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeBFqeQZa_cC22_RuMoJ3akF9ojN30rTukTQtzmDj4P2MG_DQ/viewform?usp=publish-editor";

const discussionTopics = [
  "Partnership structure & ownership",
  "Capital contribution",
  "Farmer Kamol brand & existing assets",
  "Land, labour & management contribution",
  "Profit & salary",
  "Decision-making",
  "Future business assets",
  "Partner responsibilities",
  "Partner exit & ownership transfer",
  "Loss & liability",
  "Confidentiality",
  "Partnership শেষ হলে সম্পদ ও brand-এর অবস্থান",
];

export default function PartnershipPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white text-gray-800">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-14 md:pt-24 md:pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />
          <div className="absolute top-40 -left-24 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-xs md:text-sm font-semibold text-green-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            For Invited Partners Only
          </div>

          <p className="mt-7 text-sm md:text-base font-semibold tracking-wide text-green-700">
            FARMER KAMOL
          </p>

          <h1 className="mt-3 text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900">
            Partnership Discussion
            <span className="block mt-2 text-green-700">
              & Confirmation
            </span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-base md:text-lg leading-8 text-gray-600">
            প্রস্তাবিত partnership structure, ownership, contribution,
            responsibilities এবং ভবিষ্যৎ business operation নিয়ে আমাদের
            আলোচনাকে একটি পরিষ্কার ও লিখিত কাঠামোর মধ্যে আনার উদ্দেশ্যে এই
            questionnaire তৈরি করা হয়েছে।
          </p>

          <div className="mt-9 flex justify-center">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green-700 px-7 py-3.5 text-sm md:text-base font-bold text-white shadow-lg shadow-green-900/15 transition-all duration-200 hover:bg-green-800 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            >
              আলোচনার প্রশ্নগুলোর উত্তর দিন
              <span aria-hidden>→</span>
            </a>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Questionnaire opens in a new tab
          </p>
        </div>
      </section>

      {/* Why this discussion */}
      <section className="px-4 py-14 md:py-18">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm">
            <div className="max-w-3xl">
              <span className="text-sm font-bold text-green-700">
                WHY THIS DISCUSSION
              </span>

              <h2 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">
                Partnership শুরু করার আগে পরিষ্কার বোঝাপড়া
              </h2>

              <p className="mt-5 text-gray-600 leading-8">
                একটি partnership শুরু করার আগে প্রত্যেক অংশীদারের
                প্রত্যাশা, দায়িত্ব, অধিকার ও মতামত পরিষ্কারভাবে জানা
                গুরুত্বপূর্ণ। এই questionnaire-এর মাধ্যমে আলোচনার বিষয়গুলো
                এক জায়গায় আনা এবং প্রত্যেকের মতামত লিখিতভাবে সংরক্ষণ করা হবে।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Discussion topics */}
      <section className="px-4 pb-14 md:pb-18">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-sm font-bold text-green-700">
              DISCUSSION AREAS
            </span>

            <h2 className="mt-2 text-2xl md:text-3xl font-black text-gray-900">
              যে বিষয়গুলো নিয়ে আলোচনা হবে
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {discussionTopics.map((topic, index) => (
              <div
                key={topic}
                className="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="pt-0.5 text-sm font-semibold leading-6 text-gray-700">
                  {topic}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important notice */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 md:p-9">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                !
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-black text-gray-900">
                  গুরুত্বপূর্ণ নোট
                </h2>

                <p className="mt-3 text-sm md:text-base leading-7 text-gray-700">
                  এই questionnaire কোনো চূড়ান্ত Partnership Deed বা legal
                  agreement নয়। এটি শুধুমাত্র partnership discussion ও mutual
                  understanding-এর একটি written record।
                </p>

                <p className="mt-3 text-sm md:text-base leading-7 text-gray-700">
                  সকল বিষয় আলোচনার মাধ্যমে চূড়ান্ত করা হবে এবং প্রয়োজন
                  অনুযায়ী পরবর্তীতে আইনজীবীর মাধ্যমে formal agreement প্রস্তুত
                  করা হবে।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-green-100 bg-green-50/60 px-4 py-14 md:py-18">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            আপনার মতামত গুরুত্বপূর্ণ
          </h2>

          <p className="mt-3 text-gray-600">
            নিচের button থেকে questionnaire-টি পূরণ করুন।
          </p>

          <div className="mt-7">
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-green-700 px-8 py-3.5 font-bold text-white shadow-lg shadow-green-900/15 transition-all duration-200 hover:bg-green-800 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              উত্তর দিন
              <span aria-hidden>→</span>
            </a>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Farmer Kamol · Partnership Discussion
          </p>
        </div>
      </section>
    </main>
  );
}