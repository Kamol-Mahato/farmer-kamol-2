import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import Reveal from "@/app/invest/Reveal";
import InvestPhoto from "@/app/invest/InvestPhoto";
import InvestSubNav from "@/app/en/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Crop Farming on Arable Land | Crop Farming Invest - ${siteConfig.brand.nameEn}`,
  description:
    "Invest in crop farming on arable land — rice, mustard and high-value crops. Crop Farming Invest, Agriculture Invest and transparent partnership with written agreement.",
  keywords: [
    "Crop Farming on Arable Land",
    "Crop Farming Invest",
    "Rice Farming Invest",
    "Mustard Cultivation Invest",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Crop",
  ],
  openGraph: {
    title: `Crop Farming on Arable Land | Farmer Kamol`,
    description:
      "Rice, mustard and high-value crops. Transparent partnership, written agreement.",
    url: "https://farmerkamol.com/en/invest/crop/fosol-chas",
    siteName: siteConfig.brand.nameEn,
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/en/invest/crop/fosol-chas",
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

export default function FosolChasInvestPageEn() {
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
          <Link href="/en/invest/crop" className="hover:text-green-700">
            Crop Farming
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Arable Land Crops</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Coming soon
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              Invest in Crop Farming on Arable Land
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              Rice, mustard and high-value crops. Seasonal planning, modern methods and
              local market linkage. Transparent accounts and written partnership agreement.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/en/customer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition"
              >
                Invest Now
              </Link>
              <Link
                href="/en/invest/crop"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-green-700 border border-green-300 hover:bg-green-50 transition"
              >
                Crop Farming Sector
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              This is not a bank deposit or fixed-interest scheme. Both profit and loss are possible.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-amber-100 shadow-lg aspect-[4/3] bg-amber-50 flex items-center justify-center text-amber-700 font-medium">
              <InvestPhoto name="invest-dhan" alt="Paddy field - Farmer Kamol">
                Crop photo coming soon
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
            { label: "Type", value: "Seasonal" },
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
                Why crop farming on arable land?
              </h3>
              <p>
                Crop farming is the foundation of agriculture. With proper planning and
                modern methods on arable land, steady production is possible. Crops like
                rice and mustard always have local demand, and yield and income can be
                clearly calculated after each season.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h3 className="font-bold text-green-900 text-lg mb-2">Plan</h3>
              <p>
                Crop selection by season, seeds, fertilizer, irrigation and labour —
                everything will be planned in advance. After harvest, marketing and
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
                Weather, pests, disease, seed and fertilizer prices, and market price
                swings — these risks may exist. All risks will be shared openly.
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
                desc: "Register interest to get notified when the crop project launches.",
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
            href="/en/invest/crop"
            className="text-green-700 font-semibold hover:underline"
          >
            ← Crop Farming Sector
          </Link>
          <Link href="/en/invest" className="text-green-700 font-semibold hover:underline">
            ← Agriculture Invest Home
          </Link>
        </div>
      </section>
    </main>
  );
}