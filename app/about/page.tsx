"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { siteConfig } from "@/lib/siteConfig"

const headerImages = [
  "header-1st-about.jpg",
  "header-2nd-about.jpg",
  "header-3rd-about.jpg",
]

const pillars = [
  {
    id: 1,
    emoji: "🌱",
    title: "সমন্বিত কৃষি কী?",
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
    quote: "এক জমি, এক খামার → বহু উৎপাদন + কম খরচ + বেশি লাভ",
  },
  {
    id: 2,
    emoji: "🐄",
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
    quote: "পশু নয় শুধু সম্পদ — সঠিক যত্নে গড়ে ওঠে সাফল্যের ভিত্তি।",
  },
  {
    id: 3,
    emoji: "🌾",
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
    quote: "বীজে বুনো স্বপ্ন, ঘামে ফলাও সোনার ফসল।",
  },
]

const stats = [
  { label: "খামার থেকে দরজায়", value: "সরাসরি" },
  { label: "মধ্যস্থতাকারী", value: "০" },
  { label: "প্রক্রিয়া", value: "স্বচ্ছ" },
  { label: "অবস্থান", value: "সিরাজগঞ্জ" },
]

export default function AboutPage() {
  const [openId, setOpenId] = useState<number | null>(null)

  return (
    <main className="bg-stone-50 min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-green-900 text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="grid grid-cols-3 h-full">
            {headerImages.map((img, i) => (
              <div key={i} className="relative h-full min-h-[220px] sm:min-h-[320px]">
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
            আমাদের পরিচয়
            <span className="w-8 h-px bg-yellow-400/80" />
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            মাটির মানুষের গল্প
          </h1>
          <p className="text-green-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {siteConfig.brand.slogan} — সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রাম থেকে খাঁটি প্রাকৃতিক পণ্য,
            কোনো মধ্যস্থতাকারী ছাড়া।
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
              <div className="text-xl sm:text-2xl font-extrabold text-green-800">{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</div>
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
                  alt={`${siteConfig.brand.founderNameBn} - প্রতিষ্ঠাতা`}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              </div>
              <h2 className="mt-5 text-white font-bold text-lg">
                {siteConfig.brand.founderNameBn}
              </h2>
              <p className="text-yellow-300 text-sm mt-1">প্রতিষ্ঠাতা · {siteConfig.brand.name}</p>
              <p className="text-green-200 text-xs mt-3 leading-relaxed">
                {siteConfig.address.village}, {siteConfig.address.locality}, {siteConfig.address.region}
              </p>
            </div>

            <div className="flex-1 p-6 sm:p-8 md:p-10">
              <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <span>🌾</span> আমাদের গল্প
              </h3>
              <div className="space-y-4 text-gray-700 leading-relaxed text-[15px] sm:text-base">
                <p>
                  আমি কমল। বাংলা সাহিত্যে স্নাতক করেছি, কিন্তু আমার আসল পরিচয় বইয়ের পাতায় নয় —
                  সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রামের মাটিতে। নিজেকে বলি{" "}
                  <span className="font-semibold text-green-800">&quot;মাটির মানুষ&quot;</span> — ঢাকায়
                  চাকরি করলেও শিকড় থেকে যায় গ্রামের মাঠে, খামারে।
                </p>
                <p>
                  ঢাকায় কুরিয়ার কোম্পানিতে কাজ করার সময় দেখেছি, শহরের মানুষ কতটা মরিয়া এক বোতল খাঁটি
                  মধু বা ভেজালমুক্ত ঘি খুঁজে পেতে। অথচ আমাদের গ্রামে এই প্রকৃতির আশীর্বাদ হাতের কাছেই। এই
                  দূরত্ব ঘুচিয়ে দিতেই জন্ম {siteConfig.brand.name}-এর — সরাসরি খামার থেকে আপনার দরজায়।
                </p>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🎯</span> মিশন
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    খাঁটি, ভেজালমুক্ত ও স্বচ্ছ প্রক্রিয়ায় উৎপাদিত প্রাকৃতিক খাদ্যপণ্য সরাসরি কৃষকের ঘর
                    থেকে বাংলাদেশের প্রতিটি ঘরে পৌঁছে দেওয়া।
                  </p>
                </div>
                <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-5">
                  <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🔭</span> ভিশন
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1.5 list-disc list-inside">
                    <li>কৃষকের জন্য নির্ভরযোগ্য বাজার</li>
                    <li>ভেজালের বিরুদ্ধে প্রতিরোধ</li>
                    <li>কৃষিকে নতুন প্রজন্মের কাছে আকর্ষণীয় করা</li>
                    <li>একদিন পুরোদমে পরিবারের জমিতে ফিরে আসা</li>
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-900">আমাদের কাজের ভিত্তি</h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            সমন্বিত কৃষি · পশুপালন · ফসল চাষ — একই চক্রে বাঁধা
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {pillars.map((p, idx) => {
            const isOpen = openId === p.id
            const reverse = idx % 2 === 1
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
                  <p className="text-gray-700 leading-relaxed text-[15px]">{p.preview}</p>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="space-y-2 text-sm text-gray-700">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex gap-2">
                          <span className="text-green-600 shrink-0 mt-0.5">✓</span>
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
                    {isOpen ? "▲ কম দেখুন" : "▾ বিস্তারিত পড়ুন"}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ===== TRUST / YOUTUBE ===== */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="rounded-3xl bg-gradient-to-br from-green-800 via-green-900 to-green-950 text-white p-8 sm:p-10 text-center shadow-lg">
          <div className="text-4xl mb-3">🎬</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3">স্বচ্ছতাই আমাদের বিশ্বাস</h2>
          <p className="text-green-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
            প্রতিটি পণ্যের উৎপাদন প্রক্রিয়া আমরা YouTube চ্যানেল{" "}
            <span className="text-yellow-300 font-semibold">{siteConfig.brand.youtubeHandle}</span>-এ
            ভিডিওর মাধ্যমে দেখাই — দেখে নিশ্চিত হয়ে কিনুন।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={siteConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-full text-sm transition shadow"
            >
              YouTube চ্যানেল দেখুন
            </a>
            <Link
              href="/media/video"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition"
            >
              আমাদের ভিডিও
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl border border-green-100 p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-green-900 mb-2">খামারের স্বাদ আপনার টেবিলে</h2>
          <p className="text-gray-600 text-sm mb-6">
            খাঁটি মধু, ঘি, সরিষার তেল — সরাসরি অর্ডার করুন অথবা যোগাযোগ করুন।
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-6 py-2.5 rounded-full text-sm transition shadow-sm"
            >
              পণ্য দেখুন
            </Link>
            <Link
              href="/contact"
              className="bg-green-800 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition"
            >
              যোগাযোগ
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
  )
}