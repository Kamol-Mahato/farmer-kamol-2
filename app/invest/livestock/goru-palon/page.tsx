import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestSubNav from "@/app/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `গরু পালন বিনিয়োগ | Cattle Rearing Invest - ${siteConfig.brand.name}`,
  description:
    "কৃষক কমলের গরু পালন প্রকল্পে বিনিয়োগ করুন। দেশি ও উন্নত জাতের গরু পালন, দুগ্ধ ও মাংস উৎপাদন। Livestock Invest, কৃষি বিনিয়োগ ও Agriculture Invest এর অংশ।",
  keywords: [
    "গরু পালন বিনিয়োগ",
    "Cattle Rearing Invest",
    "গরু পালন প্রকল্প",
    "Livestock Invest",
    "কৃষি বিনিয়োগ",
    "Agriculture Invest",
    "দুগ্ধ খামার বিনিয়োগ",
    "Farmer Kamol Cattle",
  ],
  openGraph: {
    title: `গরু পালন প্রকল্পে বিনিয়োগ | Farmer Kamol`,
    description:
      "দেশি ও উন্নত জাতের গরু পালন। দুগ্ধ ও মাংস উৎপাদন ভিত্তিক স্বচ্ছ অংশীদারিত্ব।",
    url: "https://farmerkamol.com/invest/livestock/goru-palon",
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
  },
  alternates: {
    canonical: "/invest/livestock/goru-palon",
    languages: {
      bn: "/invest/livestock/goru-palon",
      en: "/en/invest/livestock/goru-palon",
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

export default function GoruPalonInvestPage() {
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
          <span className="text-gray-800 font-medium">গরু পালন</span>
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
              গরু পালন প্রকল্পে বিনিয়োগ
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              দেশি ও উন্নত জাতের গরু পালন। দুগ্ধ ও মাংস উৎপাদন ভিত্তিক দীর্ঘমেয়াদী
              বিনিয়োগ সুযোগ। স্বচ্ছ হিসাব, লিখিত চুক্তি এবং বাস্তব খামারের সাথে অংশীদারিত্ব।
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition"
              >
                বিনিয়োগ শুরু করুন
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
            <div className="rounded-3xl overflow-hidden border border-green-100 shadow-lg aspect-[4/3] bg-green-50 flex items-center justify-center text-green-700 font-medium">
              গরুর ছবি শীঘ্রই যোগ হবে
            </div>
          </Reveal>
        </div>
      </section>

      {/* Summary */}
      <section className="py-10 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "স্ট্যাটাস", value: "শীঘ্রই" },
            { label: "ধরন", value: "দীর্ঘমেয়াদী" },
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
                কেন গরু পালন?
              </h3>
              <p>
                গরু পালন দীর্ঘমেয়াদী ও স্থিতিশীল আয়ের সুযোগ দেয়। দুগ্ধ উৎপাদন নিয়মিত নগদ প্রবাহ
                তৈরি করে এবং মাংস ও বাচ্চা বিক্রি থেকে অতিরিক্ত আয় হয়। স্থানীয় বাজারে চাহিদা সবসময় থাকে।
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                পরিকল্পনা
              </h3>
              <p>
                প্রথমে সীমিত সংখ্যক গরু দিয়ে শুরু করে ধাপে ধাপে সম্প্রসারণ করা হবে।
                খাবার, স্বাস্থ্যসেবা, শেড এবং প্রজনন ব্যবস্থাপনা — সবকিছুর হিসাব স্বচ্ছভাবে রাখা হবে।
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
                রোগবালাই, খাবারের দাম বৃদ্ধি, বাজার দরের ওঠানামা এবং প্রাকৃতিক দুর্যোগ —
                এসব ঝুঁকি থাকতে পারে। সব ঝুঁকি খোলাখুলি জানানো হবে।
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-10 text-center">
            <Link
              href="/customer/dashboard"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition shadow-md"
            >
              বিনিয়োগ শুরু করুন / নোটিফিকেশন নিন
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
                desc: "গরু পালন প্রকল্প চালু হলে নোটিফিকেশন পেতে বিনিয়োগ শুরু করুন।",
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
            href="/invest/livestock"
            className="text-green-700 font-semibold hover:underline"
          >
            ← সব লাইভস্টক প্রকল্প
          </Link>
          <Link
            href="/invest/livestock/china-hash"
            className="text-green-700 font-semibold hover:underline"
          >
            চিনা হাঁস প্রকল্প →
          </Link>
          <Link href="/invest" className="text-green-700 font-semibold hover:underline">
            ← কৃষি বিনিয়োগ হোম
          </Link>
        </div>
      </section>
    </main>
  );
}