import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestPhoto from "@/app/invest/InvestPhoto";
import InvestSubNav from "@/app/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `মাছ চাষ বিনিয়োগ | Fish Farming Invest - ${siteConfig.brand.name}`,
  description:
    "পুকুরে মাছ চাষ ভিত্তিক কৃষি বিনিয়োগ। Fish Farming Invest, Aquaculture Invest ও কৃষি বিনিয়োগের স্বচ্ছ সুযোগ। লিখিত চুক্তি ও বাস্তব উৎপাদন।",
  keywords: [
    "মাছ চাষ বিনিয়োগ",
    "Fish Farming Invest",
    "Aquaculture Invest",
    "পুকুরে মাছ চাষ",
    "কৃষি বিনিয়োগ",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Fish",
  ],
  openGraph: {
    title: `মাছ চাষ বিনিয়োগ | পুকুরে মাছ চাষ | Farmer Kamol`,
    description:
      "পুকুরে মাছ চাষ ভিত্তিক স্বচ্ছ বিনিয়োগ। পরিকল্পিত উৎপাদন ও বাজার সংযোগ।",
    url: "https://farmerkamol.com/invest/aquaculture",
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
  },
  alternates: {
    canonical: "/invest/aquaculture",
    languages: {
      bn: "/invest/aquaculture",
      en: "/en/invest/aquaculture",
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

export default function AquacultureInvestPage() {
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
          <span className="text-gray-800 font-medium">মাছ চাষ</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Fish Farming Invest
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              মাছ চাষ বিনিয়োগ
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              পুকুরে মাছ চাষ ভিত্তিক কৃষি বিনিয়োগ। পরিকল্পিত উৎপাদন, স্বাস্থ্যকর পদ্ধতি
              এবং স্থানীয় বাজার সংযোগ। স্বচ্ছ হিসাব, লিখিত চুক্তি এবং বাস্তব উৎপাদনের সাথে অংশীদারিত্ব।
            </p>
          </Reveal>
        </div>
      </section>

      {/* Project Card */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>মাছ চাষ প্রকল্প</SectionHeading>
          </Reveal>

          <Reveal>
            <Link
              href="/invest/aquaculture/mach-chas"
              className="block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300"
            >
              <div className="h-40 bg-blue-50 flex items-center justify-center text-blue-800 font-semibold text-lg">
              <InvestPhoto name="invest-mach" alt="পুকুরে মাছ চাষ">
                  পুকুরে মাছ চাষ
                </InvestPhoto>
              </div>
              <div className="p-6">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  শীঘ্রই
                </span>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  পুকুরে মাছ চাষ প্রকল্প
                </h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  পরিকল্পিত পুকুর ব্যবস্থাপনায় মাছ চাষ। সঠিক ঘনত্ব, খাবার ও স্বাস্থ্যসেবা
                  নিশ্চিত করে উৎপাদন বাড়ানো এবং বাজারে বিক্রি।
                </p>
                <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
                  <li>• পুকুরে মাছ চাষ</li>
                  <li>• পরিকল্পিত উৎপাদন</li>
                  <li>• স্বচ্ছ হিসাব ও লিখিত চুক্তি</li>
                </ul>
                <span className="inline-flex items-center text-blue-700 font-bold text-sm">
                  বিস্তারিত দেখুন →
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Why Aquaculture */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-8">
            <SectionHeading>কেন মাছ চাষ বিনিয়োগ</SectionHeading>
          </Reveal>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                মাছ চাষ বাংলাদেশে দ্রুত বর্ধনশীল খাত। স্থানীয় বাজারে চাহিদা সবসময় থাকে
                এবং সঠিক ব্যবস্থাপনায় ভালো উৎপাদন পাওয়া যায়। পুকুর ভিত্তিক চাষ তুলনামূলক
                নিয়ন্ত্রণযোগ্য এবং হিসাব রাখা সহজ।
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
          <Link href="/invest/crop" className="text-green-700 font-semibold hover:underline">
            ফসল চাষ →
          </Link>
        </div>
      </section>
    </main>
  );
}