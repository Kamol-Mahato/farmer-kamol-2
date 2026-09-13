import Link from "next/link";

export default function InvestSection() {
  return (
    <div className="bg-green-50 py-10 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full mb-4">
          🌱 আমাদের খামারে অংশীদার হোন
        </h2>
        <p className="text-green-900 text-sm md:text-base mb-6 leading-relaxed max-w-xl mx-auto">
          বিশ্বাস আর লাভের অংশীদারিত্বে গড়ে উঠুক আমাদের খামার — আপনিও হতে পারেন এই যাত্রার একজন অংশীদার।
        </p>
        <Link
          href="/invest"
          className="inline-flex items-center gap-2 bg-green-700 text-white px-8 py-3 rounded-full font-bold text-base md:text-lg shadow-md hover:bg-green-800 hover:-translate-y-0.5 transition-all duration-300"
        >
          বিনিয়োগ করুন →
        </Link>
      </div>
    </div>
  );
}