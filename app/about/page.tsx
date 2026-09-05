"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/siteConfig";

/* ============================================================
   স্ক্রল-এ ভেসে ওঠার ছোট্ট Reveal wrapper — Intersection Observer দিয়ে
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
   হেডারের ৩টি ছবি — মোবাইলে অটো-স্লাইড, পিসিতে একসাথে
   ============================================================ */
const heroGallery = [
  {
    src: "/uploads/header-1st-about.jpg",
    alt: "Farmer Kamol সিরাজগঞ্জ এর প্রথম কৃষক রূপে প্রকাশিত",
    caption: "প্রথম কৃষক রূপে প্রকাশিত ",
  },
  {
    src: "/uploads/header-2nd-about.jpg",
    alt: "Farmer Kamol পশুপালন সারইল গ্রাম",
    caption: "পশু ও প্রকৃতি",
  },
  {
    src: "/uploads/header-3rd-about.jpg",
    alt: "Farmer Kamol ফসলের মাঠ রায়গঞ্জ",
    caption: "ভাতিজার সাথে",
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
   সমন্বিত কৃষির ৩টি ব্লক — ডানে/বামে/ডানে ছবি
   ============================================================ */
const ecosystem = [
  {
    id: 1,
    title: "সমন্বিত কৃষি ও ফসল চাষ",
    shortDesc:
      "ধান, মৌসুমি শাকসবজি ও পশুখাদ্যের ঘাস — একই জমিতে বহুমুখী, প্রাকৃতিক পদ্ধতিতে উৎপাদন, যেখান থেকেই আসে আমাদের খাঁটি সরিষার তেলের কাঁচামাল।",
    fullDesc: `ধান, মৌসুমি শাকসবজি ও পশুখাদ্যের ঘাস — একই জমিতে বহুমুখী, প্রাকৃতিক পদ্ধতিতে উৎপাদন, যেখান থেকেই আসে আমাদের খাঁটি সরিষার তেলের কাঁচামাল।

আমাদের খামারে কোনো কৃত্রিম রাসায়নিক সার বা বিষাক্ত কীটনাশক ব্যবহার করা হয় না। ধান, সরিষা, সবজি ও ঘাস একসাথে চাষ করে মাটির পুষ্টির ভারসাম্য বজায় রাখা হয়। ফসলের অবশিষ্টাংশ পশুখাদ্য হিসেবে ব্যবহৃত হয়, আর পশুর জৈব বর্জ্য আবার মাটিতে ফিরে আসে।

এই সম্পূর্ণ প্রাকৃতিক চক্রের কারণেই আমাদের সরিষার তেল, শাকসবজি ও অন্যান্য ফসল পায় তার আসল স্বাদ ও সর্বোচ্চ পুষ্টিগুণ। বাজারের কেমিক্যালযুক্ত পণ্যের বিপরীতে আমরা দিই সম্পূর্ণ বিষমুক্ত ও খাঁটি কৃষিপণ্য।`,
    image: "/uploads/about-1st-sub.jpg",
    side: "right" as const,
  },
  {
    id: 2,
    title: "পশু ও হাঁস-পাখি পালন",
    shortDesc:
      "দেশি গরু, ছাগল ও চীন হাঁস পালনের মাধ্যমে দুধ, ডিম, মাংস এবং জৈব বর্জ্য উৎপাদিত হয় — যা থেকেই তৈরি হয় আমাদের ভেজালমুক্ত দেশি ঘি।",
    fullDesc: `দেশি গরু, ছাগল ও চীন হাঁস পালনের মাধ্যমে দুধ, ডিম, মাংস এবং জৈব বর্জ্য উৎপাদিত হয় — যা থেকেই তৈরি হয় আমাদের ভেজালমুক্ত দেশি ঘি।

আমাদের গরু-ছাগল ও হাঁস-মুরগি প্রাকৃতিক ঘাস ও ফসলের অবশিষ্টাংশ খেয়ে বেড়ে ওঠে। কোনো হরমোন বা কৃত্রিম খাদ্য সংযোজন করা হয় না। তাই তাদের দুধ থেকে তৈরি ঘি ও ডিম থাকে সম্পূর্ণ খাঁটি ও পুষ্টিকর।

পশুর জৈব বর্জ্য সরাসরি জৈব সার হিসেবে মাটিতে ফিরে যায়, যা পরবর্তী ফসলের উৎপাদনকে আরও উর্বর করে তোলে। এই চক্রই আমাদের সমন্বিত কৃষির অন্যতম মূল শক্তি।`,
    image: "/uploads/about-2nd-sub.jpg",
    side: "left" as const,
  },
  {
    id: 3,
    title: "মাটি ও বর্জ্য পুনর্ব্যবহার",
    shortDesc:
      "পশুর জৈব বর্জ্য জৈব সার হয়ে আবার মাটিতে ফিরে যায়, মাটির উর্বরতা বাড়ায় — আর নতুন ফসলের চক্র শুরু হয় সম্পূর্ণ রাসায়নিকমুক্তভাবে।",
    fullDesc: `পশুর জৈব বর্জ্য জৈব সার হয়ে আবার মাটিতে ফিরে যায়, মাটির উর্বরতা বাড়ায় — আর নতুন ফসলের চক্র শুরু হয় সম্পূর্ণ রাসায়নিকমুক্তভাবে।

আমাদের খামারে কোনো কৃত্রিম সারের প্রয়োজন হয় না। গরু-ছাগলের গোবর ও হাঁস-মুরগির বর্জ্য প্রাকৃতিকভাবে কম্পোস্ট হয়ে মাটিকে পুষ্ট করে। ফলে মাটির প্রাণশক্তি বজায় থাকে এবং ফসলের গুণগত মান অনেক উন্নত হয়।

এই বর্জ্য পুনর্ব্যবহারের মাধ্যমে আমরা শুধু পরিবেশ রক্ষা করি না, বরং সম্পূর্ণ রাসায়নিকমুক্ত ফসল উৎপাদন করতে পারি। মাটি, পশু ও ফসলের এই অবিচ্ছিন্ন সম্পর্কই আমাদের সমন্বিত কৃষির ভিত্তি।`,
    image: "/uploads/about-1st-sub.jpg",
    side: "right" as const,
  },
];

export default function AboutPage() {
  // এখানে See More-এর জন্য স্টেটটি যুক্ত করা হলো
  const [showMore, setShowMore] = useState(false);
  // এটি একটি অবজেক্ট স্টেট, যা প্রতিটি আইডির জন্য আলাদাভাবে true/false ট্র্যাক করবে
const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
const toggleSection = (id: number) => {
  setExpandedSections((prev) => ({
    ...prev,
    [id]: !prev[id], // যে আইডিতে ক্লিক করা হবে, শুধু সেটির অবস্থা উল্টে যাবে (true থাকলে false, false থাকলে true)
  }));
};

  return (
    <main className="bg-white text-gray-800 font-[family-name:var(--font-hind-siliguri)]">
      {/* ===== ১. হেডার — ৩টি ছবি (নাম/ব্যাকগ্রাউন্ড হিরো নেই) ===== */}
      <section className="bg-green-50">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-8 sm:pt-14 sm:pb-10">
          <Reveal className="text-center mb-6 sm:mb-8">
            <p className="text-green-700 text-sm font-bold tracking-wide mb-2">
              আমাদের সম্পর্কে
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 leading-snug">
              সিরাজগঞ্জের মাটি থেকে আপনার রান্নাঘর পর্যন্ত — Farmer Kamol-এর
              যাত্রা
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <MobileHeroSlider />
            <DesktopHeroGrid />
          </Reveal>
        </div>
      </section>


      {/* ===== ২. পরিচিতি — বামে লোগো/নাম, ডানে বিস্তারিত পরিচয় ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <Reveal className="w-full md:w-56 shrink-0 mx-auto md:mx-0">
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-full md:h-56 mx-auto rounded-full md:rounded-2xl overflow-hidden ring-4 ring-green-100 shadow-lg">
              <Image
                src="/uploads/kamol.png"
                alt={`${siteConfig.brand.founderNameBn} - প্রতিষ্ঠাতা, Farmer Kamol`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 208px, 224px"
              />
            </div>
            <div className="text-center md:text-left mt-4">
              <p className="font-bold text-lg text-green-900">
                {siteConfig.brand.founderNameBn}
              </p>
              <p className="text-sm text-gray-500">
                প্রতিষ্ঠাতা, {siteConfig.brand.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {siteConfig.address.village}, {siteConfig.address.locality},{" "}
                {siteConfig.address.region}
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="flex-1">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              কমল কুমার মাহাতো কে?
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] sm:text-base">
              <p>
                <span className="font-semibold text-green-900">
                  কমল কুমার মাহাতো
                </span>
                , যিনি{" "}
                <span className="font-semibold text-green-900">
                  Farmer Kamol
                </span>{" "}
                নামে পরিচিত — সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রামের একজন
                কৃষিভিত্তিক উদ্যোক্তা, যিনি বিশ্বাস করেন খাঁটি খাদ্য মানুষের
                মৌলিক অধিকার।
              </p>
              <p>
                বাংলা সাহিত্যে স্নাতক সম্পন্ন করেছেন। ঢাকায় একটি কুরিয়ার
                প্রতিষ্ঠানে চাকরি করলেও তাঁর শিকড় থেকে যায় গ্রামের মাটিতে।
                নিজেকে পরিচয় দেন{" "}
                <span className="font-semibold text-green-900">
                  “মাটির মানুষ”
                </span>{" "}
                বলে।
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== ৩-৬. ব্যক্তিগত যাত্রা — টাইমলাইন স্টাইল ===== */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-16">
          <Reveal className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
              একটি যাত্রার গল্প
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              শহরের চাকরি থেকে সিরাজগঞ্জের মাটিতে ফেরার গল্প
            </p>
          </Reveal>

          <div className="relative pl-8 sm:pl-10">
            {/* উল্লম্ব টাইমলাইন থ্রেড */}
            <div className="absolute left-[9px] sm:left-[11px] top-2 bottom-2 w-0.5 bg-green-200" />

            {/* ধাপ ১ — শিকড় */}
            <Reveal className="relative mb-12">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-green-600 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                শিকড়
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                সিরাজগঞ্জের সারইল গ্রামে বেড়ে ওঠা
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
                রায়গঞ্জ উপজেলার সারইল গ্রামে জন্ম ও বেড়ে ওঠা। বাংলা সাহিত্যে
                স্নাতক করলেও ছোটবেলা থেকেই মাটি, ফসল আর গ্রামীণ জীবনের প্রতি
                গভীর টান অনুভব করতেন।
              </p>
            </Reveal>

            {/* ধাপ ২ — শহর বনাম টান */}
            <Reveal delay={80} className="relative mb-12">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-green-600 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                শহর বনাম শিকড়
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                ঢাকার চাকরি, কিন্তু মন পড়ে থাকতো গ্রামে
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base mb-3">
                জীবিকার তাগিদে ঢাকায় একটি কুরিয়ার প্রতিষ্ঠানে চাকরি করেছেন,
                কিন্তু প্রতিটি ছুটিতে ফিরে যেতেন গ্রামের সেই চেনা মাটিতে।
              </p>
              <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-green-900 font-semibold text-base sm:text-lg">
                “আমি মাটির মানুষ — শহর আমাকে ধরে রাখতে পারেনি।”
              </blockquote>
            </Reveal>

            {/* ধাপ ৩ — মোড় ঘোরানো মুহূর্ত */}
            <Reveal delay={160} className="relative mb-12">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-green-600 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                মোড় ঘোরানো মুহূর্ত
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                কেন Farmer Kamol শুরু করলেন?
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
                ঢাকায় কাজ করার সময় দেখেছি, শহরের মানুষ কতটা মরিয়া হয়, এক
                বোতল খাঁটি মধু বা ভেজালমুক্ত দেশি ঘি খুঁজে বেড়ায় — অথচ আমাদের
                গ্রামে এই প্রকৃতির আশীর্বাদ হাতের কাছেই। এই দূরত্ব ঘুচিয়ে, কোনো
                মধ্যস্থতাকারী ছাড়া, সরাসরি খামার থেকে মানুষের দরজায় খাঁটি পণ্য
                পৌঁছে দিতেই জন্ম হয় Farmer Kamol-এর।
              </p>
            </Reveal>

            {/* ধাপ ৪ — যাত্রার প্রথম ধাপ */}
            <Reveal delay={240} className="relative">
              <span className="absolute -left-8 sm:-left-10 top-1 w-5 h-5 rounded-full bg-yellow-400 border-4 border-green-50 shadow" />
              <span className="text-xs font-bold text-green-700 tracking-wide">
                অধ্যায় ১ · ফেব্রুয়ারি ২০২৭
              </span>
              <h3 className="text-lg font-bold text-green-900 mt-1 mb-2">
                হাঁস পালন দিয়ে যাত্রা শুরু
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
                এটা এই যাত্রার প্রথম অধ্যায়মাত্র। সময়ের সাথে নতুন নতুন অধ্যায়
                যুক্ত হবে — সেগুলো নিয়মিত প্রকাশিত হবে আমাদের{" "}
                <Link
                  href="/blog"
                  className="text-green-700 font-semibold underline underline-offset-2"
                >
                  ব্লগ পেজে
                </Link>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== ৭. সমন্বিত কৃষি — ডানে/বামে/ডানে ছবি ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <Reveal className="mb-12">
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            কেন সমন্বিত কৃষি?
          </h2>
          <div className="max-w-xl">
  <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
    ফসল, পশু, হাঁস-পাখি ও মাটি — একে অপরের সাথে জড়িয়ে একটা সম্পূর্ণ প্রাকৃতিক চক্র তৈরি করে, যেখান থেকেই আসে আমাদের প্রতিটি খাঁটি কৃষিপণ্য।
    {"\n\n"}
    বাজারে যখন কেমিক্যালের ছড়াছড়ি, তখন সমন্বিত কৃষি আমাদের দেয় সম্পূর্ণ বিষমুক্ত খাবারের নিশ্চয়তা। আমাদের খামারে গবাদি পশুর জৈব সার মাটিকে করে উর্বর, আর সেই সতেজ মাটিতেই কোনো বিষাক্ত কীটনাশক ছাড়া বেড়ে ওঠে প্রতিটি ফসল। মাটির এই প্রাকৃতিক উর্বরতা আর আমাদের কঠোর পরিশ্রমের মেলবন্ধনেই তৈরি হয় Farmer Kamol-এর প্রতিটি খাঁটি পণ্য—যা আপনার ও আপনার পরিবারের সুস্বাস্থ্য নিশ্চিত করে।
    
    {showMore && (
      <>
        {"\n\n"}
        সমন্বিত কৃষিতে কোনো কৃত্রিম রাসায়নিক সার ব্যবহার করা হয় না। আমাদের খামারের হাঁস-মুরগি ও গবাদি পশুর বর্জ্য সরাসরি মাটির উর্বরতা বাড়াতে জৈব সার হিসেবে কাজ করে। আবার সেই মাটিতে ফলে ওঠা ফসলের অবশিষ্টাংশ পশুখাদ্য হিসেবে ব্যবহৃত হয়। এই সম্পূর্ণ প্রাকৃতিক চক্রের কারণেই আমাদের প্রতিটি ফসল পায় তার আসল স্বাদ ও সর্বোচ্চ পুষ্টিগুণ।
        {"\n\n"}
        বর্তমান সময়ে বাজারের অধিকাংশ খাবারই কীটনাশক ও রাসায়নিকের চাদরে ঢাকা। কিন্তু সমন্বিত চাষ পদ্ধতিতে ক্ষতিকর পোকা দমনে আমরা কোনো রাসায়নিক বিষ স্প্রে করি না, বরং প্রাকৃতিক উপায়ে বালাইনাশক ব্যবহার করা হয়। ফলে মাটি, পানি ও পরিবেশ যেমন সুরক্ষিত থাকে, তেমনই আপনার পরিবারের টেবিলে পৌঁছে যায় শতভাগ বিষমুক্ত ও নিরাপদ খাদ্য।
        {"\n\n"}
        একই জমিতে বহুবিধ ফসলের সহাবস্থান আমাদের মাটির প্রাণশক্তিকে ধরে রাখে। এক ফসলী জমির মতো আমাদের খামারের মাটি কখনো ক্লান্ত বা পুষ্টিহীন হয়ে পড়ে না। আর এই সতেজ মাটি থেকেই আমরা সংগ্রহ করি আপনার পছন্দের খাঁটি সরিষার তেল, খাঁটি ঘি, মধু ও দৈনন্দিন পুষ্টিকর কৃষিপণ্য।
      </>
    )}
  </p>

  {/* See More / See Less Button */}
  <button
    onClick={() => setShowMore(!showMore)}
    className="mt-3 text-sm font-bold text-green-700 hover:text-green-900 transition underline focus:outline-none"
  >
    {showMore ? "কম দেখুন" : "আরও পড়ুন (See More)"}
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
                      {expandedSections[item.id]
                        ? "কম দেখুন"
                        : "আরও পড়ুন (See More)"}
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
            <span>চক্র সম্পূর্ণ হয়, আবার নতুন ফসলে ফিরে যায়</span>
          </Reveal>
        </div>
      </section>

      {/* ===== ৮. মিশন ও ভিশন ===== */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
          <Reveal className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-900">
              আমাদের মিশন ও ভিশন
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6">
            <Reveal className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-green-100">
              <span className="text-3xl">🎯</span>
              <h3 className="text-lg font-bold text-green-900 mt-3 mb-2">
                মিশন
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px]">
                সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রাম থেকে সমন্বিত কৃষি পদ্ধতিতে
                উৎপাদিত খাঁটি মধু, দেশি ঘি ও সরিষার তেল — কোনো মধ্যস্থতাকারী
                ছাড়াই, ন্যায্য মূল্যে সরাসরি ভোক্তার দরজায় পৌঁছে দেওয়া আমাদের
                মূল লক্ষ্য।
              </p>
            </Reveal>
            <Reveal
              delay={100}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-green-100"
            >
              <span className="text-3xl">🌱</span>
              <h3 className="text-lg font-bold text-green-900 mt-3 mb-2">
                ভিশন
              </h3>
              <p className="text-gray-700 leading-relaxed text-[15px]">
                Farmer Kamol-কে বাংলাদেশে সততা ও প্রকৃত সমন্বিত কৃষিজীবনের একটি
                বিশ্বস্ত ব্র্যান্ড হিসেবে প্রতিষ্ঠিত করা — শুধু একটি বিক্রয়
                প্ল্যাটফর্ম নয়, বরং কৃষক ও ভোক্তার মধ্যে বিশ্বাসের একটি সেতু
                হয়ে ওঠা।
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== ৯. কৃষির দর্শন + ৫ বছরের স্বপ্ন ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16 grid sm:grid-cols-2 gap-10 sm:gap-0 sm:divide-x sm:divide-gray-200">
        <Reveal className="sm:pr-10">
          <h2 className="text-sm font-bold tracking-wide text-green-700 mb-3">
            কৃষির দর্শন
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            সততা → কৃষির মাধ্যমে স্বাবলম্বিতা → পরিবেশবান্ধব ভবিষ্যৎ। যা বিক্রি
            করি, তা নিজে বিশ্বাস করি। যা উৎপাদন করি, তা নিজে খাই।
          </p>
        </Reveal>
        <Reveal delay={100} className="sm:pl-10">
          <h2 className="text-sm font-bold tracking-wide text-green-700 mb-3">
            ভবিষ্যৎ স্বপ্ন (৫ বছর)
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            বাংলাদেশে Farmer Kamol একটি পরিচিত ও বিশ্বস্ত নাম হয়ে উঠবে — শুধু
            পণ্য বিক্রির ব্র্যান্ড নয়, সততা ও বাস্তব কৃষিজীবনের উদাহরণ। একদিন
            পুরোদমে পরিবারের জমিতে ফিরে এসে সমন্বিত কৃষিকে আরও বড় পরিসরে দেখাতে
            চাই।
          </p>
        </Reveal>
      </section>

      {/* ===== ১০. প্রমাণ ও বিশ্বাস — YouTube / ভিডিও / ছবি ===== */}
      <section className="bg-green-50 border-y border-green-100">
        <div className="max-w-3xl mx-auto px-4 py-14 sm:py-16 text-center">
          <Reveal>
            <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-3">
              শুধু বিশ্বাস নয় — দেখুন কৃষকের বাস্তব কাজ
            </h2>
            <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-md mx-auto">
              কোথা থেকে এসেছে, কীভাবে উৎপাদিত হয়েছে — নিজের চোখে দেখুন ভিডিও ও
              ছবিতে।
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
              YouTube চ্যানেল
            </a>
            <Link
              href="/media/video"
              className="inline-flex items-center gap-2 bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold px-5 py-2.5 rounded-full text-sm transition"
            >
              ভিডিও গ্যালারি
            </Link>
            <Link
              href="/media/image"
              className="inline-flex items-center gap-2 bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold px-5 py-2.5 rounded-full text-sm transition"
            >
              ছবির গ্যালারি
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== ১১. শেষ CTA ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <Reveal className="bg-white border border-gray-100 rounded-2xl px-6 py-10 sm:py-12 text-center shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-2">
            খামারের স্বাদ আপনার টেবিলে
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-7">
            খাঁটি মধু, দেশি ঘি, সরিষার তেল — সরাসরি অর্ডার করুন।
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-full text-sm transition"
            >
              পণ্য দেখুন
            </Link>
            <Link
              href="/contact"
              className="border border-green-700 text-green-700 hover:bg-green-700 hover:text-white font-bold px-6 py-3 rounded-full text-sm transition"
            >
              যোগাযোগ
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
