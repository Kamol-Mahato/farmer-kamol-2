import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestSubNav from "@/app/en/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Crop Farming Invest | Agriculture Investment - ${siteConfig.brand.nameEn}`,
  description:
    "Crop farming investment on arable land. Rice, mustard and high-value crops. Crop Farming Invest, Agriculture Invest and transparent farm partnership.",
  keywords: [
    "Crop Farming Invest",
    "Agriculture Invest",
    "Farming Invest",
    "Rice Farming Invest",
    "Crop Cultivation Investment",
    "Farmer Kamol Crop",
  ],
  openGraph: {
    title: `Crop Farming Investment | Arable Land | Farmer Kamol`,
    description:
      "Rice, mustard and high-value crops on arable land. Transparent partnership and written agreement.",
    url: "https://farmerkamol.com/en/invest/crop",
    siteName: siteConfig.brand.nameEn,
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/en/invest/crop",
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

export default function CropInvestPageEn() {
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
          <span className="text-gray-800 font-medium">Crop Farming</span>
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
              Crop Farming Investment
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Crop cultivation on arable land — rice, mustard and high-value crops.
              Steady and sustainable production-based agriculture investment. Transparent
              accounts, written agreement and real harvest partnership.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Project Card */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Crop Farming Project</SectionHeading>
          </Reveal>

          <Reveal>
            <Link
              href="/en/invest/crop/fosol-chas"
              className="block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-300"
            >
              <div className="h-40 bg-amber-50 flex items-center justify-center text-amber-800 font-semibold text-lg">
                Crop Farming on Arable Land
              </div>
              <div className="p-6">
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  Coming soon
                </span>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Crop Farming on Arable Land
                </h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Rice, mustard and other high-value crops. Seasonal planning, modern
                  methods and local market linkage.
                </p>
                <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
                  <li>• Rice and mustard cultivation</li>
                  <li>• Seasonal planning</li>
                  <li>• Transparent accounts and written agreement</li>
                </ul>
                <span className="inline-flex items-center text-amber-700 font-bold text-sm">
                  View details →
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
            <SectionHeading>Why Crop Farming Investment</SectionHeading>
          </Reveal>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                Crop farming is the foundation of agriculture. With proper planning and
                modern methods on arable land, steady production and income are possible.
                Crops like rice and mustard always have local demand.
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
          <Link href="/en/invest/aquaculture" className="text-green-700 font-semibold hover:underline">
            Fish Farming →
          </Link>
        </div>
      </section>
    </main>
  );
}