"use client"

import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/lib/siteConfig"

const heroGallery = [
  {
    src: "/uploads/header-1st-about.jpg",
    alt: "Farmer Kamol খামারের মাঠ",
    caption: "খামারের মাঠ",
  },
  {
    src: "/uploads/header-2nd-about.jpg",
    alt: "Farmer Kamol পশুপালন",
    caption: "পশু ও প্রকৃতি",
  },
  {
    src: "/uploads/header-3rd-about.jpg",
    alt: "Farmer Kamol ফসলের মাঠ",
    caption: "ফসলের মাঠ",
  },
]

const ecosystem = [
  {
    id: 1,
    title: "ফসল চাষ",
    desc: "ধান, শাকসবজি ও পশুখাদ্যের ঘাস — একই জমিতে বহুমুখী উৎপাদন।",
    image: "/uploads/about-1st-sub.jpg",
    side: "left" as const,
  },
  {
    id: 2,
    title: "পশু ও হাঁস-পাখি পালন",
    desc: "দুধ, ডিম, মাংস এবং জৈব বর্জ্য — যা আবার মাটিতে ফিরে যায়।",
    image: "/uploads/about-2nd-sub.jpg",
    side: "right" as const,
  },
  {
    id: 3,
    title: "মাটি ও বর্জ্য পুনর্ব্যবহার",
    desc: "জৈব সার হয়ে আবার নতুন ফসলে ফিরে আসে — চক্র সম্পূর্ণ হয়।",
    image: "/uploads/about-3rd-sub.jpg",
    side: "left" as const,
  },
]

export default function AboutPage() {
  return (
    <main className="bg-[#FAF9F5] min-h-screen text-gray-800">
      {/* ===== HERO + ৩টি ছবি ===== */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0">
          <Image
            src="/uploads/header-1st-about.jpg"
            alt="Farmer Kamol খামার"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/80 to-green-900/60" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 pb-8 sm:pt-20 sm:pb-10 text-center">
          <p className="text-yellow-300 text-sm font-semibold mb-3 tracking-wide">
            Kamol Kumar Mahato · কৃষক কমল
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3">
            Kamol Kumar Mahato — Farmer Kamol-এর গল্প
          </h1>
          <p className="text-green-100 text-base sm:text-lg mb-5">
            খামার থেকে আপনার দরজায়
          </p>
          <span className="block w-14 h-1 bg-yellow-400 rounded-full mx-auto" />
        </div>

        {/* Hero-এর ভিতরে ৩টি ছবি */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pb-10 sm:pb-14">
          {/* Desktop */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {heroGallery.map((img) => (
              <div
                key={img.src}
                className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-lg"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 33vw, 300px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <p className="absolute bottom-3 left-3 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow">
                  {img.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile swipe */}
          <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 scrollbar-hide">
            {heroGallery.map((img) => (
              <div
                key={img.src}
                className="snap-start shrink-0 w-[82%] rounded-xl overflow-hidden aspect-[4/3] relative shadow-md"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="82vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <p className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow">
                  {img.caption}
                </p>
              </div>
            ))}
          </div>
          <p className="md:hidden text-center text-xs text-green-200/80 mt-2">
            ← সোয়াইপ করুন →
          </p>
        </div>
      </section>

      {/* ===== কমল কুমার মাহাতো কে? ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-56 shrink-0 mx-auto md:mx-0">
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-full md:h-56 mx-auto rounded-full md:rounded-2xl overflow-hidden ring-4 ring-white shadow-lg">
              <Image
                src="/uploads/kamol.png"
                alt={`${siteConfig.brand.founderNameBn} - প্রতিষ্ঠাতা`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 208px, 224px"
              />
            </div>
            <div className="text-center md:text-left mt-4">
              <p className="font-bold text-lg text-green-900">
                {siteConfig.brand.founderNameBn}
              </p>
              <p className="text-sm text-gray-500">প্রতিষ্ঠাতা, {siteConfig.brand.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {siteConfig.address.village}, {siteConfig.address.locality},{" "}
                {siteConfig.address.region}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              কমল কুমার মাহাতো কে?
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] sm:text-base">
              <p>
                <span className="font-semibold text-green-900">
                  কমল কুমার মাহাতো (কমল কুমার মাহাতো)
                </span>
                , যিনি{" "}
                <span className="font-semibold text-green-900">Farmer Kamol</span>{" "}
                নামে পরিচিত — সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রামের একজন কৃষিভিত্তিক
                উদ্যোক্তা।
              </p>
              <p>
                বাংলা সাহিত্যে স্নাতক করেছেন। ঢাকায় একটি কুরিয়ার প্রতিষ্ঠানে চাকরি
                করলেও শিকড় থেকে যায় গ্রামের মাটিতে। নিজেকে বলেন{" "}
                <span className="font-semibold text-green-900">“মাটির মানুষ”</span>।
              </p>
              <p>
                শহরের চাকরির পাশাপাশি নিজ গ্রামের খামারে ফিরে এসে সমন্বিত কৃষি শুরু
                করেছেন। লক্ষ্য একটাই — খাঁটি প্রাকৃতিক পণ্য সরাসরি কৃষকের হাত থেকে
                মানুষের টেবিলে পৌঁছে দেওয়া।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== কেন Farmer Kamol শুরু করলেন? ===== */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            কেন Kamol Kumar Mahato Farmer Kamol শুরু করলেন?
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] sm:text-base">
            <p>
              ঢাকায় কাজ করার সময় দেখেছি, শহরের মানুষ কতটা মরিয়া এক বোতল খাঁটি মধু
              বা ভেজালমুক্ত ঘি খুঁজে পেতে। অথচ আমাদের গ্রামে এই প্রকৃতির আশীর্বাদ
              হাতের কাছেই।
            </p>
            <p>
              এই দূরত্ব ঘুচিয়ে দিতেই জন্ম{" "}
              <span className="font-semibold text-green-900">Farmer Kamol</span>
              -এর। লক্ষ্য ছিল দুটো — মানুষ যেন নিরাপদ ও খাঁটি কৃষিপণ্য পায়, আর
              কৃষকের পরিশ্রম সরাসরি সামনে আসে। কোনো মধ্যস্থতাকারী ছাড়া, সরাসরি
              খামার থেকে আপনার দরজায়।
            </p>
          </div>
        </div>
      </section>

      {/* ===== শূন্য থেকে কৃষির পথে যাত্রা ===== */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <span className="text-xs font-bold text-green-700 tracking-wide">
          অধ্যায় ১ · ফেব্রুয়ারি ২০২৭
        </span>
        <h2 className="text-2xl font-bold text-green-900 mt-2 mb-4">
          শূন্য থেকে কৃষির পথে যাত্রা
        </h2>
        <p className="text-gray-700 leading-relaxed text-[15px] sm:text-base">
          হাঁস পালন দিয়ে যাত্রা শুরু। এটা গল্পের প্রথম অধ্যায়মাত্র। সময়ের সাথে
          নতুন অধ্যায় যোগ হবে — সেগুলো Blog / Journal-এ প্রকাশিত হবে, এই পেজে নয়।
        </p>
        <div className="mt-5 border-l-2 border-yellow-400 pl-4 text-sm text-gray-500">
          পরবর্তী অধ্যায়গুলো → Blog / Journal-এ যুক্ত হবে
        </div>
      </section>

      {/* ===== কেন সমন্বিত কৃষি (Alternating layout) ===== */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            কেন সমন্বিত কৃষি?
          </h2>
          <p className="text-gray-600 mb-12 max-w-xl text-[15px] leading-relaxed">
            ফসল, পশু, হাঁস-পাখি ও মাটি — একে অপরের সাথে জড়িয়ে একটা প্রাকৃতিক চক্র
            তৈরি করে।
          </p>

          <div className="flex flex-col gap-12 sm:gap-16">
            {ecosystem.map((item, idx) => (
              <div key={item.id}>
                <div
                  className={`flex flex-col md:flex-row gap-6 md:gap-10 items-center ${
                    item.side === "right" ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative w-full md:w-72 aspect-[4/3] rounded-xl overflow-hidden shrink-0 shadow-md group">
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
                    <p className="text-gray-600 text-[15px] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {idx < ecosystem.length - 1 && (
                  <div className="flex justify-center mt-8">
                    <span className="text-green-700 text-lg">↓</span>
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-gray-500">
              <span className="text-green-700">↺</span>
              <span>চক্র সম্পূর্ণ হয়, আবার নতুন ফসলে ফিরে যায়</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== কৃষির দর্শন + ৫ বছরের স্বপ্ন ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 grid sm:grid-cols-2 gap-10 sm:gap-0 sm:divide-x sm:divide-gray-200">
        <div className="sm:pr-10">
          <h2 className="text-sm font-bold tracking-wide text-green-700 mb-3">
            কৃষির দর্শন
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            সততা → কৃষির মাধ্যমে স্বাবলম্বিতা → পরিবেশবান্ধব ভবিষ্যৎ।  
            যা বিক্রি করি, তা নিজে বিশ্বাস করি। যা উৎপাদন করি, তা নিজে খাই।
          </p>
        </div>
        <div className="sm:pl-10">
          <h2 className="text-sm font-bold tracking-wide text-green-700 mb-3">
            ভবিষ্যৎ স্বপ্ন (৫ বছর)
          </h2>
          <p className="text-gray-700 text-[15px] leading-relaxed">
            বাংলাদেশে Farmer Kamol একটি পরিচিত ও বিশ্বস্ত নাম হয়ে উঠবে — শুধু পণ্য
            বিক্রির ব্র্যান্ড নয়, সততা ও বাস্তব কৃষিজীবনের উদাহরণ। একদিন পুরোদমে
            পরিবারের জমিতে ফিরে এসে সমন্বিত কৃষিকে আরও বড় পরিসরে দেখাতে চাই।
          </p>
        </div>
      </section>

      {/* ===== YouTube Trust ===== */}
      <section className="relative bg-green-900 text-white overflow-hidden">
        <div className="relative max-w-2xl mx-auto px-4 py-14 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            শুধু বিশ্বাস নয় — দেখুন কৃষকের বাস্তব কাজ
          </h2>
          <p className="text-green-100 text-sm sm:text-base mb-7 max-w-md mx-auto">
            কোথা থেকে এসেছে, কীভাবে উৎপাদিত হয়েছে — YouTube ভিডিওতে দেখুন।
          </p>
          <a
            href={siteConfig.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-6 py-3 rounded-full text-sm transition"
          >
            YouTube চ্যানেল দেখুন
          </a>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-16">
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-10 sm:py-12 text-center shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-green-900 mb-2">
            খামারের স্বাদ আপনার টেবিলে
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-7">
            খাঁটি মধু, ঘি, সরিষার তেল — সরাসরি অর্ডার করুন।
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
        </div>
      </section>
    </main>
  )
}