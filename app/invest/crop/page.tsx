import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestSubNav from "@/app/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `ফসল চাষ বিনিয়োগ | Crop Farming Invest - ${siteConfig.brand.name}`,
  description:
    "আবাদি জমিতে ফসল চাষ ভিত্তিক কৃষি বিনিয়োগ। ধান, সরিষা ও উচ্চমূল্যের ফসল। Crop Farming Invest, Agriculture Invest ও কৃষি বিনিয়োগের স্বচ্ছ সুযোগ।",
  keywords: [
    "ফসল চাষ বিনিয়োগ",
    "Crop Farming Invest",
    "আবাদি জমিতে ফসল চাষ",
    "কৃষি বিনিয়োগ",
    "Agriculture Invest",
    "Farming Invest",
    "ধান চাষ বিনিয়োগ",
    "Farmer Kamol Crop",
  ],
  openGraph: {
    title: `ফসল চাষ বিনিয়োগ | আবাদি জমিতে ফসল | Farmer Kamol`,
    description:
      "আবাদি জমিতে ধান, সরিষা ও উচ্চমূল্যের ফসল চাষ। স্বচ্ছ অংশীদারিত্ব ও লিখিত চুক্তি।",
    url: "https://farmerkamol.com/invest/crop",
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
  },
  alternates: {
    canonical: "/invest/crop",
    languages: {
      bn: "/invest/crop",
      en: "/en/invest/crop",
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

export default function CropInvestPage() {
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
          <span className="text-gray-800 font-medium">ফসল চাষ</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Crop Farming Invest
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              ফসল চাষ বিনিয়োগ
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              আবাদি জমিতে ধান, সরিষা ও উচ্চমূল্যের ফসল চাষ। স্থায়ী ও টেকসই উৎপাদন
              ভিত্তিক কৃষি বিনিয়োগ। স্বচ্ছ হিসাব, লিখিত চুক্তি এবং বাস্তব ফসলের সাথে অংশীদারিত্ব।
            </p>
          </Reveal>
        </div>
      </section>

      {/* Project Card */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>ফসল চাষ প্রকল্প</SectionHeading>
          </Reveal>

          <Reveal>
            <Link
              href="/invest/crop/fosol-chas"
              className="block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-300"
            >
              <div className="h-40 bg-amber-50 flex items-center justify-center text-amber-800 font-semibold text-lg">
                আবাদি জমিতে ফসল চাষ
              </div>
              <div className="p-6">
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  শীঘ্রই
                </span>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  আবাদি জমিতে ফসল চাষ প্রকল্প
                </h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  ধান, সরিষা ও অন্যান্য উচ্চমূল্যের ফসল চাষ। মৌসুমভিত্তিক পরিকল্পনা,
                  আধুনিক পদ্ধতি এবং স্থানীয় বাজার সংযোগ।
                </p>
                <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
                  <li>• ধান ও সরিষা চাষ</li>
                  <li>• মৌসুমভিত্তিক পরিকল্পনা</li>
                  <li>• স্বচ্ছ হিসাব ও লিখিত চুক্তি</li>
                </ul>
                <span className="inline-flex items-center text-amber-700 font-bold text-sm">
                  বিস্তারিত দেখুন →
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Why Crop */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-8">
            <SectionHeading>কেন ফসল চাষ বিনিয়োগ</SectionHeading>
          </Reveal>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                ফসল চাষ কৃষির মূল ভিত্তি। আবাদি জমিতে সঠিক পরিকল্পনা ও আধুনিক পদ্ধতিতে
                চাষ করলে স্থিতিশীল উৎপাদন ও আয় সম্ভব। ধান ও সরিষার মতো ফসলের স্থানীয় চাহিদা সবসময় থাকে।
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p>
                আমাদের মডেলে প্রথমে কাজ, তারপর বিশ্বাস, তারপর অংশীদারিত্ব। প্রতিটি প্রকল্পে
                লিখিত চুক্তি, স্বচ্ছ হিসাব এবং নিয়মিত আপডেট দেওয়া হবে।
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Back links */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/invest" className="text-green-700 font-semibold hover:underline">
            ← কৃষি বিনিয়োগ হোম
          </Link>
          <Link href="/invest/livestock" className="text-green-700 font-semibold hover:underline">
            লাইভস্টক →
          </Link>
          <Link href="/invest/aquaculture" className="text-green-700 font-semibold hover:underline">
            মাছ চাষ →
          </Link>
        </div>
      </section>
    </main>
  );
}