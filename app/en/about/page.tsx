"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

const headerImages = [
  "header-1st-about.jpg",
  "header-2nd-about.jpg",
  "header-3rd-about.jpg",
];

const pillars = [
  {
    id: 1,
    emoji: "🌱",
    title: "What Is Integrated Farming?",
    image: "/uploads/about-1st-sub.jpg",
    imageAlt: `Integrated farming - ${siteConfig.brand.nameEn}`,
    preview:
      "Running crops, fish, livestock, and poultry on the same farm so that the waste of one becomes the benefit of another — a natural cycle.",
    points: [
      "Diverse output: vegetables, fish, milk, eggs, and meat from one farm",
      "Waste reuse: cow dung → fertilizer, duck droppings → fish feed",
      "Lower costs, more income streams, less risk",
      "Organic methods that protect the environment",
    ],
    quote: "One plot, one farm → many outputs + lower cost + higher profit",
  },
  {
    id: 2,
    emoji: "🐄",
    title: "Livestock Rearing",
    image: "/uploads/about-2nd-sub.jpg",
    imageAlt: `Livestock rearing - ${siteConfig.brand.nameEn}`,
    preview:
      "Not only milk, meat, or eggs — livestock also supports economic self-reliance, organic fertilizer, and energy.",
    points: [
      "Cattle & buffalo: milk, dung, and organic fertilizer",
      "Goats & sheep: low-cost, faster returns",
      "Ducks & poultry: eggs, meat, and extra income",
      "Regular veterinary care and vaccination",
    ],
    quote:
      "Livestock isn't just an asset — with proper care, it becomes the foundation of success.",
  },
  {
    id: 3,
    emoji: "🌾",
    title: "Crop Cultivation",
    image: "/uploads/about-3rd-sub.jpg",
    imageAlt: `Crop cultivation - ${siteConfig.brand.nameEn}`,
    preview:
      "The backbone of our agriculture-based economy. Modern methods and good management mean higher yields from smaller plots.",
    points: [
      "Rice, wheat, maize — staple food grains",
      "Vegetables — strong in nutrition and market value",
      "Napier/Guinea grass — planned livestock feed",
      "Organic fertilizer and eco-friendly irrigation",
    ],
    quote: "A dream sown in seed, a golden harvest grown in sweat.",
  },
];

const stats = [
  { label: "Farm to door", value: "Direct" },
  { label: "Middlemen", value: "0" },
  { label: "Process", value: "Transparent" },
  { label: "Location", value: "Sirajganj" },
];

export default function AboutPageEn() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <main className="bg-stone-50 min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="grid grid-cols-3 h-full">
            {headerImages.map((img, i) => (
              <div
                key={i}
                className="relative h-full min-h-[220px] sm:min-h-[320px]"
              >
                <Image
                  src={`/uploads/${img}`}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="33vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/80 via-green-900/75 to-green-950/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-24 sm:pb-20 text-center">
          <p className="inline-flex items-center gap-2 text-yellow-300 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4">
            <span className="w-8 h-px bg-yellow-400/80" />
            Who we are
            <span className="w-8 h-px bg-yellow-400/80" />
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            A Story of the Soil
          </h1>
          <p className="text-green-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {siteConfig.brand.sloganEn} — pure natural products from Sarail
            village, Raiganj, Sirajganj, with no middlemen.
          </p>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative z-20 -mt-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl shadow-md border border-green-100 px-4 py-4 text-center"
            >
              <div className="text-xl sm:text-2xl font-extrabold text-green-800">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOUNDER STORY ===== */}
      <section className="max-w-5xl mx-auto px-4 py-14 sm:py-16">
        <div className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-[280px] bg-gradient-to-b from-green-800 to-green-900 p-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-4 ring-yellow-400 shadow-xl">
                <Image
                  src="/uploads/kamol.png"
                  alt={`${siteConfig.brand.founderName} - Founder`}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              </div>
              <h2 className="mt-5 text-white font-bold text-lg">
                {siteConfig.brand.founderName}
              </h2>
              <p className="text-yellow-300 text-sm mt-1">
                Founder · {siteConfig.brand.nameEn}
              </p>
              <p className="text-green-200 text-xs mt-3 leading-relaxed">
                {siteConfig.address.villageEn}, {siteConfig.address.localityEn},{" "}
                {siteConfig.address.regionEn}
              </p>
            </div>

            <div className="flex-1 p-6 sm:p-8 md:p-10">
              <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <span>🌾</span> Our Story
              </h3>
              <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] sm:text-base">
                <p>
                  I&apos;m Kamol. I graduated in Bengali Literature, but my real
                  identity isn&apos;t on the pages of a book — it&apos;s in the
                  soil of Sarail village, Raiganj, Sirajganj. I call myself a{" "}
                  <span className="font-semibold text-green-800">
                    &quot;person of the soil&quot;
                  </span>{" "}
                  — even while working in Dhaka, my roots stayed in the village
                  fields and on the farm.
                </p>
                <p>
                  While working at a courier company in Dhaka, I saw how
                  desperately city people searched for pure honey or
                  adulteration-free ghee. Yet in our village these gifts of
                  nature are right at hand. {siteConfig.brand.nameEn} was born
                  to close that gap — straight from the farm to your door, with
                  no middlemen.
                </p>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🎯</span> Mission
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    To deliver pure, adulteration-free natural food products,
                    produced through a transparent process, directly from the
                    farmer&apos;s home to every home in Bangladesh.
                  </p>
                </div>
                <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-5">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🔭</span> Vision
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                    <li>A reliable market for rural farmers</li>
                    <li>Fight adulteration with genuinely pure products</li>
                    <li>Make farming appealing to the next generation</li>
                    <li>One day return fully to the family land</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PILLARS ===== */}
      <section className="max-w-5xl mx-auto px-4 pb-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-900">
            The Foundations of Our Work
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Integrated farming · Livestock · Crops — one connected cycle
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {pillars.map((p, idx) => {
            const isOpen = openId === p.id;
            const reverse = idx % 2 === 1;
            return (
              <article
                key={p.id}
                className={`bg-white rounded-3xl border border-green-100 shadow-sm overflow-hidden flex flex-col ${
                  reverse ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                <div className="relative w-full md:w-72 lg:w-80 aspect-[4/3] md:aspect-auto md:min-h-[260px] shrink-0">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-950/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-transparent" />
                  <span className="absolute bottom-3 left-3 md:hidden text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    {p.emoji} {p.title}
                  </span>
                </div>

                <div className="flex-1 p-6 sm:p-8 flex flex-col">
                  <h3 className="text-xl font-bold text-green-900 mb-3 hidden md:flex items-center gap-2">
                    <span>{p.emoji}</span> {p.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-[15px]">
                    {p.preview}
                  </p>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "max-h-[500px] opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="space-y-2 text-sm text-gray-700">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex gap-2">
                          <span className="text-green-600 shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm font-semibold text-green-800 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
                      “{p.quote}”
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : p.id)}
                    className="mt-5 self-start text-sm font-bold text-yellow-700 hover:text-yellow-800 transition flex items-center gap-1"
                  >
                    {isOpen ? "▲ Show less" : "▾ Read more"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ===== TRUST / YOUTUBE ===== */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-3xl bg-gradient-to-br from-green-800 via-green-900 to-green-950 text-white p-8 sm:p-10 text-center shadow-lg">
          <div className="text-4xl mb-3">🎬</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Transparency Builds Trust
          </h2>
          <p className="text-green-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
            We show how every product is made on our YouTube channel{" "}
            <span className="text-yellow-300 font-semibold">
              {siteConfig.brand.youtubeHandle}
            </span>{" "}
            — watch, then buy with confidence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-full text-sm transition shadow"
            >
              Visit YouTube Channel
            </a>
            <Link
              href="/en/media/video"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition"
            >
              Our Videos
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl border border-green-100 p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-green-900 mb-2">
            Farm Flavor at Your Table
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Pure honey, ghee, mustard oil — order directly or get in touch.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/en/shop"
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-6 py-2.5 rounded-full text-sm transition shadow-sm"
            >
              Shop Products
            </Link>
            <Link
              href="/en/contact"
              className="bg-green-800 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition"
            >
              Contact
            </Link>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-green-700 text-green-800 hover:bg-green-50 font-bold px-6 py-2.5 rounded-full text-sm transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
