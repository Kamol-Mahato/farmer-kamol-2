import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestPhoto from "@/app/invest/InvestPhoto";
import InvestSubNav from "@/app/en/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Livestock Invest | Cattle & Duck Farming - ${siteConfig.brand.nameEn}`,
  description:
    "Livestock-based agriculture investment. Partner in Chinese duck and cattle rearing projects. Livestock Invest, Agriculture Invest and transparent farm partnership.",
  keywords: [
    "Livestock Invest",
    "Cattle Rearing Invest",
    "Chinese Duck Investment",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Livestock",
  ],
  openGraph: {
    title: `Livestock Investment | Chinese Duck & Cattle | Farmer Kamol`,
    description:
      "Livestock-based transparent investment. Chinese duck expansion and cattle rearing projects.",
    url: "https://farmerkamol.com/en/invest/livestock",
    siteName: siteConfig.brand.nameEn,
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/en/invest/livestock",
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
    href: "/en/invest/livestock/china-hash",
    status: "Ongoing",
    statusColor: "bg-green-100 text-green-700",
    title: "Chinese Duck Expansion Project",
    desc: "Breeding and expansion of improved Chinese ducks. Fast growth, steady market demand and transparent profit sharing.",
    points: ["Breeding and meat production", "Written e-agreement", "Real income-expense accounts"],
  },
  {
    href: "/en/invest/livestock/goru-palon",
    status: "Coming soon",
    statusColor: "bg-amber-100 text-amber-700",
    title: "Cattle Rearing Project",
    desc: "Native and improved cattle rearing. Long-term investment opportunity based on dairy and meat production.",
    points: ["Cattle rearing and dairy", "Long-term plan", "Transparent accounts and agreement"],
  },
];

export default function LivestockInvestPageEn() {
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
          <span className="text-gray-800 font-medium">Livestock</span>
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
              Livestock Investment
            </h1>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Livestock-based agriculture investment. Partner in Chinese duck and cattle
              rearing projects with a real farm. Transparent accounts, written agreement
              and real profit-loss sharing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Livestock Projects</SectionHeading>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <Reveal key={p.href} delay={i * 100}>
                <Link
                  href={p.href}
                  className="block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green-300 h-full"
                >
                  <div className="h-36 bg-green-100 flex items-center justify-center text-green-800 font-semibold">
                  <InvestPhoto
                      name={p.title.includes("Duck") ? "invest-china-hash" : "invest-goru"}
                      alt={p.title}
                    >
                      {p.title.includes("Duck") ? "Chinese Duck" : "Cattle Rearing"}
                    </InvestPhoto>
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
                      View details →
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
            <SectionHeading>Why Livestock Investment</SectionHeading>
          </Reveal>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <Reveal>
              <p>
                Livestock is a core part of agriculture. Chinese ducks grow fast and have
                steady market demand. Cattle rearing offers long-term income from dairy
                and meat. Both are based on real assets.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p>
                Our model is: first the work, then trust, then partnership. Every project
                comes with a written agreement, transparent accounts and regular updates.
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
          <Link href="/en/invest/crop" className="text-green-700 font-semibold hover:underline">
            Crop Farming →
          </Link>
          <Link href="/en/invest/aquaculture" className="text-green-700 font-semibold hover:underline">
            Fish Farming →
          </Link>
        </div>
      </section>
    </main>
  );
}