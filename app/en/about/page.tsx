"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

/* ============================================================
   Small scroll Reveal wrapper — via Intersection Observer
   ============================================================ */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ============================================================
   Header's 3 images — auto-slide on mobile, all at once on desktop
   ============================================================ */
const heroGallery = [
  {
    src: "/uploads/header-1st-about.jpg",
    alt: `${siteConfig.brand.nameEn} - first introduced as a farmer, Sirajganj`,
    caption: "First introduced as a farmer",
  },
  {
    src: "/uploads/header-2nd-about.jpg",
    alt: `${siteConfig.brand.nameEn} livestock rearing, Sarail village`,
    caption: "Livestock & nature",
  },
  {
    src: "/uploads/header-3rd-about.jpg",
    alt: `${siteConfig.brand.nameEn} crop field, Raiganj`,
    caption: "With my nephew",
  },
];

function MobileHeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % heroGallery.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="md:hidden relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
      {heroGallery.map((img, i) => (
        <div
          key={img.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <p className="absolute bottom-3 left-4 text-white text-sm font-semibold drop-shadow">
            {img.caption}
          </p>
        </div>
      ))}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {heroGallery.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-5 bg-yellow-400" : "w-1.5 bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function DesktopHeroGrid() {
  return (
    <div className="hidden md:grid grid-cols-3 gap-5">
      {heroGallery.map((img) => (
        <div
          key={img.src}
          className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md"
        >
          <div className="absolute inset-0 animate-kenburns">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="33vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <p className="absolute bottom-3 left-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow">
            {img.caption}
          </p>
        </div>
      ))}
      <style jsx>{`
        @keyframes kenburns {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.07);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-kenburns {
          animation: kenburns 14s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   Integrated farming — 3 blocks, image right / left / right
   ============================================================ */
const ecosystem = [
  {
    id: 1,
    title: "Integrated Farming & Crop Cultivation",
    shortDesc:
      "Rice, seasonal vegetables, and livestock-feed grass — grown together on the same land through natural methods. This is also where the raw material for our pure mustard oil comes from.",
    fullDesc: `Rice, seasonal vegetables, and livestock-feed grass — grown together on the same land through natural methods. This is also where the raw material for our pure mustard oil comes from.

On our farm we use no artificial chemical fertilizers or toxic pesticides. By growing rice, mustard, vegetables and grass together, we maintain the natural nutrient balance of the soil. Crop residues become animal feed, and animal waste returns to the soil as organic fertilizer.

Because of this complete natural cycle, our mustard oil, vegetables and other crops retain their true taste and maximum nutritional value. Against the chemical-laden products of the market, we offer completely toxin-free and pure agricultural products.`,
    image: "/uploads/about-1st-sub.jpg",
    side: "right" as const,
  },
  {
    id: 2,
    title: "Livestock & Poultry Rearing",
    shortDesc:
      "Native cattle, goats, and Chinese ducks give us milk, eggs, meat, and organic waste — the very source of our adulteration-free desi ghee.",
    fullDesc: `Native cattle, goats, and Chinese ducks give us milk, eggs, meat, and organic waste — the very source of our adulteration-free desi ghee.

Our cattle, goats and ducks grow on natural grass and crop residues. No hormones or artificial feed additives are used. That is why the ghee made from their milk and the eggs they produce remain completely pure and nutritious.

The organic waste from the animals returns directly to the soil as fertilizer, further enriching the next crop cycle. This closed loop is one of the core strengths of our integrated farming system.`,
    image: "/uploads/about-2nd-sub.jpg",
    side: "left" as const,
  },
  {
    id: 3,
    title: "Soil & Waste Recycling",
    shortDesc:
      "Organic waste from livestock returns to the soil as natural fertilizer, restoring its fertility — and a new crop cycle begins, completely free of chemicals.",
    fullDesc: `Organic waste from livestock returns to the soil as natural fertilizer, restoring its fertility — and a new crop cycle begins, completely free of chemicals.

On our farm there is no need for synthetic fertilizers. Cow dung and poultry waste compost naturally and nourish the soil. As a result, the soil’s life force is preserved and the quality of the crops improves significantly.

Through this waste recycling we not only protect the environment but also produce completely chemical-free crops. The unbroken relationship between soil, animals and crops is the foundation of our integrated farming.`,
    image: "/uploads/about-1st-sub.jpg",
    side: "right" as const,
  },
];

export default function AboutPageEn() {
  // See More state for "Why Integrated Farming?"
  const [showMore, setShowMore] = useState(false);

  // Separate expand/collapse for each ecosystem card
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});
  const toggleSection = (id: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="bg-white text-gray-800">
      {/* ===== 1. HEADER — 3 images (no name/background hero) ===== */}
      <section className="bg-green-50">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-8 sm:pt-14 sm:pb-10">
          <Reveal className="text-center mb-6 sm:mb-8">
            <p className="text-green-700 text-sm font-bold tracking-wide mb-2">
              About Us
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 leading-snug">
              From the Soil of Sirajganj to Your Kitchen — The{" "}
              {siteConfig.brand.nameEn} Journey
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <MobileHeroSlider />
            <DesktopHeroGrid />
          </Reveal>
        </div>
      </section>

      {/* ===== 2. IDENTITY — photo/name left, detailed intro right ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <Reveal className="w-full md:w-56 shrink-0 mx-auto md:mx-0">
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-full md:h-56 mx-auto rounded-full md:rounded-2xl overflow-hidden ring-4 ring-green-100 shadow-lg">
              <Image
                src="/uploads/kamol.png"
                alt={`${siteConfig.brand.founderName} - Founder, ${siteConfig.brand.nameEn}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 208px, 224px"
              />
            </div>
            <div className="text-center md:text-left mt-4">
              <p className="font-bold text-lg text-green-900">
                {siteConfig.brand.founderName}
              </p>
              <p className="text-sm text-gray-500">
                Founder, {siteConfig.brand.nameEn}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {siteConfig.address.villageEn}, {siteConfig.address.localityEn},{" "}
                {siteConfig.address.regionEn}
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="flex-1">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Who Is {siteConfig.brand.founderName}?
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] sm:text-base">
              <p>
                <span className="font-semibold text-green-900">
                  {siteConfig.brand.founderName}
                </span>
                , known as{" "}
                <span className="font-semibold text-green-900">
                  {siteConfig.brand.nameEn}
                </span>{" "}
                — an agriculture-based entrepreneur from Sarail village,
                Raiganj, Sirajganj, who believes pure, unadulterated food is a
                basic human right.
              </p>
              <p>
                He holds a bachelor&apos;s degree in Bengali Literature. Though
                he worked at a courier company in Dhaka, his roots never left
                the village soil. He calls himself a{" "}
                <span className="font-semibold text-green-900">
                  &quot;person of the soil&quot;
                </span>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 3-6. PERSONAL JOURNEY — timeline style ===== */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-16">
          <Reveal className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
              A Story of the Journey
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              From a city job back to the soil of Sirajganj
            </p>
          </Reveal>

          <div className="relative pl-8 sm:pl-10">
            {/* Vertical timeline thread */}
            <div className="absolute left-[9px] sm:left-[11px] top-2 bottom-2 w-0.5 bg-green-200" />

            {/* Step 1 — Roots */}
            <Reveal className="relative mb-12">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-green-600 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                Roots
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                Growing Up in Sarail Village, Sirajganj
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
                Born and raised in Sarail village, Raiganj upazila. Though he
                graduated in Bengali Literature, he felt a deep pull toward
                the soil, the crops, and rural life since childhood.
              </p>
            </Reveal>

            {/* Step 2 — City vs. Roots */}
            <Reveal delay={80} className="relative mb-12">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-green-600 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                City vs. Roots
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                A Job in Dhaka, but the Heart Stayed in the Village
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-3">
                For a living, he worked at a courier company in Dhaka — but
                every holiday, he returned to the familiar soil of the
                village.
              </p>
              <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-green-900 font-semibold text-base sm:text-lg">
                &quot;I&apos;m a person of the soil — the city could never
                hold me.&quot;
              </blockquote>
            </Reveal>

            {/* Step 3 — Turning point */}
            <Reveal delay={160} className="relative mb-12">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-green-600 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                Turning Point
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                Why {siteConfig.brand.nameEn} Began
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
                While working in Dhaka, he saw how desperately city people
                searched for a single bottle of pure honey or
                adulteration-free desi ghee — yet in his own village, these
                gifts of nature were right at hand. To close that gap, with
                no middlemen, delivering pure products straight from the farm
                to people&apos;s doors — that is how {siteConfig.brand.nameEn}{" "}
                was born.
              </p>
            </Reveal>

            {/* Step 4 — First step of the journey */}
            <Reveal delay={240} className="relative">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-yellow-400 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                Chapter 1 · February 2027
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                The Journey Began with Duck Rearing
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
                This is only the first chapter of this journey. New chapters
                will be added over time — published regularly on our{" "}
                <Link
                  href="/en/blog"
                  className="text-green-700 font-semibold underline underline-offset-2"
                >
                  blog page
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== 7. INTEGRATED FARMING — image right/left/right ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <Reveal className="mb-12">
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Why Integrated Farming?
          </h2>
          <div className="max-w-xl">
            <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
              Crops, livestock, poultry, and soil — all interwoven into one
              complete natural cycle, the very source of every pure
              agricultural product we offer.
              {"\n\n"}
              When the market is flooded with chemicals, integrated farming
              gives us the assurance of completely toxin-free food. On our
              farm, livestock manure enriches the soil, and every crop grows
              in that living soil without any poisonous pesticides. The
              natural fertility of the soil combined with our hard work
              creates every pure product of {siteConfig.brand.nameEn} — ensuring
              the good health of you and your family.
              {showMore && (
                <>
                  {"\n\n"}
                  In integrated farming we use no artificial chemical
                  fertilizers. The waste from our ducks, chickens and cattle
                  directly improves soil fertility as organic manure. In turn,
                  the crop residues grown on that soil become animal feed.
                  Because of this complete natural cycle, every crop retains
                  its true taste and maximum nutritional value.
                  {"\n\n"}
                  Most food in today&apos;s market is covered in a layer of
                  pesticides and chemicals. But in our integrated system we do
                  not spray any chemical poison to control pests; instead we
                  use natural methods of pest management. As a result, soil,
                  water and the environment stay protected, while 100%
                  toxin-free and safe food reaches your family&apos;s table.
                  {"\n\n"}
                  Growing multiple crops together on the same land keeps the
                  soil&apos;s life force alive. Unlike monoculture fields, the
                  soil on our farm never becomes exhausted or depleted of
                  nutrients. From this living soil we collect the pure
                  mustard oil, pure ghee, honey and everyday nutritious
                  agricultural products you love.
                </>
              )}
            </p>

            {/* See More / See Less Button */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="mt-3 text-sm font-bold text-green-700 hover:text-green-900 transition underline focus:outline-none"
            >
              {showMore ? "See Less" : "See More"}
            </button>
          </div>
        </Reveal>

        <div className="flex flex-col gap-14 sm:gap-16">
          {ecosystem.map((item, idx) => (
            <div key={item.id}>
              <Reveal>
                <div
                  className={`flex flex-col md:flex-row gap-6 md:gap-10 items-center ${
                    item.side === "right" ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative w-full md:w-72 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-md group">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 288px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <span className="text-xs font-bold text-green-700 tracking-wide">
                      {String(item.id).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl font-bold text-green-900 mt-1 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                      {expandedSections[item.id]
                        ? item.fullDesc
                        : item.shortDesc}
                    </p>
                    <button
                      onClick={() => toggleSection(item.id)}
                      className="mt-3 text-sm font-bold text-green-700 hover:text-green-900 transition underline focus:outline-none"
                    >
                      {expandedSections[item.id] ? "See Less" : "See More"}
                    </button>
                  </div>
                </div>
              </Reveal>

              {idx < ecosystem.length - 1 && (
                <div className="flex justify-center mt-8">
                  <span className="text-green-700 text-lg">↓</span>
                </div>
              )}
            </div>
          ))}

          <Reveal className="flex items-center justify-center gap-2 pt-2 text-sm text-gray-500">
            <span className="text-green-700">↺</span>
            <span>The cycle completes, and returns to a new crop</span>
          </Reveal>
        </div>
      </section>

      {/* ===== 8. MISSION & VISION ===== */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
          <Reveal className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
              Our Mission &amp; Vision
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            <Reveal className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-green-100">
              <span className="text-3xl">🎯</span>
              <h3 className="text-lg font-bold text-green-900 mt-3 mb-2">
                Mission
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px]">
                Delivering pure honey, desi ghee, and mustard oil — produced
                through integrated farming in Sarail village, Raiganj,
                Sirajganj — directly to the consumer&apos;s door at a fair
                price, with no middlemen. That is our core goal.
              </p>
            </Reveal>
            <Reveal
              delay={100}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-green-100"
            >
              <span className="text-3xl">🌱</span>
              <h3 className="text-lg font-bold text-green-900 mt-3 mb-2">
                Vision
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px]">
                To establish {siteConfig.brand.nameEn} as Bangladesh&apos;s
                trusted brand for honesty and genuine integrated farming — not
                just a sales platform, but a bridge of trust between farmer
                and consumer.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== 9. FARMING PHILOSOPHY + 5-YEAR DREAM ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16 grid sm:grid-cols-2 gap-10 sm:gap-0 sm:divide-x sm:divide-gray-200">
        <Reveal className="sm:pr-10">
          <h2 className="text-sm font-bold tracking-wide text-green-700 mb-3">
            Farming Philosophy
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            Honesty → self-reliance through farming → an eco-friendly future.
            What I sell, I believe in myself. What I produce, I eat myself.
          </p>
        </Reveal>
        <Reveal delay={100} className="sm:pl-10">
          <h2 className="text-sm font-bold tracking-wide text-green-700 mb-3">
            Future Dream (5 Years)
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            {siteConfig.brand.nameEn} will become a familiar, trusted name
            across Bangladesh — not just a brand selling products, but an
            example of honesty and a real farming life. One day, returning
            fully to the family land, to show integrated farming on an even
            bigger scale.
          </p>
        </Reveal>
      </section>

      {/* ===== 10. PROOF & TRUST — YouTube / Video / Photos ===== */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-16 text-center">
          <Reveal>
            <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-3">
              Don&apos;t Just Trust Us — See the Farmer&apos;s Real Work
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
              See with your own eyes where it comes from and how it&apos;s
              produced — in our videos and photos.
            </p>
          </Reveal>
          <Reveal
            delay={100}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold px-5 py-2.5 rounded-full text-sm transition"
            >
              YouTube Channel
            </a>
            <Link
              href="/en/media/video"
              className="inline-flex items-center gap-2 bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold px-5 py-2.5 rounded-full text-sm transition"
            >
              Video Gallery
            </Link>
            <Link
              href="/en/media/image"
              className="inline-flex items-center gap-2 bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold px-5 py-2.5 rounded-full text-sm transition"
            >
              Photo Gallery
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== 11. FINAL CTA ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <Reveal className="bg-white border border-gray-100 rounded-2xl px-6 py-10 sm:py-12 text-center shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-2">
            Farm Flavor at Your Table
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-7">
            Pure honey, desi ghee, mustard oil — order directly today.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/en/shop"
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-full text-sm transition"
            >
              Shop Products
            </Link>
            <Link
              href="/en/contact"
              className="border border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold px-6 py-3 rounded-full text-sm transition"
            >
              Contact
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}