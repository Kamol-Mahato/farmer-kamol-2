import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestPhoto from "@/app/invest/InvestPhoto";
import InvestSubNav from "@/app/en/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Fish Farming Invest | Aquaculture Investment - ${siteConfig.brand.nameEn}`,
  description:
    "Pond-based fish farming investment. Fish Farming Invest, Aquaculture Invest and Agriculture Invest with transparent partnership and written agreement.",
  keywords: [
    "Fish Farming Invest",
    "Aquaculture Invest",
    "Pond Fish Farming",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Fish",
  ],
  openGraph: {
    title: `Fish Farming Investment | Pond Aquaculture | Farmer Kamol`,
    description:
      "Pond-based fish farming with planned production and market linkage. Transparent partnership.",
    url: "https://farmerkamol.com/en/invest/aquaculture",
    siteName: siteConfig.brand.nameEn,
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/en/invest/aquaculture",
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

export default function AquacultureInvestPageEn() {
  return (
    <main className="min-h-screen bg-gray-50">
      <InvestSubNav />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 text-sm text-gray-500 flex flex-wrap items-center gap-1.5">
          <Link href="/en/invest" className="hover:text-green-700">
            Agriculture Invest
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Fish Farming</span>
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
              Fish Farming Investment
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Pond-based fish farming investment. Planned production, healthy methods and
              local market linkage. Transparent accounts, written agreement and real
              production partnership.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Project Card */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Fish Farming Project</SectionHeading>
          </Reveal>

          <Reveal>
            <Link
              href="/en/invest/aquaculture/mach-chas"
              className="block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-300"
            >
              <div className="h-40 bg-blue-50 flex items-center justify-center text-blue-800 font-semibold text-lg">
              <InvestPhoto name="invest-mach" alt="Pond Fish Farming">
                  Pond Fish Farming
                </InvestPhoto>
              </div>
              <div className="p-6">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Coming soon
                </span>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Pond Fish Farming Project
                </h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Planned pond management for fish farming. Proper density, feed and
                  healthcare to increase production and sell in the market.
                </p>
                <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
                  <li>• Pond fish farming</li>
                  <li>• Planned production</li>
                  <li>• Transparent accounts and written agreement</li>
                </ul>
                <span className="inline-flex items-center text-blue-700 font-bold text-sm">
                  View details →
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
            <SectionHeading>Why Fish Farming Investment</SectionHeading>
          </Reveal>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                Fish farming is a fast-growing sector in Bangladesh. Local market demand
                is always present, and with proper management good production is
                achievable. Pond-based farming is relatively controllable and easy to
                account for.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p>
                Our model is: first the work, then trust, then partnership. Every project
                will have a written agreement, transparent accounts and regular updates.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Back links */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/en/invest" className="text-green-700 font-semibold hover:underline">
            ← Agriculture Invest Home
          </Link>
          <Link href="/en/invest/livestock" className="text-green-700 font-semibold hover:underline">
            Livestock →
          </Link>
          <Link href="/en/invest/crop" className="text-green-700 font-semibold hover:underline">
            Crop Farming →
          </Link>
        </div>
      </section>
    </main>
  );
}