import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestSubNav from "@/app/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `আবাদি জমিতে ফসল চাষ বিনিয়োগ | Crop Farming Invest - ${siteConfig.brand.name}`,
  description:
    "আবাদি জমিতে ধান, সরিষা ও উচ্চমূল্যের ফসল চাষে বিনিয়োগ করুন। Crop Farming Invest, কৃষি বিনিয়োগ ও Agriculture Invest এর স্বচ্ছ সুযোগ। লিখিত চুক্তি ও বাস্তব উৎপাদন।",
  keywords: [
    "আবাদি জমিতে ফসল চাষ",
    "ফসল চাষ বিনিয়োগ",
    "Crop Farming Invest",
    "ধান চাষ বিনিয়োগ",
    "সরিষা চাষ বিনিয়োগ",
    "কৃষি বিনিয়োগ",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Crop",
  ],
  openGraph: {
    title: `আবাদি জমিতে ফসল চাষ প্রকল্প | Farmer Kamol`,
    description:
      "ধান, সরিষা ও উচ্চমূল্যের ফসল চাষ। স্বচ্ছ অংশীদারিত্ব, লিখিত চুক্তি।",
    url: "https://farmerkamol.com/invest/crop/fosol-chas",
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
  },
  alternates: {
    canonical: "/invest/crop/fosol-chas",
    languages: {
      bn: "/invest/crop/fosol-chas",
      en: "/en/invest/crop/fosol-chas",
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

export default function FosolChasInvestPage() {
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
          <Link href="/invest/crop" className="hover:text-green-700">
            ফসল চাষ
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">আবাদি জমিতে ফসল</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              শীঘ্রই চালু হবে
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              আবাদি জমিতে ফসল চাষ প্রকল্পে বিনিয়োগ
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              ধান, সরিষা ও উচ্চমূল্যের ফসল চাষ। মৌসুমভিত্তিক পরিকল্পনা, আধুনিক পদ্ধতি
              এবং স্থানীয় বাজার সংযোগ। স্বচ্ছ হিসাব ও লিখিত চুক্তির মাধ্যমে অংশীদারিত্ব।
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition"
              >
                আগ্রহ প্রকাশ করুন
              </Link>
              <Link
                href="/invest/crop"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-green-700 border border-green-300 hover:bg-green-50 transition"
              >
                ফসল চাষ খাত
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              এটি ব্যাংক আমানত বা নির্ধারিত সুদের স্কিম নয়। লাভ-লোকসান দুটোই হতে পারে।
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-amber-100 shadow-lg aspect-[4/3] bg-amber-50 flex items-center justify-center text-amber-700 font-medium">
              ফসলের ছবি শীঘ্রই যোগ হবে
            </div>
          </Reveal>
        </div>
      </section>

      {/* Summary */}
      <section className="py-10 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "স্ট্যাটাস", value: "শীঘ্রই" },
            { label: "ধরন", value: "মৌসুমভিত্তিক" },
            { label: "লাভ বণ্টন", value: "৩৫%" },
            { label: "চুক্তি", value: "লিখিত" },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 60}>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-xl font-black text-green-700">{item.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="py-14 md:py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>প্রকল্পের বিস্তারিত</SectionHeading>
          </Reveal>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <Reveal>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                কেন আবাদি জমিতে ফসল চাষ?
              </h3>
              <p>
                ফসল চাষ কৃষির মূল ভিত্তি। আবাদি জমিতে সঠিক পরিকল্পনা ও আধুনিক পদ্ধতিতে
                চাষ করলে স্থিতিশীল উৎপাদন সম্ভব। ধান ও সরিষার মতো ফসলের স্থানীয় চাহিদা সবসময় থাকে
                এবং মৌসুম শেষে স্পষ্ট ফলন ও আয় হিসাব করা যায়।
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                পরিকল্পনা
              </h3>
              <p>
                মৌসুম অনুযায়ী ফসল নির্বাচন, বীজ, সার, সেচ ও শ্রমিক ব্যবস্থাপনা —
                সবকিছুর হিসাব আগে থেকে করা হবে। উৎপাদন শেষে বাজারজাতকরণ ও লাভ-লোকসান
                স্বচ্ছভাবে অংশীদারদের জানানো হবে।
              </p>
            </Reveal>

            <Reveal delay={160}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                লাভ-লোকসান বণ্টন
              </h3>
              <p>
                লাভ হলে খামারি ৬৫% এবং অংশীদার ৩৫% পাবেন (প্রকৃত আয়-ব্যয়ের হিসাব অনুযায়ী)।
                লোকসান হলে অবশিষ্ট মূলধন ফেরত দেওয়ার চেষ্টা করা হবে, কোনো গ্যারান্টি ছাড়া।
              </p>
            </Reveal>

            <Reveal delay={200}>
              <h3 className="font-bold text-green-900 text-lg mb-2">ঝুঁকি</h3>
              <p>
                আবহাওয়া, পোকামাকড়, রোগবালাই, সার-বীজের দাম এবং বাজার দরের ওঠানামা —
                এসব ঝুঁকি থাকতে পারে। সব ঝুঁকি খোলাখুলি জানানো হবে।
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-10 text-center">
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition shadow-md"
            >
              আগ্রহ প্রকাশ করুন / নোটিফিকেশন নিন
            </Link>
          </Reveal>
        </div>
      </section>

      {/* How to join */}
      <section className="py-14 px-4 bg-green-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-8">
            <SectionHeading>কীভাবে যুক্ত হবেন</SectionHeading>
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
                title: "আগ্রহ জানান",
                desc: "ফসল চাষ প্রকল্প চালু হলে নোটিফিকেশন পেতে আগ্রহ প্রকাশ করুন।",
              },
              {
                step: "৩",
                title: "প্রকল্প চালু হলে আবেদন",
                desc: "প্রকল্প লাইভ হলে আবেদন জমা দিয়ে চুক্তি ও পেমেন্ট সম্পন্ন করুন।",
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
          <Link
            href="/invest/crop"
            className="text-green-700 font-semibold hover:underline"
          >
            ← ফসল চাষ খাত
          </Link>
          <Link href="/invest" className="text-green-700 font-semibold hover:underline">
            ← কৃষি বিনিয়োগ হোম
          </Link>
        </div>
      </section>
    </main>
  );
}