import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { prisma } from "@/lib/prisma";
import InvestCalculator from "./InvestCalculator";
import { DetailToggle, StepAccordion } from "@/app/invest/InvestAccordion";
import Reveal from "@/app/invest/Reveal";
import FaqAccordion from "@/app/invest/FaqAccordion";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Become a Partner in Our Farm - ${siteConfig.brand.nameEn}`,
  description:
    "A transparent partnership in Farmer Kamol's farm. First the work, then trust, then partnership.",
  alternates: {
    canonical: "/en/invest",
    languages: {
      bn: "/invest",
      en: "/en/invest",
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

// ✅ Placeholder data — later just fill in youtubeUrl / imageUrl and the real content will show
const farmVisitVideos: { title: string; description?: string; youtubeUrl: string }[] = [
  { title: "Farm Visit - Part 1", youtubeUrl: "" },
  { title: "Farm Visit - Part 2", youtubeUrl: "" },
  { title: "Farm Visit - Part 3", youtubeUrl: "" },
];

const farmVisitPhotos: { title: string; imageUrl: string }[] = [
  { title: "Farm Photo 1", imageUrl: "" },
  { title: "Farm Photo 2", imageUrl: "" },
  { title: "Farm Photo 3", imageUrl: "" },
];

const journeyVideos: { title: string; description?: string; youtubeUrl: string }[] = [
  { title: "Partner's Experience 1", youtubeUrl: "" },
  { title: "Partner's Experience 2", youtubeUrl: "" },
  { title: "Partner's Experience 3", youtubeUrl: "" },
  { title: "Partner's Experience 4", youtubeUrl: "" },
];

function getYoutubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
}

// ✅ Thumbnail card — opens YouTube in a new tab if there is a link, otherwise a "coming soon" placeholder
function YoutubeCard({
  title,
  description,
  youtubeUrl,
}: {
  title: string;
  description?: string;
  youtubeUrl: string;
}) {
  const ytId = youtubeUrl ? getYoutubeId(youtubeUrl) : null;
  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  const body = (
    <>
      <div
        className="relative bg-black rounded-2xl overflow-hidden shadow-sm"
        style={{ aspectRatio: "16/9" }}
      >
        {thumb ? (
          <>
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white text-xl shadow-lg">
                ▶
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm text-center px-3">
            Video coming soon
          </div>
        )}
      </div>
      <div className="px-0.5 pt-2">
        <h3 className="font-bold text-green-800 text-sm line-clamp-2">{title}</h3>
        {description && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{description}</p>
        )}
      </div>
    </>
  );

  return ytId ? (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      {body}
    </a>
  ) : (
    <div>{body}</div>
  );
}

// ✅ Photo card — grey placeholder with the title if there is no imageUrl
function PhotoCard({ title, imageUrl }: { title: string; imageUrl: string }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
      <div
        className="relative bg-gray-100 flex items-center justify-center text-gray-500 text-sm text-center px-3 font-medium"
        style={{ aspectRatio: "16/9" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <span>{title}</span>
        )}
      </div>
    </div>
  );
}

// ✅ Rounded glass sub-nav (in-page anchors)
function SubNav() {
  const links = [
    { href: "#projects", label: "Projects" },
    { href: "#farm-status", label: "Farm Status" },
    { href: "#calculator", label: "Profit Sharing" },
    { href: "#how-to", label: "How to Partner" },
    { href: "#principles", label: "Principles" },
    { href: "/en/contact", label: "Contact" },
  ];
  return (
    <div className="sticky top-[76px] z-40 px-3 md:px-4 py-1.5 bg-transparent">
      <div
        className="
          max-w-5xl mx-auto
          flex items-center gap-2 md:gap-3
          px-2 md:px-3 py-1.5 md:py-1
          rounded-2xl md:rounded-full
          bg-white/55 backdrop-blur-xl
          border border-white/40
          shadow-[0_8px_28px_rgba(22,101,52,0.10)]
        "
      >
        {/* Links — scrollable, centred, with fades on both sides */}
        <div className="relative flex-1 min-w-0">
          <div className="hidden md:block pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/70 to-transparent z-10 rounded-l-full" />
          <div className="hidden md:block pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/70 to-transparent z-10 rounded-r-full" />
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-x-0.5 gap-y-0.5 md:gap-1 md:overflow-x-auto scrollbar-hide px-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="
                  shrink-0 px-2 md:px-3 py-1 md:py-1.5
                  rounded-full
                  text-xs md:text-sm font-semibold
                  text-gray-700
                  hover:text-green-800 hover:bg-green-50
                  active:scale-[0.97]
                  transition-all duration-200 ease-out
                  whitespace-nowrap
                "
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* CTA — on the right, always visible */}
        <Link
          href="/en/customer/dashboard"
          className="
            shrink-0 inline-flex items-center gap-1
            bg-green-700 text-white
            px-3 md:px-4 py-1.5 md:py-2
            rounded-full
            font-bold text-xs md:text-sm
            shadow-md shadow-green-900/15
            hover:bg-green-800 hover:shadow-lg
            active:scale-[0.97]
            transition-all duration-200 ease-out
            whitespace-nowrap
          "
        >
          Invest Now
          <span className="hidden sm:inline" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-green-200">
      <p className="text-2xl md:text-3xl font-black text-green-700">{value}</p>
      <p className="text-xs md:text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default async function InvestPageEn() {
  const exampleSales = 100000;
  const exampleExpense = 70000;
  const exampleProfit = exampleSales - exampleExpense;
  const farmerShare = exampleProfit * 0.65;
  const investorShare = exampleProfit * 0.35;

  const [systemSettings, featuredProject] = await Promise.all([
    prisma.systemControlCenter.findUnique({ where: { id: 1 } }),
    prisma.project.findFirst({
      where: { isFeaturedOnInvestPage: true },
      include: {
        investments: {
          where: { status: "ACTIVE" },
          select: { amount: true },
        },
      },
    }),
  ]);

  const raisedAmount =
    featuredProject?.investments.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const targetAmount = featuredProject?.targetAmount ?? null;
  const progressPct =
    targetAmount && targetAmount > 0
      ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
      : null;

  // ✅ Fields controlled from Admin
  const durationMonths = featuredProject?.durationMonths ?? null;
  const investorProfitPct = featuredProject?.investorProfitPct ?? null;
  const totalLots = featuredProject?.totalLots ?? null;
  // Lots sold — estimated from target and raised (can be made more exact later using investments)
  const soldLots =
    totalLots && targetAmount && targetAmount > 0
      ? Math.min(totalLots, Math.round((raisedAmount / targetAmount) * totalLots))
      : null;

  // ✅ English text comes from the *En admin fields; if empty, a default English text is shown
  const duckProjectName =
    featuredProject?.nameEn || "Chinese Duck Expansion Project";
  const duckProjectDesc =
    featuredProject?.descriptionEn ||
    "Breeding improved-variety Chinese ducks and producing ducklings. A long-term, steady source of income.";

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] text-gray-800">

      <SubNav />

      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative bg-gradient-to-b from-green-50 to-white pt-10 pb-16 md:pt-14 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <Reveal direction="up" delay={0}>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  A real farm, a transparent partnership
                </span>
                {systemSettings?.farmLocationEn && (
                  <span className="inline-flex items-center bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-sm">
                    📍 {systemSettings.farmLocationEn}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
                Farmer Kamol&apos;s Farm
                <br />
                <span className="text-green-700">Partnership</span>
              </h1>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg mb-8">
                First the work, then trust, then partnership.
                Moving forward together through a real farm, transparent accounts and fair profit sharing.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="#projects"
                  className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-7 py-3.5 rounded-full font-bold text-sm md:text-base shadow-md hover:bg-green-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-300 ease-out"
                >
                  View Projects →
                </Link>
                <Link
                  href="/en/customer/dashboard"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-green-700 border border-green-300 bg-white hover:bg-green-50 hover:border-green-500 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 ease-out"
                >
                  Apply to Become a Partner
                </Link>
              </div>

              <p className="mt-4 text-xs md:text-sm text-gray-500 max-w-lg leading-relaxed">
                <span className="font-semibold text-gray-700">Risk:</span>{" "}
                This is not a bank deposit or a fixed-interest scheme. Both profit and loss are possible.
              </p>

              {systemSettings?.youtubeChannelUrl && (
                <a
                  href={systemSettings.youtubeChannelUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm text-gray-500 hover:text-green-700 font-medium transition-colors duration-300 ease-out"
                >
                  ▶ Watch all farm videos on YouTube
                </a>
              )}
            </Reveal>

            <Reveal className="relative group">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-green-100 aspect-[4/3] transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:border-green-300">
                <img
                  src="/uploads/header-2nd-about.jpg"
                  alt="Farmer Kamol with his cattle on his own farm"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Gradient from the bottom — the caption becomes clearer on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500 ease-out" />
                <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                  <p className="text-white font-bold text-sm md:text-base">Komol Kumar Mahato</p>
                  <p className="text-white/80 text-xs md:text-sm">Founder, on his own farm</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-lg px-4 py-3 border border-green-100 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-xl">
                <p className="text-xs text-gray-500">Profit split (farm operator : partner)</p>
                <p className="text-sm font-bold text-green-700">65 : 35</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          JOURNEY
      ========================================================== */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>My Farm&apos;s Journey</SectionHeading>
            <p className="text-gray-500 text-sm mt-3 max-w-2xl mx-auto">
              I did not start with investment. I started with my own money.
              Here is that true story.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Personal project", desc: "I started the farm with my own modest capital. No outside money." },
              { title: "Challenges", desc: "Disease, feed prices, market rates — new problems came up every day." },
              { title: "Mistakes", desc: "I made many mistakes. I learned. Now I am putting that experience to work." },
              { title: "Solutions", desc: "I moved forward by solving problems step by step. I started keeping accounts and records." },
              { title: "Current status", desc: "Work is going on at a small scale. People can see that I don't just talk — I work." },
              { title: "Future vision", desc: "First proof, then small trial steps, then growing slowly." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 80}>
                <div className="bg-white border border-green-100 rounded-2xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FARM STATUS
      ========================================================== */}
      <section id="farm-status" className="py-14 md:py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Current Farm Status</SectionHeading>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Reveal delay={0}>
              <StatCard label="Cows" value={(systemSettings?.farmCowCount ?? 5).toLocaleString("en-US")} />
            </Reveal>
            <Reveal delay={80}>
              <StatCard label="Chinese Ducks" value={(systemSettings?.farmDuckCount ?? 15).toLocaleString("en-US")} />
            </Reveal>
            <Reveal delay={160}>
              <StatCard label="Goats" value={(systemSettings?.farmGoatCount ?? 4).toLocaleString("en-US")} />
            </Reveal>
            <Reveal delay={240}>
              <StatCard
                label="Land"
                value={`${(systemSettings?.farmLandBigha ?? 3).toLocaleString("en-US")} bigha`}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROJECTS
      ========================================================== */}
      <section id="projects" className="py-14 md:py-16 px-4 bg-green-50 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Projects</SectionHeading>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Project 1 - Chinese ducks (dynamic, expandable) */}
            <Reveal delay={160}>
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-green-200">
                <div className="h-40 bg-green-100 flex items-center justify-center text-green-700 font-medium">
                  Chinese duck photo
                </div>
                <div className="p-5">
                  <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    Ongoing
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{duckProjectName}</h3>
                  <p className="text-sm text-gray-600 mb-3">{duckProjectDesc}</p>

                  {/* ✅ Summary grid — duration / profit / capital / lots */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                      <p className="font-bold text-gray-900">
                        {durationMonths != null ? `${durationMonths.toLocaleString("en-US")} months` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Profit share</p>
                      <p className="font-bold text-gray-900">
                        {investorProfitPct != null
                          ? `${investorProfitPct.toLocaleString("en-US")}% of profit`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Capital</p>
                      <p className="font-bold text-gray-900">
                        {targetAmount != null
                          ? `৳ ${targetAmount.toLocaleString("en-US")}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Lots</p>
                      <p className="font-bold text-gray-900">
                        {soldLots != null && totalLots != null
                          ? `${soldLots.toLocaleString("en-US")} / ${totalLots.toLocaleString("en-US")}`
                          : totalLots != null
                            ? `0 / ${totalLots.toLocaleString("en-US")}`
                            : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {progressPct !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-gray-700">{progressPct}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <DetailToggle closedLabel="View details" openLabel="Show less">
                    <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
                      {targetAmount ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total required</span>
                            <span className="font-bold text-gray-800">
                              ৳{targetAmount.toLocaleString("en-US")}
                            </span>
                          </div>
                          {featuredProject?.ownContributionAmount != null && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">My own investment</span>
                              <span className="font-bold text-gray-800">
                                ৳{featuredProject.ownContributionAmount.toLocaleString("en-US")}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-500">Raised so far</span>
                            <span className="font-bold text-green-700">
                              ৳{raisedAmount.toLocaleString("en-US")}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-400 text-xs">
                          Funding details will be added soon.
                        </p>
                      )}

                      {featuredProject?.fundUsageEn && (
                        <div>
                          <p className="text-gray-500 text-xs font-semibold mb-1">Where the money will be spent</p>
                          <p className="text-gray-700">{featuredProject.fundUsageEn}</p>
                        </div>
                      )}
                      {featuredProject?.timelineEn && (
                        <div>
                          <p className="text-gray-500 text-xs font-semibold mb-1">Timeline</p>
                          <p className="text-gray-700">{featuredProject.timelineEn}</p>
                        </div>
                      )}
                      {featuredProject?.risksEn && (
                        <div>
                          <p className="text-gray-500 text-xs font-semibold mb-1">Risks</p>
                          <p className="text-gray-700">{featuredProject.risksEn}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 text-xs font-semibold mb-1">Profit / loss sharing</p>
                        <p className="text-gray-700">
                          {featuredProject?.profitShareNoteEn ||
                            (investorProfitPct != null
                              ? `If there is a profit, the farm operator gets ${(100 - investorProfitPct).toLocaleString("en-US")}% and the partner gets ${investorProfitPct.toLocaleString("en-US")}%, based on actual income and expense accounts. If there is a loss, we will try to return the remaining capital, with no guarantee.`
                              : "If there is a profit, the farm operator gets 65% and the partner gets 35%, based on actual income and expense accounts. If there is a loss, we will try to return the remaining capital, with no guarantee.")}
                        </p>
                      </div>
                      <Link
                        href="/en/customer/dashboard"
                        className="inline-flex items-center gap-1 text-green-700 font-bold text-sm hover:underline pt-1"
                      >
                        Apply to become a partner in this project →
                      </Link>
                    </div>
                  </DetailToggle>
                </div>
              </div>
            </Reveal>

            {/* Project 2 - Crops (static, coming soon) */}
            <Reveal direction="up" delay={120}>
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-green-200">
                <div className="h-40 bg-amber-50 flex items-center justify-center text-amber-700 font-medium">
                  Crop photo
                </div>
                <div className="p-5">
                  <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    Coming soon
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Crop Cultivation on Suitable Land</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Cultivation of high-value crops including rice and mustard. Steady and sustainable production.
                  </p>
                  <span className="text-gray-400 text-sm">Launching soon</span>
                </div>
              </div>
            </Reveal>

            {/* Project 3 - Qurbani cattle (static, blog link) */}
            <Reveal delay={240}>
              <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-green-200">
                <div className="h-40 bg-blue-50 flex items-center justify-center text-blue-700 font-medium">
                  Cattle photo
                </div>
                <div className="p-5">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    Ongoing
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Qurbani Cattle Sponsorship</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    A sponsorship project for raising cattle for Qurbani. Learn more on our blog.
                  </p>
                  <Link href="/en/blog" className="text-blue-700 font-semibold text-sm hover:underline">
                    Read on the blog →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          Visit Our Farm — video + photos (placeholder)
      ========================================================== */}
      {/* 🔒 LOCKED — once the real videos/photos are ready, delete this line and the closing comment line below to enable the section
      <section id="farm-visit" className="py-14 md:py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Visit Our Farm</SectionHeading>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {farmVisitVideos.map((v, i) => (
              <Reveal
                key={`farm-visit-video-${i}`}
                direction={i % 3 === 0 ? "left" : i % 3 === 1 ? "up" : "right"}
                delay={(i % 3) * 120}
              >
                <YoutubeCard title={v.title} description={v.description} youtubeUrl={v.youtubeUrl} />
              </Reveal>
            ))}
            {farmVisitPhotos.map((p, i) => (
              <Reveal
                key={`farm-visit-photo-${i}`}
                direction={i % 3 === 0 ? "left" : i % 3 === 1 ? "up" : "right"}
                delay={(i % 3) * 120}
              >
                <PhotoCard title={p.title} imageUrl={p.imageUrl} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* =========================================================
          Those Who Started the Journey With Us — videos (placeholder)
      ========================================================== */}
      {/* 🔒 LOCKED — once the real partners' videos are ready, open this comment
      <section id="journey-with-us" className="py-14 md:py-16 px-4 bg-green-50 scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Those Who Started the Journey With Us</SectionHeading>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {journeyVideos.map((v, i) => (
              <Reveal key={`journey-video-${i}`} delay={(i % 4) * 100}>
                <YoutubeCard title={v.title} description={v.description} youtubeUrl={v.youtubeUrl} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* =========================================================
          LIVE CALCULATOR
      ========================================================== */}
      <section id="calculator" className="py-14 md:py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <InvestCalculator />
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          PROFIT SHARING
      ========================================================== */}
      <section className="py-14 md:py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>How Profit Is Shared</SectionHeading>
            <p className="text-sm text-gray-500 mt-3 max-w-2xl mx-auto">
              There is no promise of any fixed profit. Net profit is calculated from actual sales and expenses.
            </p>
          </Reveal>

          <Reveal className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total sales</span>
                <span className="text-lg font-bold text-green-800">৳{exampleSales.toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total expenses</span>
                <span className="text-lg font-bold text-red-600">− ৳{exampleExpense.toLocaleString("en-US")}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-5">
                <div className="flex justify-between items-center bg-blue-50 rounded-2xl px-5 py-4">
                  <span className="font-bold text-gray-800">Net profit</span>
                  <span className="text-2xl font-black text-blue-800">৳{exampleProfit.toLocaleString("en-US")}</span>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            <Reveal delay={0}>
              <div className="rounded-3xl bg-green-50 border border-green-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-green-700 font-medium">Farm operator (Farmer Kamol)</p>
                    <h3 className="text-2xl font-bold text-green-900">65% of profit</h3>
                  </div>
                  <div className="text-4xl font-black text-green-700">65%</div>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden mb-4">
                  <div className="h-full w-[65%] bg-green-600 rounded-full" />
                </div>
                <p className="text-sm text-gray-600">Share in this example:</p>
                <p className="text-2xl font-bold text-green-800">৳{farmerShare.toLocaleString("en-US")}</p>
              </div>
            </Reveal>

            <Reveal>
              <div className="rounded-3xl bg-blue-50 border border-blue-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-xs text-blue-700 font-medium">All investors</p>
                    <h3 className="text-2xl font-bold text-blue-900">35% of profit</h3>
                  </div>
                  <div className="text-4xl font-black text-blue-700">35%</div>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden mb-4">
                  <div className="h-full w-[35%] bg-blue-600 rounded-full" />
                </div>
                <p className="text-sm text-gray-600">Share in this example:</p>
                <p className="text-2xl font-bold text-blue-800">৳{investorShare.toLocaleString("en-US")}</p>
              </div>
            </Reveal>
          </div>

          {/* Risk — close to the calculator / profit sharing, more prominent */}
          <Reveal className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mt-8">
            <h3 className="font-bold text-amber-900 mb-2">⚠️ A Plain Word on Risk</h3>
            <p className="text-sm text-amber-900/90 leading-relaxed">
              Farming and livestock businesses carry risk. Losses can occur due to disease, natural disasters, falling market prices and more.
              We do not, under any circumstances, guarantee the return of capital or any fixed profit. Please understand this well before investing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          HOW TO PARTNER
      ========================================================== */}
      <section id="how-to" className="py-14 md:py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>How to Become a Partner</SectionHeading>
          </Reveal>

          <Reveal>
            <StepAccordion
              steps={[
                { step: "1", title: "Create an account", text: "Open a regular account with your name, phone and email." },
                { step: "2", title: "Complete your profile", text: "Provide your NID, photo, signature and payment details." },
                { step: "3", title: "Choose a project and apply", text: "Choose a specific project, apply to become a partner, read the agreement and give your electronic consent." },
                { step: "4", title: "Deposit your money", text: "Send money via bKash/bank and upload the slip. Once confirmed, you become a partner." },
              ]}
            />
          </Reveal>

          <Reveal className="text-center mt-10">
            <Link
              href="/en/customer/dashboard"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-green-800 transition"
            >
              Apply to Become a Partner →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          E-AGREEMENT + SETTLEMENT
      ========================================================== */}
      <section id="agreement" className="py-14 md:py-16 px-4 bg-green-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Two Important Documents for You</SectionHeading>
            <p className="text-sm text-gray-500 mt-3 max-w-2xl mx-auto">
              Every partnership will have written proof — an agreement at the start, transparent accounts at the end.
              Both documents are issued in Bengali.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            <Reveal>
              <div className="bg-white rounded-3xl border border-green-200 p-6 md:p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-green-300">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl mb-4">
                  📜
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-3">e-Agreement Copy</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  When your application is accepted, a separate e-Agreement will be created for each partnership — clearly stating the project, investment amount, duration and profit-sharing terms.
                </p>
                <div className="text-xs text-gray-500 space-y-2">
                  <p>✓ Unique Agreement Number</p>
                  <p>✓ Partner and project details</p>
                  <p>✓ 65% / 35% profit-sharing terms</p>
                  <p>✓ Investment amount and date</p>
                  <p>✓ Print/save option</p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="bg-white rounded-3xl border border-blue-200 p-6 md:p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-300">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-4">
                  📊
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">Final Settlement Statement</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  When the project ends, the final settlement will be prepared from the actual sales and expense accounts. Any extra bonus will also be shown in the same statement.
                </p>
                <div className="text-xs text-gray-500 space-y-2">
                  <p>✓ Total sales and total expenses</p>
                  <p>✓ Net profit calculation</p>
                  <p>✓ Farm operator&apos;s and partner&apos;s share</p>
                  <p>✓ Extra bonus (if any)</p>
                  <p>✓ Final account for each partner</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================
          SECURITY & TRANSPARENCY
      ========================================================== */}
      <section className="py-14 md:py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Security &amp; Transparency</SectionHeading>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📄", title: "e-Agreement", text: "Every investment gets its own document with a separate agreement number." },
              { icon: "🧾", title: "Proof of accounts", text: "Project expense amounts and necessary receipts/invoices will be kept on record." },
              { icon: "📊", title: "Transparent Settlement", text: "At the end of the project, the final account is prepared from total sales, expenses and net profit." },
              { icon: "⭐", title: "Extra Bonus", text: "If the actual profit is higher, an extra bonus may be given at our discretion." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={(i % 4) * 100}>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-green-200">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-green-800 text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          PRINCIPLES
      ========================================================== */}
      <section id="principles" className="py-14 md:py-16 px-4 bg-green-50 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Our Principles</SectionHeading>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "No guaranteed returns", desc: "There is no fixed interest or guaranteed return. Only a partnership in actual profit." },
              { title: "Backed by real assets", desc: "Money is spent directly on real farm assets (ducks, feed, infrastructure)." },
              { title: "Transparent profit sharing", desc: "Profit is divided according to actual income and expense accounts. All accounts are shown." },
              { title: "Ethical business", desc: "No deception or concealment. Everything is open." },
              { title: "Shared risk", desc: "Both profit and loss are shared on a partnership basis." },
              { title: "Contract-based", desc: "Every investment has a written agreement." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 120}>
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="font-bold text-green-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================== */}
      <section id="faq" className="py-14 md:py-16 px-4 bg-white scroll-mt-16">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <SectionHeading>Frequently Asked Questions</SectionHeading>
          </Reveal>

          <Reveal>
            <FaqAccordion
              items={[
                {
                  q: "Is this a fixed-interest or fixed-profit scheme like a bank?",
                  a: "No. There is no fixed interest or guaranteed return. You receive only the agreed share of whatever profit the project actually makes. If there is no profit in a period, no profit is shared for that period.",
                },
                {
                  q: "How is profit shared?",
                  a: "After calculating actual income and expenses, 65% of the net profit goes to the farm operator (Farmer Kamol) and 35% to the partner. Even if the profit is small, it is shared at this same rate.",
                },
                {
                  q: "What are the risks?",
                  a: "Disease, weather, feed prices and market-rate fluctuations can reduce profit or cause a loss. The risks of each project are listed separately in that project's details.",
                },
                {
                  q: "What happens if there is a loss?",
                  a: "If there is a loss, no profit is paid. Whatever portion of the capital remains will be returned, but there is no assurance that the full capital will be returned. It is important to understand this before investing.",
                },
                {
                  q: "When and how will I receive profit?",
                  a: "After each period's accounts are completed, the profit share is paid in cash. Your capital stays invested in the project; profit is not added to the capital.",
                },
                {
                  q: "Can I withdraw my capital?",
                  a: "You can separately request a capital withdrawal. The timeframe and conditions will be detailed in the agreement.",
                },
                {
                  q: "What do I need to become a partner?",
                  a: "Log in to your account with your phone number and password, and verify your email with an OTP the first time. Then complete your profile with your National ID (NID), photo, signature, address and bKash/bank number. You can invest only after we verify and approve it.",
                },
                {
                  q: "How do I deposit money?",
                  a: "Send the money via bKash or bank and upload the payment slip. Your investment becomes active once we verify and confirm it.",
                },
                {
                  q: "How does the agreement work?",
                  a: "For each investment, a detailed e-agreement is created with a separate serial number and date, carrying the photos and signatures of both parties. You sign on paper, take a photo of it and upload it.",
                },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="py-16 px-4 bg-green-200 text-center">
        <Reveal className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-green-950">
            Let&apos;s Move Forward Together
          </h2>
          <p className="text-green-850 mb-8 font-medium">
            Based on real work, transparent accounts and fair partnership.
          </p>
          <Link
            href="/en/customer/dashboard"
            className="inline-flex items-center gap-2 bg-green-900 text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:bg-green-800 transition"
          >
            Apply to Become a Partner →
          </Link>
        </Reveal>
      </section>

    </div>
  );
}