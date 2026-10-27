import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { prisma } from "@/lib/prisma";
import Reveal from "@/app/invest/Reveal";
import InvestPhoto from "@/app/invest/InvestPhoto";
import InvestSubNav from "@/app/en/invest/InvestSubNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Chinese Duck Investment | Duck Farming Invest - ${siteConfig.brand.nameEn}`,
  description:
    "Invest in Farmer Kamol's Chinese duck expansion project. Transparent accounts, written agreement, real farm. Part of Agriculture Invest and Livestock Invest.",
  keywords: [
    "Chinese Duck Investment",
    "Duck Farming Invest",
    "Livestock Invest",
    "Agriculture Invest",
    "Farming Invest",
    "Farmer Kamol Duck",
  ],
  openGraph: {
    title: `Chinese Duck Expansion Project | Farmer Kamol`,
    description:
      "Real farm Chinese duck breeding and expansion. Transparent partnership, written agreement.",
    url: "https://farmerkamol.com/en/invest/livestock/china-hash",
    siteName: siteConfig.brand.nameEn,
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/en/invest/livestock/china-hash",
    languages: {
      bn: "/invest/livestock/china-hash",
      en: "/en/invest/livestock/china-hash",
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

export default async function ChinaHashInvestPageEn() {
  const featuredProject = await prisma.project.findFirst({
    where: { isFeaturedOnInvestPage: true },
    include: {
      investments: {
        where: { status: "ACTIVE" },
        select: { amount: true },
      },
    },
  });

  const raisedAmount =
    featuredProject?.investments.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const targetAmount = featuredProject?.targetAmount ?? null;
  const progressPct =
    targetAmount && targetAmount > 0
      ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
      : null;

  const durationMonths = featuredProject?.durationMonths ?? null;
  const investorProfitPct = featuredProject?.investorProfitPct ?? 35;
  const totalLots = featuredProject?.totalLots ?? null;
  const lotUnitName = featuredProject?.lotUnitName ?? "shares";

  const soldLots =
    totalLots && targetAmount && targetAmount > 0
      ? Math.min(totalLots, Math.round((raisedAmount / targetAmount) * totalLots))
      : null;

  const projectDesc =
    featuredProject?.description ??
    "Breeding and expansion of improved Chinese ducks to increase farm production and share profit transparently with partners.";

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
          <Link href="/en/invest/livestock" className="hover:text-green-700">
            Livestock
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Chinese Duck</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Ongoing Project
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              Invest in Chinese Duck Expansion
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              {projectDesc}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/en/customer/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-green-700 hover:bg-green-800 transition"
              >
                Invest Now
              </Link>
              <Link
                href="/en/invest/livestock"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-green-700 border border-green-300 hover:bg-green-50 transition"
              >
                All Livestock Projects
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              This is not a bank deposit or fixed-interest scheme. Both profit and loss are possible.
            </p>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-green-100 shadow-lg aspect-[4/3] bg-green-50 flex items-center justify-center">
              <InvestPhoto name="invest-china-hash" alt="Chinese Duck Project - Farmer Kamol">
                <img
                  src="/uploads/header-2nd-about.jpg"
                  alt="Chinese Duck Project - Farmer Kamol"
                  className="w-full h-full object-cover"
                />
              </InvestPhoto>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-10 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <Reveal>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Duration</p>
              <p className="text-xl font-black text-green-700">
                {durationMonths != null
                  ? `${durationMonths.toLocaleString("en-US")} months`
                  : "—"}
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Profit Share</p>
              <p className="text-xl font-black text-green-700">
                {investorProfitPct != null
                  ? `${investorProfitPct.toLocaleString("en-US")}% of profit`
                  : "35%"}
              </p>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Target Capital</p>
              <p className="text-xl font-black text-green-700">
                {targetAmount != null
                  ? `৳ ${targetAmount.toLocaleString("en-US")}`
                  : "—"}
              </p>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Progress</p>
              <p className="text-xl font-black text-green-700">
                {progressPct != null ? `${progressPct}%` : "—"}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-14 md:py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Project Details</SectionHeading>
          </Reveal>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <Reveal>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                Why Chinese ducks?
              </h3>
              <p>
                Chinese ducks grow fast, have good disease resistance and steady market
                demand. Both breeding and meat production are possible. You can start
                small and expand step by step.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                Where the money will be spent
              </h3>
              <p>
                {featuredProject?.fundUsage ??
                  "Ducklings, feed, medicine, shed improvement and necessary infrastructure. Every expense will be shared with partners."}
              </p>
            </Reveal>

            <Reveal delay={160}>
              <h3 className="font-bold text-green-900 text-lg mb-2">
                Profit and loss sharing
              </h3>
              <p>
                {featuredProject?.profitShareNote ??
                  `If there is profit, the farmer gets ${(100 - (investorProfitPct ?? 35)).toLocaleString("en-US")}% and the partner gets ${(investorProfitPct ?? 35).toLocaleString("en-US")}%. If there is a loss, remaining capital will be returned where possible — no guarantee.`}
              </p>
            </Reveal>

            {featuredProject?.risks && (
              <Reveal delay={200}>
                <h3 className="font-bold text-green-900 text-lg mb-2">Risks</h3>
                <p>{featuredProject.risks}</p>
              </Reveal>
            )}

            {featuredProject?.timeline && (
              <Reveal delay={240}>
                <h3 className="font-bold text-green-900 text-lg mb-2">Timeline</h3>
                <p>{featuredProject.timeline}</p>
              </Reveal>
            )}
          </div>

          {targetAmount != null && (
            <Reveal className="mt-10">
              <div className="bg-green-50 rounded-2xl border border-green-100 p-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Raised</span>
                  <span className="font-bold text-green-700">
                    ৳{raisedAmount.toLocaleString("en-US")} / ৳
                    {targetAmount.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="w-full bg-green-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${progressPct ?? 0}%` }}
                  />
                </div>
                {soldLots != null && totalLots != null && (
                  <p className="text-xs text-gray-500 mt-2">
                    {soldLots.toLocaleString("en-US")} / {totalLots.toLocaleString("en-US")} {lotUnitName} sold
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal className="mt-8 text-center">
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
            <SectionHeading>How to Become a Partner</SectionHeading>
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
                title: "Get verified",
                desc: "Submit required information and documents for profile verification.",
              },
              {
                step: "3",
                title: "Select project and apply",
                desc: "Apply to invest in the Chinese duck project.",
              },
              {
                step: "4",
                title: "Agreement and payment",
                desc: "Sign the written e-agreement and deposit the agreed amount.",
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
            href="/en/invest/livestock"
            className="text-green-700 font-semibold hover:underline"
          >
            ← All Livestock Projects
          </Link>
          <Link href="/en/invest" className="text-green-700 font-semibold hover:underline">
            ← Agriculture Invest Home
          </Link>
        </div>
      </section>
    </main>
  );
}