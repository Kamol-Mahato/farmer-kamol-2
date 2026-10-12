import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestSubNav from "@/app/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `লাইভস্টক বিনিয়োগ | Livestock Invest - ${siteConfig.brand.name}`,
  description:
    "পশুপালন ভিত্তিক কৃষি বিনিয়োগ। চিনা হাঁস ও গরু পালন প্রকল্পে অংশীদার হোন। Livestock Invest, Agriculture Invest ও কৃষি বিনিয়োগের স্বচ্ছ সুযোগ।",
  keywords: [
    "লাইভস্টক বিনিয়োগ",
    "Livestock Invest",
    "পশুপালন বিনিয়োগ",
    "চিনা হাঁস বিনিয়োগ",
    "গরু পালন বিনিয়োগ",
    "কৃষি বিনিয়োগ",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Livestock",
  ],
  openGraph: {
    title: `লাইভস্টক বিনিয়োগ | চিনা হাঁস ও গরু পালন | Farmer Kamol`,
    description:
      "পশুপালন ভিত্তিক স্বচ্ছ বিনিয়োগ। চিনা হাঁস সম্প্রসারণ ও গরু পালন প্রকল্প।",
    url: "https://farmerkamol.com/invest/livestock",
    siteName: siteConfig.brand.name,
    locale: "bn_BD",
    type: "website",
  },
  alternates: {
    canonical: "/invest/livestock",
    languages: {
      bn: "/invest/livestock",
      en: "/en/invest/livestock",
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

const projects = [
  {
    href: "/invest/livestock/china-hash",
    status: "চলমান",
    statusColor: "bg-green-100 text-green-700",
    title: "চিনা হাঁস সম্প্রসারণ প্রকল্প",
    desc: "উন্নত জাতের চিনা হাঁসের প্রজনন ও সম্প্রসারণ। দ্রুত বৃদ্ধি, স্থিতিশীল বাজার চাহিদা এবং স্বচ্ছ লাভ বণ্টন।",
    points: ["প্রজনন ও মাংস উৎপাদন", "লিখিত ই-চুক্তি", "প্রকৃত আয়-ব্যয়ের হিসাব"],
  },
  {
    href: "/invest/livestock/goru-palon",
    status: "শীঘ্রই",
    statusColor: "bg-amber-100 text-amber-700",
    title: "গরু পালন প্রকল্প",
    desc: "দেশি ও উন্নত জাতের গরু পালন। দুগ্ধ ও মাংস উৎপাদন ভিত্তিক দীর্ঘমেয়াদী বিনিয়োগ সুযোগ।",
    points: ["গরু পালন ও দুগ্ধ", "দীর্ঘমেয়াদী পরিকল্পনা", "স্বচ্ছ হিসাব ও চুক্তি"],
  },
];

export default function LivestockInvestPage() {
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
          <span className="text-gray-800 font-medium">লাইভস্টক</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Livestock Invest
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              লাইভস্টক বিনিয়োগ
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              পশুপালন ভিত্তিক কৃষি বিনিয়োগ। চিনা হাঁস ও গরু পালন প্রকল্পে অংশীদার হয়ে
              বাস্তব খামারের সাথে যুক্ত হোন। স্বচ্ছ হিসাব, লিখিত চুক্তি এবং প্রকৃত লাভ-লোকসান বণ্টন।
            </p>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>লাইভস্টক প্রকল্পসমূহ</SectionHeading>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <Reveal key={p.href} delay={i * 100}>
                <Link
                  href={p.href}
                  className="block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green-300 h-full"
                >
                  <div className="h-36 bg-green-100 flex items-center justify-center text-green-800 font-semibold">
                    {p.title.includes("হাঁস") ? "চিনা হাঁস" : "গরু পালন"}
                  </div>
                  <div className="p-6">
                    <span
                      className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${p.statusColor}`}
                    >
                      {p.status}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                      {p.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {p.desc}
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
                      {p.points.map((point) => (
                        <li key={point}>• {point}</li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center text-green-700 font-bold text-sm">
                      বিস্তারিত দেখুন →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Livestock */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-8">
            <SectionHeading>কেন লাইভস্টক বিনিয়োগ</SectionHeading>
          </Reveal>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                পশুপালন কৃষির একটি গুরুত্বপূর্ণ অংশ। চিনা হাঁস দ্রুত বড় হয় এবং বাজারে চাহিদা থাকে।
                গরু পালন দীর্ঘমেয়াদে দুগ্ধ ও মাংস উৎপাদনের সুযোগ দেয়। দুটোই বাস্তব সম্পদ ভিত্তিক।
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p>
                আমাদের মডেলে প্রথমে কাজ, তারপর বিশ্বাস, তারপর অংশীদারিত্ব। প্রতিটি প্রকল্পে
                লিখিত চুক্তি, স্বচ্ছ হিসাব এবং নিয়মিত আপডেট দেওয়া হয়।
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/invest" className="text-green-700 font-semibold hover:underline">
            ← কৃষি বিনিয়োগ হোম
          </Link>
          <Link href="/invest/crop" className="text-green-700 font-semibold hover:underline">
            ফসল চাষ →
          </Link>
          <Link href="/invest/aquaculture" className="text-green-700 font-semibold hover:underline">
            মাছ চাষ →
          </Link>
        </div>
      </section>
    </main>
  );
}