import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { ExpandableText, StepAccordion } from "./InvestAccordion";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: `আমাদের খামারে বিনিয়োগ করুন - ${siteConfig.brand.name}`,
  description:
    "বিশ্বাস আর লাভের অংশীদারিত্বে কৃষক কমলের খামার সম্প্রসারণে বিনিয়োগ করুন — স্বচ্ছ প্রক্রিয়া, লিখিত চুক্তি এবং সরাসরি যোগাযোগের মাধ্যমে।",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full">
      {children}
    </h2>
  );
}

export default function InvestPage() {
  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      {/* Hero */}
      <div className="bg-green-50 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-green-800 mb-4">
            🌱 কৃষক কমলের খামারে অংশীদার হোন
          </h1>
          <p className="text-green-900 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-8">
            আমরা কোনো মধ্যস্থতাকারী ছাড়া সরাসরি খামার থেকে খাঁটি পণ্য পৌঁছে দিই।
            এখন সময় এসেছে খামারকে আরও বড় পরিসরে নিয়ে যাওয়ার — আর এই যাত্রায়
            আপনিও একজন অংশীদার হতে পারেন, বিশ্বাস আর লাভের ন্যায্য ভাগের ভিত্তিতে।
          </p>
          <Link
            href="/customer/dashboard"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-8 py-3 rounded-full font-bold text-base md:text-lg shadow-md hover:bg-green-800 hover:-translate-y-0.5 transition-all duration-300"
          >
            বিনিয়োগকারী হিসেবে যুক্ত হন →
          </Link>
        </div>
      </div>

      {/* কেন বিনিয়োগ নিচ্ছি */}
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <SectionHeading>কেন এই উদ্যোগ</SectionHeading>
          </div>
          <ExpandableText
            teaser="আমাদের পরিবারের জমিতে ধাপে ধাপে একটি পূর্ণাঙ্গ খামার গড়ে তোলার পরিকল্পনা রয়েছে — হাঁস-মুরগি প্রজনন, গরু-ছাগল পালন, মৌ চাষ এবং সরিষা আবাদ। এই সম্প্রসারণের জন্য যে মূলধন প্রয়োজন, তা একার পক্ষে পুরোটা জোগাড় করা সময়সাপেক্ষ।"
            rest="তাই আমরা চাই বিশ্বস্ত মানুষদের সরাসরি অংশীদার করে নিতে, যাতে খামার দ্রুত বড় হয় এবং লাভ ভাগাভাগি হয় সবার মধ্যে। এখানে কোনো নির্দিষ্ট হারে রিটার্নের প্রতিশ্রুতি দেওয়া হয় না — কারণ খামারের ফলাফল প্রকৃতি ও বাজারের ওপর নির্ভরশীল। বরং প্রকৃত লাভ যা হবে, তার একটি ন্যায্য অংশ বিনিয়োগকারীদের সাথে ভাগ করে নেওয়া হয়। এতে ঝুঁকি ও সুযোগ — দুটোই স্বচ্ছভাবে ভাগ হয়।"
          />
        </div>
      </div>

      {/* বর্তমান প্রজেক্ট */}
      <div className="bg-green-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <SectionHeading>🦆 বর্তমান প্রজেক্ট: চিনা হাঁস প্রজনন</SectionHeading>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
              প্রথম প্রজেক্ট হিসেবে ১০০টি চিনা হাঁস (Muscovy Duck) দিয়ে একটি
              প্রজনন খামার শুরু করা হচ্ছে। লক্ষ্য ডিম বা মাংস বিক্রি নয়, বরং
              সুস্থ-সবল বাচ্চা উৎপাদন করে বিক্রি করা — যেখান থেকে দীর্ঘমেয়াদে
              স্থায়ী আয়ের উৎস তৈরি হবে।
            </p>
            <ul className="text-gray-700 text-sm md:text-base leading-relaxed space-y-2 list-disc list-inside">
              <li>প্রথম বছর মূলত ভিত্তি তৈরির বছর — বাচ্চা কেনা, ঘর তৈরি, ব্রিডিং স্টক প্রস্তুত করা</li>
              <li>দ্বিতীয় বছর থেকে ব্রিডিং স্টক পরিপক্ব হয়ে প্রকৃত লাভ আসা শুরু করে</li>
              <li>প্রতিটি বিনিয়োগের হিসাব আলাদাভাবে ট্র্যাক করা হয়</li>
            </ul>
          </div>
        </div>
      </div>

      {/* কিভাবে কাজ করে */}
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <SectionHeading>কিভাবে বিনিয়োগ করবেন</SectionHeading>
          </div>
          <StepAccordion
            steps={[
              {
                step: "১",
                title: "অ্যাকাউন্ট তৈরি করুন",
                text: "আপনার নাম, ফোন নম্বর ও ইমেইল দিয়ে সাধারণ গ্রাহক অ্যাকাউন্ট খুলুন — নতুন করে কিছু রেজিস্ট্রেশন করতে হবে না, একই অ্যাকাউন্ট দিয়ে পণ্য অর্ডার ও বিনিয়োগ দুটোই করা যায়।",
              },
              {
                step: "২",
                title: "ইমেইল ভেরিফাই করুন",
                text: "ড্যাশবোর্ডে \"বিনিয়োগকারী\" ট্যাবে ঢুকলে ইমেইলে একটি OTP পাঠানো হবে — নিরাপত্তার জন্য এটি যাচাই করতে হবে।",
              },
              {
                step: "৩",
                title: "প্রোফাইল সম্পূর্ণ করুন",
                text: "এনআইডি, পাসপোর্ট সাইজ ছবি, স্বাক্ষরের ছবি এবং বিকাশ/ব্যাংক তথ্য যুক্ত করুন। প্রোফাইল সম্পূর্ণ না হলে বিনিয়োগের পরবর্তী ধাপে যাওয়া যাবে না।",
              },
              {
                step: "৪",
                title: "চুক্তিতে সম্মতি দিন",
                text: "একটি বিস্তারিত চুক্তিপত্র স্বয়ংক্রিয়ভাবে তৈরি হবে, যেখানে উভয় পক্ষের স্বাক্ষর ও তথ্য থাকবে। ইলেকট্রনিক স্বাক্ষরই চূড়ান্ত ও বৈধ — সরাসরি খামারে এসে কাগজে স্বাক্ষর করাটা ঐচ্ছিক।",
              },
              {
                step: "৫",
                title: "টাকা জমা দিন",
                text: "বিকাশ বা ব্যাংকের মাধ্যমে টাকা পাঠিয়ে তার প্রমাণ (স্লিপ/স্ক্রিনশট) আপলোড করুন। আমরা যাচাই করে তা আপনার প্রোফাইলে নিশ্চিত করে দেব।",
              },
            ]}
          />
        </div>
      </div>

      {/* নিরাপত্তা ও স্বচ্ছতা */}
      <div className="bg-green-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <SectionHeading>নিরাপত্তা ও স্বচ্ছতা</SectionHeading>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["📄", "লিখিত চুক্তি", "প্রতিটি বিনিয়োগের জন্য সিরিয়াল নম্বর ও তারিখসহ একটি স্বতন্ত্র চুক্তিপত্র তৈরি হয়।"],
              ["🔍", "যাচাইকৃত প্রোফাইল", "এনআইডি, ছবি ও স্বাক্ষর ছাড়া বিনিয়োগ প্রক্রিয়া সম্পন্ন করা যায় না।"],
              ["💰", "ম্যানুয়াল নিশ্চিতকরণ", "প্রতিটি জমা ও উত্তোলন সরাসরি যাচাই করে নিশ্চিত করা হয় — স্বয়ংক্রিয় নয় বলে ভুল হওয়ার সুযোগ কম।"],
              ["📊", "লেনদেনের হিসাব", "আপনার প্রোফাইলে জমা ও উত্তোলনের সম্পূর্ণ হিসাব সবসময় দেখা যাবে।"],
            ].map(([icon, title, text]) => (
              <div key={title} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="font-bold text-green-800 text-sm mb-1">{title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-14 px-4 text-center">
        <p className="text-gray-700 text-sm md:text-base mb-6 max-w-lg mx-auto">
          খামারের এই যাত্রায় আপনার আস্থা ও অংশীদারিত্ব আমাদের এগিয়ে যেতে সাহায্য করবে।
        </p>
        <Link
          href="/customer/dashboard"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-8 py-3 rounded-full font-bold text-base md:text-lg shadow-md hover:bg-green-800 hover:-translate-y-0.5 transition-all duration-300"
        >
          বিনিয়োগকারী হিসেবে যুক্ত হন →
        </Link>
      </div>
    </div>
  );
}