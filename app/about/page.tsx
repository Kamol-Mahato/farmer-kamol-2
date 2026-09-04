"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/lib/siteConfig"

const galleryImages = [
  {
    src: "/uploads/header-1st-about.jpg",
    alt: "Farmer Kamol খামার — সারইল গ্রামের মাঠ",
    caption: "খামারের মাঠ",
  },
  {
    src: "/uploads/header-2nd-about.jpg",
    alt: "Farmer Kamol — পশুপালন ও প্রাকৃতিক পরিবেশ",
    caption: "পশু ও প্রকৃতি",
  },
  {
    src: "/uploads/header-3rd-about.jpg",
    alt: "Farmer Kamol — ফসল ও সমন্বিত কৃষি",
    caption: "ফসলের মাঠ",
  },
]

const pillars = [
  {
    id: 1,
    title: "সমন্বিত কৃষি",
    image: "/uploads/about-1st-sub.jpg",
    imageAlt: `সমন্বিত কৃষি পদ্ধতি - ${siteConfig.brand.name}`,
    preview:
      "একই জমি বা খামারে ফসল, মাছ, পশু ও পাখি এমনভাবে চালানো যাতে একটির বর্জ্য অন্যটির উপকারে আসে — একটি প্রাকৃতিক চক্র।",
    points: [
      "বহুমুখী উৎপাদন: সবজি, মাছ, দুধ, ডিম, মাংস এক খামার থেকে",
      "বর্জ্যের পুনঃব্যবহার: গোবর → সার, হাঁসের বিষ্ঠা → মাছের খাদ্য",
      "খরচ কমে, আয়ের উৎস বাড়ে, ঝুঁকি কমে",
      "জৈব পদ্ধতিতে পরিবেশ রক্ষা",
    ],
    quote: "এক জমি, এক খামার — বহু উৎপাদন, কম খরচ, বেশি লাভ।",
  },
  {
    id: 2,
    title: "পশুপালন",
    image: "/uploads/about-2nd-sub.jpg",
    imageAlt: `পশুপালন - ${siteConfig.brand.name}`,
    preview:
      "দুধ, মাংস বা ডিম শুধু নয় — অর্থনৈতিক স্বনির্ভরতা, জৈব সার ও শক্তির উৎসও পশুপালন।",
    points: [
      "গরু ও মহিষ: দুধ, গোবর ও জৈব সার",
      "ছাগল ও ভেড়া: কম খরচে দ্রুত লাভ",
      "হাঁস ও মুরগি: ডিম ও মাংস",
      "নিয়মিত ভেটেরিনারি যত্ন ও টিকা",
    ],
    quote: "পশু শুধু সম্পদ নয় — সঠিক যত্নে গড়ে ওঠে সাফল্যের ভিত্তি।",
  },
  {
    id: 3,
    title: "ফসল চাষ",
    image: "/uploads/about-3rd-sub.jpg",
    imageAlt: `ফসল চাষ - ${siteConfig.brand.name}`,
    preview:
      "কৃষিনির্ভর অর্থনীতির মেরুদণ্ড। আধুনিক পদ্ধতি ও সঠিক ব্যবস্থাপনায় অল্প জমিতে অধিক ফলন।",
    points: [
      "ধান, গম, ভুট্টা — প্রধান খাদ্যশস্য",
      "শাকসবজি — পুষ্টি ও বাজারমূল্যে লাভজনক",
      "নেপিয়ার/গিনি ঘাস — পশুখাদ্য",
      "জৈব সার ও পরিবেশবান্ধব সেচ",
    ],
    quote: "বীজে বোনা স্বপ্ন, ঘামে ফলানো সোনার ফসল।",
  },
]

export default function AboutPage() {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <main className="bg-[#F6F1E7] min-h-screen text-[#241C15]">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-[#2E2118] text-white">
        <div className="absolute inset-0">
          <Image
            src="/uploads/header-1st-about.jpg"
            alt="Farmer Kamol-এর খামার, সারইল গ্রাম"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2E2118] via-[#2E2118]/75 to-[#2E2118]/45" />
          <div
            className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
            style={{
              backgroundImage: "radial-gradient(circle, #F6F1E7 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
          <p className="text-[#D9A441] text-sm font-semibold tracking-wide mb-3">
            {siteConfig.brand.founderName} · {siteConfig.brand.founderNameBn}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] mb-4 text-balance">
            মাটির মানুষের গল্প
          </h1>
          <span className="block w-14 h-1 bg-[#D9A441] rounded-full mx-auto mb-5" />
          <p className="text-[#E8DFCF] text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            {siteConfig.brand.slogan} — সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রাম থেকে খাঁটি প্রাকৃতিক পণ্য,
            কোনো মধ্যস্থতাকারী ছাড়া।
          </p>
        </div>
      </section>

      {/* ===== IMAGE GALLERY — Desktop hover + Mobile swipe ===== */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 sm:-mt-8 relative z-20">
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          {galleryImages.map((img) => (
            <div
              key={img.src}
              className="group relative rounded-xl overflow-hidden aspect-[4/3] shadow-[0_8px_30px_rgba(46,33,24,0.12)]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 33vw, 320px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E2118]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <p className="text-white text-sm font-semibold tracking-wide">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Snap Slider */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 pb-1 -mx-1 px-1 scrollbar-hide">
          {galleryImages.map((img) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E2118]/70 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 text-white text-sm font-semibold drop-shadow">
                {img.caption}
              </p>
            </div>
          ))}
        </div>
        <p className="md:hidden text-center text-xs text-[#5A4A3A]/70 mt-2">← সোয়াইপ করুন →</p>
      </section>

      {/* ===== FOUNDER STORY ===== */}
      <section className="max-w-4xl mx-auto px-4 py-14 sm:py-20">
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          <div className="w-full md:w-[240px] shrink-0 mx-auto md:mx-0 group">
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-full md:h-64 mx-auto rounded-full md:rounded-2xl overflow-hidden ring-4 ring-[#F6F1E7] shadow-[0_8px_30px_rgba(46,33,24,0.15)]">
              <Image
                src="/uploads/kamol.png"
                alt={`${siteConfig.brand.founderNameBn} - প্রতিষ্ঠাতা, ${siteConfig.brand.name}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 208px, 240px"
              />
            </div>
            <div className="text-center md:text-left mt-4">
              <p className="font-bold text-lg text-[#2E2118]">{siteConfig.brand.founderNameBn}</p>
              <p className="text-sm text-[#5A4A3A]">প্রতিষ্ঠাতা, {siteConfig.brand.name}</p>
              <p className="text-sm text-[#5A4A3A] mt-1">
                {siteConfig.address.village}, {siteConfig.address.locality}, {siteConfig.address.region}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <p className="relative text-xl sm:text-2xl font-semibold leading-snug mb-6 text-[#2E2118] pl-6">
              <span className="absolute left-0 top-0 text-4xl sm:text-5xl leading-none text-[#D9A441] font-bold select-none">
                “
              </span>
              আমি কমল। বাংলা সাহিত্যে স্নাতক করেছি, কিন্তু আমার আসল পরিচয় বইয়ের পাতায় নয় —
              সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রামের মাটিতে।
            </p>
            <div className="space-y-4 text-[#4A3B2C] leading-relaxed text-[15px] sm:text-base">
              <p>
                নিজেকে বলি <span className="font-semibold text-[#2E2118]">“মাটির মানুষ”</span> —
                ঢাকায় চাকরি করলেও শিকড় থেকে যায় গ্রামের মাঠে, খামারে।
              </p>
              <p>
                ঢাকায় কুরিয়ার কোম্পানিতে কাজ করার সময় দেখেছি, শহরের মানুষ কতটা মরিয়া এক বোতল খাঁটি
                মধু বা ভেজালমুক্ত ঘি খুঁজে পেতে। অথচ আমাদের গ্রামে এই প্রকৃতির আশীর্বাদ হাতের কাছেই।
                এই দূরত্ব ঘুচিয়ে দিতেই জন্ম {siteConfig.brand.name}-এর — সরাসরি খামার থেকে আপনার
                দরজায়।
              </p>
              <p>
                এখানে যা কিছু বিক্রি হয়, তার প্রতিটির পেছনে আমার নিজের হাত ও পরিচিত মানুষের পরিশ্রম
                আছে। আমি চাই, আপনি যখন একবার আমাদের কোনো পণ্য হাতে নেবেন, তখন শুধু একটা প্রোডাক্ট না —
                একটা গ্রাম, একটা পরিবার আর একজন মানুষের বিশ্বাসকে চিনবেন।
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="mt-14 sm:mt-16 grid sm:grid-cols-2 gap-10 sm:gap-0 sm:divide-x sm:divide-[#D9CBB4] border-t border-[#D9CBB4] pt-10">
          <div className="sm:pr-10">
            <h2 className="text-sm font-bold tracking-wide text-[#A15C38] mb-3">মিশন</h2>
            <p className="text-[#4A3B2C] leading-relaxed text-[15px]">
              খাঁটি, ভেজালমুক্ত ও স্বচ্ছ প্রক্রিয়ায় উৎপাদিত প্রাকৃতিক খাদ্যপণ্য সরাসরি কৃষকের ঘর থেকে
              বাংলাদেশের প্রতিটি ঘরে পৌঁছে দেওয়া।
            </p>
          </div>
          <div className="sm:pl-10">
            <h2 className="text-sm font-bold tracking-wide text-[#A15C38] mb-3">ভিশন</h2>
            <ul className="text-[#4A3B2C] leading-relaxed text-[15px] space-y-2">
              <li>কৃষকের জন্য নির্ভরযোগ্য বাজার গড়ে তোলা</li>
              <li>ভেজালের বিরুদ্ধে প্রতিরোধ গড়া</li>
              <li>কৃষিকে নতুন প্রজন্মের কাছে আকর্ষণীয় করা</li>
              <li>একদিন পুরোদমে পরিবারের জমিতে ফিরে আসা</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== PILLARS ===== */}
      <section className="bg-white border-y border-[#E9E0CE]">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
          <div className="mb-12 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2E2118] mb-3">আমাদের কাজের ভিত্তি</h2>
            <p className="text-[#5A4A3A] text-[15px] leading-relaxed">
              ফসল, পশু আর মাটি — এই তিনটে একে অপরের সাথে জড়িয়ে একটা চক্র তৈরি করে। একটির বর্জ্য
              আরেকটির খাদ্য, আর সেই চক্রই আমাদের খামারের ভিত্তি।
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {pillars.map((p, idx) => {
              const isOpen = openId === p.id
              return (
                <article key={p.id} className="relative">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 border-b border-[#E9E0CE] pb-8 last:border-b-0">
                    <div className="relative w-full md:w-56 aspect-[4/3] md:aspect-square shrink-0 rounded-xl overflow-hidden group">
                      <Image
                        src={p.image}
                        alt={p.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 224px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    <div className="flex-1">
                      <span className="text-xs font-bold text-[#A15C38] tracking-wide">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-xl font-bold text-[#2E2118] mt-1 mb-2">{p.title}</h3>
                      <p className="text-[#4A3B2C] leading-relaxed text-[15px]">{p.preview}</p>

                      <div
                        className={`overflow-hidden transition-all duration-300 ${
                          isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                        }`}
                      >
                        <ul className="space-y-2 text-sm text-[#4A3B2C]">
                          {p.points.map((pt) => (
                            <li key={pt} className="flex gap-2">
                              <span className="text-[#A15C38] shrink-0">—</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 text-sm font-medium text-[#2E2118] border-l-2 border-[#A15C38] pl-4">
                          {p.quote}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : p.id)}
                        className="mt-4 text-sm font-bold text-[#A15C38] hover:text-[#7A4B32] transition"
                      >
                        {isOpen ? "কম দেখুন" : "বিস্তারিত পড়ুন"}
                      </button>
                    </div>
                  </div>

                  {idx < pillars.length - 1 && (
                    <div className="flex justify-center -mt-3 mb-3">
                      <span className="w-8 h-8 rounded-full bg-[#F6F1E7] border border-[#E9E0CE] flex items-center justify-center text-[#A15C38] text-sm">
                        ↓
                      </span>
                    </div>
                  )}
                </article>
              )
            })}

            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-[#5A4A3A]">
              <span className="text-[#A15C38]">↺</span>
              <span>মাটি আবার নতুন ফসলে ফিরে যায় — চক্র সম্পূর্ণ হয়</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST / YOUTUBE ===== */}
      <section className="relative bg-[#2E2118] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #F6F1E7 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">স্বচ্ছতাই আমাদের বিশ্বাস</h2>
          <p className="text-[#D9CBB4] text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
            প্রতিটি পণ্যের উৎপাদন প্রক্রিয়া আমরা YouTube চ্যানেল{" "}
            <span className="text-[#D9A441] font-semibold">{siteConfig.brand.youtubeHandle}</span>-এ
            ভিডিওর মাধ্যমে দেখাই — দেখে নিশ্চিত হয়ে কিনুন।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#D9A441] hover:bg-[#c99636] text-[#2E2118] font-bold px-6 py-3 rounded-full text-sm transition"
            >
              YouTube চ্যানেল দেখুন
            </a>
            <Link
              href="/media/video"
              className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-full text-sm transition"
            >
              আমাদের ভিডিও
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        <div className="bg-white border border-[#E9E0CE] rounded-2xl px-6 py-12 sm:py-14 text-center shadow-[0_10px_40px_rgba(46,33,24,0.06)]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2E2118] mb-3">খামারের স্বাদ আপনার টেবিলে</h2>
          <p className="text-[#5A4A3A] text-sm sm:text-base mb-8">
            খাঁটি মধু, ঘি, সরিষার তেল — সরাসরি অর্ডার করুন অথবা যোগাযোগ করুন।
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="group bg-[#2E2118] hover:bg-[#241C15] text-white font-bold px-6 py-3 rounded-full text-sm transition inline-flex items-center gap-2"
            >
              পণ্য দেখুন
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/contact"
              className="border border-[#2E2118] text-[#2E2118] hover:bg-[#2E2118] hover:text-white font-bold px-6 py-3 rounded-full text-sm transition"
            >
              যোগাযোগ
            </Link>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#A15C38] text-[#A15C38] hover:bg-[#A15C38] hover:text-white font-bold px-6 py-3 rounded-full text-sm transition"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}