import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestPhoto from "@/app/invest/InvestPhoto";
import InvestSubNav from "@/app/en/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Pond Fish Farming Invest | Aquaculture Investment - ${siteConfig.brand.nameEn}`,
  description:
    "Invest in pond fish farming project. Fish Farming Invest, Aquaculture Invest and Agriculture Invest with transparent partnership and written agreement.",
  keywords: [
    "Pond Fish Farming",
    "Fish Farming Invest",
    "Aquaculture Invest",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Fish",
  ],
  openGraph: {
    title: `Pond Fish Farming Project | Farmer Kamol`,
    description:
      "Planned pond management for fish farming. Transparent partnership, written agreement.",
    url: "https://farmerkamol.com/en/invest/aquaculture/mach-chas",
    siteName: siteConfig.brand.nameEn,
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/en/invest/aquaculture/mach-chas",
    languages: {
      bn: "/invest/aquaculture/mach-chas",
      en: "/en/invest/aquaculture/mach-chas",
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

export default function MachChasInvestPageEn() {
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
          <Link href="/en/invest/aquaculture" className="hover:text-green-700">
            Fish Farming
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Pond Fish Farming</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Coming soon
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              Invest in Pond Fish Farming Project
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              Planned pond management for fish farming. Proper density, feed and healthcare
              to increase production and sell in the local market. Transparent accounts and
              written agreement.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/en/customer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition"
              >
                Invest Now
              </Link>
              <Link
                href="/en/invest/aquaculture"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-green-700 border border-green-300 hover:bg-green-50 transition"
              >
                Fish Farming Sector
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              This is not a bank deposit or fixed-interest scheme. Both profit and loss are possible.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-blue-100 shadow-lg aspect-[4/3] bg-blue-50 flex items-center justify-center text-blue-700 font-medium">
              <InvestPhoto name="invest-mach" alt="Fish farming - Farmer Kamol">
                Fish farming photo coming soon
              </InvestPhoto>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Summary */}
      <section className="py-10 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Status", value: "Coming soon" },
            { label: "Type", value: "Cycle-based" },
            { label: "Profit share", value: "35%" },
            { label: "Agreement", value: "Written" },
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
            <SectionHeading>Project Details</SectionHeading>
          </Reveal>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <Reveal>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                Why pond fish farming?
              </h3>
              <p>
                Fish farming is a fast-growing sector in Bangladesh. Local market demand
                is always present. Pond-based farming is relatively controllable —
                density, feed, water quality and healthcare can be managed for good production.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h3 className="font-bold text-green-900 text-lg mb-2">Plan</h3>
              <p>
                Pond preparation, stocking fingerlings, feed management, regular monitoring
                and harvest timing — every step will be planned in advance. After production,
                profit-loss will be shared transparently with partners.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                Profit and loss sharing
              </h3>
              <p>
                If there is profit, the farmer gets 65% and the partner gets 35% (based on
                real income and expenses). If there is a loss, remaining capital will be
                returned where possible — no guarantee.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <h3 className="font-bold text-green-900 text-lg mb-2">Risks</h3>
              <p>
                Water quality, disease, feed prices, weather and market price swings —
                these risks may exist. All risks will be shared openly.
              </p>
            </Reveal>
          </div>

          <Reveal className="mt-10 text-center">
            <Link
              href="/en/customer/dashboard"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition shadow-md"
            >
              Invest Now
            </Link>
          </Reveal>
        </div>
      </section>

      {/* How to join */}
      <section className="py-14 px-4 bg-green-50">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-8">
            <SectionHeading>How to Join</SectionHeading>
          </Reveal>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Create an account",
                desc: "Register in the customer panel and complete your profile.",
              },
              {
                step: "2",
                title: "Show interest",
                desc: "Register interest to get notified when the fish farming project launches.",
              },
              {
                step: "3",
                title: "Apply when live",
                desc: "When the project goes live, apply, sign the agreement and complete payment.",
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
            href="/en/invest/aquaculture"
            className="text-green-700 font-semibold hover:underline"
          >
            ← Fish Farming Sector
          </Link>
          <Link href="/en/invest" className="text-green-700 font-semibold hover:underline">
            ← Agriculture Invest Home
          </Link>
        </div>
      </section>
    </main>
  );
}