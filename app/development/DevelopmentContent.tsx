"use client";
import { useState } from "react";
import {
  Check,
  Minus,
  Crown,
  Rocket,
  MessageCircle,
  Phone,
  Smartphone,
  Zap,
  LayoutDashboard,
  BarChart3,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Reveal from "../invest/Reveal";

/* ───────────── রং (গাঢ়/হালকা বদলাতে শুধু এই ৩টা লাইন বদলান) ───────────── */
const THEME = {
  hero: "from-emerald-950 via-emerald-900 to-teal-900",
  proHeader: "bg-emerald-950",
  premiumHeader: "from-emerald-600 to-teal-500",
  cta: "bg-emerald-900",
};

/* ───────────── ডেটা (এখান থেকেই প্যাকেজ, ফিচার ও দাম বদলাবেন) ───────────── */

type Feature = { text: string; included: boolean; highlight?: boolean };
type Plan = {
  name: string;
  tagline: string;
  badge: string;
  price: number;
  featured: boolean;
  features: Feature[];
};
type TabKey = "landing" | "ecommerce";

const TABS: { key: TabKey; label: string }[] = [
  { key: "landing", label: "ল্যান্ডিং পেজ" },
  { key: "ecommerce", label: "ই-কমার্স ওয়েবসাইট" },
];

type Extra = { text: string; highlight?: boolean };

// প্রফেশনাল ও প্রিমিয়াম একই সারিতে সাজানো: প্রফেশনালে ✗ থাকে, প্রিমিয়ামে ✓ — তাই দুই কার্ড সবসময় সমান
function buildPlans(
  base: Feature[],
  extras: Extra[],
  pro: Omit<Plan, "features" | "featured">,
  premium: Omit<Plan, "features" | "featured">,
): Plan[] {
  return [
    {
      ...pro,
      featured: false,
      features: [
        ...base,
        ...extras.map((e) => ({ text: e.text, included: false })),
      ],
    },
    {
      ...premium,
      featured: true,
      features: [
        ...base.map((f) => ({ ...f, highlight: false })),
        ...extras.map((e) => ({
          text: e.text,
          included: true,
          highlight: e.highlight,
        })),
      ],
    },
  ];
}

const PLANS: Record<TabKey, Plan[]> = {
  landing: buildPlans(
    [
      { text: "মোবাইল-ফার্স্ট রেসপনসিভ ল্যান্ডিং পেজ", included: true },
      {
        text: "প্রফেশনাল ডিজাইন (আপনার ব্র্যান্ড কালারে)",
        included: true,
        highlight: true,
      },
      { text: "স্পষ্ট কল-টু-অ্যাকশন ও অর্ডার ফর্ম", included: true },
      { text: "ডেলিভারি চার্জ সেটআপ", included: true },
      { text: "Facebook Pixel ও GTM সেটআপ (ফ্রি)", included: true },
    ],
    [
      { text: "কনভারশন অপটিমাইজেশন", highlight: true },
      { text: "অটো কুরিয়ার ইন্টিগ্রেশন" },
      { text: "ফেক কাস্টমার ও আইপি ব্লক" },
    ],
    {
      name: "প্রফেশনাল প্যাকেজ",
      tagline: "নতুন ও ছোট ব্যবসার জন্য সেরা শুরু",
      badge: "স্টার্টআপের জন্য",
      price: 2000,
    },
    {
      name: "প্রিমিয়াম প্যাকেজ",
      tagline: "প্রফেশনালের সব ফিচারসহ আরও বেশি",
      badge: "সবচেয়ে জনপ্রিয়",
      price: 3000,
    },
  ),
  ecommerce: buildPlans(
    [
      {
        text: "পূর্ণাঙ্গ ই-কমার্স ওয়েবসাইট (শপ, কার্ট, চেকআউট)",
        included: true,
        highlight: true,
      },
      {
        text: "অ্যাডমিন ড্যাশবোর্ড: পণ্য, অর্ডার ও কাস্টমার ম্যানেজমেন্ট",
        included: true,
      },
      {
        text: "অর্ডার স্ট্যাটাস ট্র্যাকিং ও কাস্টমার ট্র্যাক পেজ",
        included: true,
      },
      { text: "ক্যাশ অন ডেলিভারি ও ডেলিভারি চার্জ সেটআপ", included: true },
      { text: "মোবাইল-ফার্স্ট ডিজাইন ও SEO-বান্ধব কাঠামো", included: true },
      {
        text: "Facebook Pixel, GTM ও Google Analytics সেটআপ",
        included: true,
      },
    ],
    [
      { text: "অনলাইন পেমেন্ট গেটওয়ে (বিকাশ, নগদ, কার্ড)", highlight: true },
      { text: "অটো কুরিয়ার ইন্টিগ্রেশন", highlight: true },
      { text: "লাইভ চ্যাট ও পুশ নোটিফিকেশন" },
      { text: "কুপন, ইনভয়েস ও অর্ডার CSV এক্সপোর্ট" },
      { text: "দ্বিভাষিক সাইট (বাংলা ও ইংরেজি)" },
      { text: "এজেন্ট অ্যাকাউন্ট ও রোলভিত্তিক অ্যাক্সেস" },
    ],
    {
      name: "প্রফেশনাল ই-কমার্স",
      tagline: "ছোট থেকে মাঝারি অনলাইন শপের জন্য",
      badge: "ব্যবসা শুরুর জন্য",
      price: 30000,
    },
    {
      name: "প্রিমিয়াম ই-কমার্স",
      tagline: "প্রফেশনালের সব ফিচারসহ আরও বেশি",
      badge: "সবচেয়ে জনপ্রিয়",
      price: 40000,
    },
  ),
};

const WHY = [
  {
    icon: Smartphone,
    title: "মোবাইল-ফার্স্ট ডিজাইন",
    text: "আপনার বেশিরভাগ ক্রেতা মোবাইল থেকেই আসেন। তাই প্রতিটা পেজ আগে মোবাইলের কথা ভেবে বানানো হয়।",
  },
  {
    icon: Zap,
    title: "হালকা ও দ্রুত লোডিং",
    text: "ভারী স্ক্রিপ্ট ও অপ্রয়োজনীয় অ্যানিমেশন বাদ দিয়ে সাইট হালকা রাখা হয়, যাতে ক্রেতা অপেক্ষা না করে।",
  },
  {
    icon: LayoutDashboard,
    title: "সহজ ম্যানেজমেন্ট",
    text: "অর্ডার, পণ্য ও কাস্টমার এক জায়গা থেকে সামলানোর মতো পরিষ্কার অ্যাডমিন প্যানেল।",
  },
  {
    icon: BarChart3,
    title: "মার্কেটিং-রেডি",
    text: "Pixel, GTM ও Analytics সেটআপ থাকায় বিজ্ঞাপনের ফল সঠিকভাবে মাপা যায়।",
  },
];

const STEPS = [
  {
    title: "যোগাযোগ ও প্যাকেজ নির্ধারণ",
    text: "আপনার ব্যবসা ও প্রয়োজন শুনে সঠিক প্যাকেজ ঠিক করা হয়।",
  },
  {
    title: "ডিজাইন ও কনটেন্ট",
    text: "আপনার ব্র্যান্ড কালার ও পণ্য অনুযায়ী ডিজাইন সাজানো হয়।",
  },
  {
    title: "ডেভেলপমেন্ট ও টেস্ট",
    text: "মোবাইল ও ডেস্কটপে সবকিছু যাচাই করে অর্ডার-ফ্লো পরীক্ষা করা হয়।",
  },
  {
    title: "লাইভ ও হ্যান্ডওভার",
    text: "সাইট চালু করে অ্যাডমিন প্যানেল ব্যবহারের নিয়ম বুঝিয়ে দেওয়া হয়।",
  },
];

const FAQS = [
  {
    q: "ল্যান্ডিং পেজ আর ই-কমার্স ওয়েবসাইটের পার্থক্য কী?",
    a: "ল্যান্ডিং পেজ একটা বা অল্প কয়েকটা পণ্য বিক্রির জন্য এক পেজের সাইট, যেখানে সরাসরি অর্ডার ফর্ম থাকে। ই-কমার্স ওয়েবসাইটে অনেক পণ্য, কার্ট, চেকআউট, কাস্টমার অ্যাকাউন্ট ও পূর্ণ অ্যাডমিন প্যানেল থাকে।",
  },
  {
    q: "আমার জন্য কোনটা ঠিক হবে?",
    a: "একটা-দুটো পণ্য বা একটা অফার চালালে ল্যান্ডিং পেজই যথেষ্ট। নিয়মিত অনেক পণ্য বিক্রি করতে চাইলে ই-কমার্স ওয়েবসাইট নিন। বুঝতে না পারলে যোগাযোগ করুন, আপনার ব্যবসা শুনে পরামর্শ দেওয়া হবে।",
  },
  {
    q: "ডোমেইন ও হোস্টিং কি প্যাকেজের মূল্যের মধ্যে?",
    a: "প্যাকেজের মূল্য ডেভেলপমেন্টের জন্য। ডোমেইন ও হোস্টিংয়ের খরচ আলাদা, যোগাযোগের সময় বিস্তারিত জানিয়ে দেওয়া হবে।",
  },
  {
    q: "কীভাবে প্যাকেজ নেব?",
    a: "যেকোনো প্যাকেজের নিচের বাটনে চাপ দিলে সরাসরি WhatsApp-এ কথা বলা যাবে। চাইলে ফোনেও যোগাযোগ করতে পারেন।",
  },
];

/* ───────────── ছোট হেল্পার ───────────── */

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
function bn(n: number) {
  return n.toLocaleString("en-US").replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/* ───────────── প্যাকেজ কার্ড ───────────── */

function PlanCard({
  plan,
  tabLabel,
  whatsapp,
}: {
  plan: Plan;
  tabLabel: string;
  whatsapp: string;
}) {
  const message = `আসসালামু আলাইকুম, আমি "${tabLabel} — ${plan.name}" সম্পর্কে জানতে চাই।`;
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <article
      className={`relative flex flex-col h-full rounded-3xl overflow-hidden bg-white shadow-xl animate-fadeIn transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        plan.featured
          ? "ring-2 ring-yellow-400"
          : "ring-1 ring-green-900/10"
      }`}
    >
      {/* হেডার */}
      <div
        className={`px-6 pt-8 pb-6 text-center text-white ${
          plan.featured
            ? `bg-gradient-to-br ${THEME.premiumHeader}`  
            : THEME.proHeader
        }`}
      >
        <span
          className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            plan.featured
              ? "bg-yellow-400 text-green-950"
              : "bg-white/15 text-green-100"
          }`}
        >
          {plan.badge}
        </span>
        <div className="mt-4 flex justify-center">
          <span
            className={`w-11 h-11 rounded-full flex items-center justify-center ${
              plan.featured ? "bg-white/20" : "bg-white/10"
            }`}
          >
            {plan.featured ? (
              <Crown className="w-5 h-5 text-yellow-300" />
            ) : (
              <Rocket className="w-5 h-5 text-green-200" />
            )}
          </span>
        </div>
        <h3 className="mt-3 text-2xl font-bold">{plan.name}</h3>
        <p className="mt-1 text-sm text-green-100/90 min-h-5">{plan.tagline}</p>
      </div>

      {/* ফিচার তালিকা */}
      <ul className="flex-1 px-6 py-6 space-y-3">
        {plan.features.map((f) => (
          <li
            key={f.text}
            className={`flex items-start gap-2.5 text-[15px] leading-snug ${
              f.included ? "text-gray-800" : "text-gray-400 line-through"
            }`}
          >
            {f.included ? (
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
            ) : (
              <Minus className="w-4 h-4 mt-0.5 shrink-0 text-gray-300" />
            )}
            <span
              className={
                f.highlight && f.included
                  ? "bg-green-50 text-green-800 font-semibold px-2 py-0.5 -my-0.5 rounded-md"
                  : ""
              }
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* দাম ও বাটন */}
      <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-gray-50/60">
        <p className="text-center text-2xl font-extrabold text-green-900">
        প্রাইস :আলোচনা সাপেক্ষে
        </p>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-3 font-bold transition ${
            plan.featured
              ? "bg-yellow-400 hover:bg-yellow-300 text-green-950"
              : "bg-green-800 hover:bg-green-700 text-white"
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          এই প্যাকেজ নিন
        </a>
      </div>
    </article>
  );
}

/* ───────────── মূল পেজ ───────────── */

export default function DevelopmentContent({
  whatsapp,
  phone,
  phoneDisplay,
}: {
  whatsapp: string;
  phone: string;
  phoneDisplay: string;
}) {
  const [tab, setTab] = useState<TabKey>("landing");
  const tabLabel = TABS.find((t) => t.key === tab)!.label;

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      {/* ── হিরো + প্যাকেজ ── */}
      <section className={`bg-gradient-to-b ${THEME.hero} text-white`}>
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="text-center max-w-3xl mx-auto animate-fadeIn">
            <span className="inline-block text-xs font-bold tracking-wider bg-white/10 text-green-100 px-4 py-1.5 rounded-full">
              ওয়েব ডেভেলপমেন্ট সার্ভিস
            </span>
            <h1 className="mt-5 text-3xl md:text-5xl font-bold leading-tight">
              আপনার ব্যবসার জন্য প্রফেশনাল{" "}
              <span className="text-yellow-300">ল্যান্ডিং পেজ ও ই-কমার্স</span>{" "}
              ওয়েবসাইট
            </h1>
            <p className="mt-4 text-black-100/90 text-base md:text-lg leading-relaxed">
              ডিজাইন থেকে অর্ডার ম্যানেজমেন্ট পর্যন্ত, দ্রুত, নির্ভরযোগ্য ও
              ব্যবহার-বান্ধব সমাধান। আমার কাজের প্রমাণ হিসেবে দেখতে পারেন{" "}
              <a
                href="/"
                className="inline-flex items-center gap-1 font-semibold text-yellow-300 hover:text-yellow-200 underline underline-offset-4"
              >
                farmerkamol.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              , পুরোটাই নিজ হাতে তৈরি ও পরিচালিত।
            </p>
          </div>

          {/* ট্যাব */}
          <div
            role="tablist"
            aria-label="প্যাকেজের ধরন"
            className="mt-10 mx-auto w-fit flex gap-1 bg-white/10 backdrop-blur rounded-2xl p-1.5"
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 md:px-6 py-2.5 rounded-xl text-sm md:text-base font-bold transition ${
                  tab === t.key
                    ? "bg-yellow-400 text-green-950 shadow"
                    : "text-green-100 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* কার্ড */}
          <div
            className={`mt-10 grid gap-6 md:gap-8 items-stretch mx-auto ${
              PLANS[tab].length > 1 ? "md:grid-cols-2 max-w-4xl" : "max-w-md"
            }`}
          >
            {PLANS[tab].map((plan) => (
              <PlanCard
                key={`${tab}-${plan.name}`}
                plan={plan}
                tabLabel={tabLabel}
                whatsapp={whatsapp}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── যা পাচ্ছেন ── */}
      <section className="bg-green-50 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-900">
              যা পাচ্ছেন প্রতিটা প্যাকেজে
            </h2>
          </Reveal>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80} className="h-full">
                <div className="group h-full bg-white rounded-2xl p-6 shadow-sm border border-green-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-green-900 text-lg">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── কাজ হয় যেভাবে ── */}
      <section className="py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-900">
              কাজ হয় যেভাবে
            </h2>
          </Reveal>
          <div className="mt-10 space-y-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 60}>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-green-900 text-white font-bold flex items-center justify-center">
                    {bn(i + 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">{s.title}</h3>
                    <p className="mt-1 text-gray-600">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-green-50 py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <Reveal className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-900">
              সাধারণ প্রশ্ন
            </h2>
          </Reveal>
          <div className="mt-8 space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 50}>
                <details className="group bg-white rounded-xl border border-green-100 open:shadow-sm">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-5 py-4 font-semibold text-green-900">
                    {faq.q}
                    <span className="text-green-600 group-open:rotate-45 transition text-xl leading-none">+</span>
                  </summary>
                  <p className="px-5 pb-4 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`bg-gradient-to-b ${THEME.cta} text-white py-14 md:py-16`}>
        <Reveal className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            আপনার ব্যবসার জন্য কোন প্যাকেজ ঠিক হবে?
          </h2>
          <p className="mt-3 text-green-100/90">
            কথা বলুন, আপনার প্রয়োজন শুনে সঠিক প্যাকেজটা বেছে দেওয়া হবে।
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp-এ কথা বলুন
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <Phone className="w-5 h-5" />
              {phoneDisplay}
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
