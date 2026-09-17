import Link from "next/link";

type InvestSectionProps = {
  activeProjects?: number;
  partnerCount?: number;
  progressPct?: number | null;
};

export default function InvestSection({
  activeProjects = 1,
  partnerCount = 0,
  progressPct = null,
}: InvestSectionProps) {
  const chips = ["স্বচ্ছ হিসাব", "বাস্তব খামার", "লিখিত চুক্তি"];

  const stats = [
    {
      label: "চলমান প্রকল্প",
      value: String(activeProjects),
    },
    {
      label: "অংশীদার",
      value: partnerCount > 0 ? `${partnerCount}+` : "—",
    },
    {
      label: "সংগ্রহ",
      value: progressPct != null ? `${progressPct}%` : "—",
    },
  ];

  return (
    <section className="bg-[#FAF9F6] py-12 md:py-16 px-4 border-y border-green-100/80">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* বাম — ভিজুয়াল */}
          <div className="order-2 md:order-1">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-100 to-green-50 border border-green-200/60 aspect-[4/3] flex items-center justify-center shadow-sm">
              <div className="text-center p-6">
                <div className="text-5xl md:text-6xl mb-3" aria-hidden>
                  🌾
                </div>
                <p className="text-green-800 font-bold text-sm md:text-base">
                  কৃষক কমলের খামার
                </p>
                <p className="text-green-700/70 text-xs mt-1">
                  বাস্তব সম্পদ · স্বচ্ছ অংশীদারিত্ব
                </p>
              </div>
            </div>
          </div>

          {/* ডান — টেক্সট + chips */}
          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-800 text-base md:text-xl font-bold px-5 py-2 rounded-full mb-4">
              🌱 আমাদের খামারে অংশীদার হোন
            </h2>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-5 max-w-md mx-auto md:mx-0">
              বিশ্বাস আর লাভের অংশীদারিত্বে গড়ে উঠুক আমাদের খামার — আপনিও
              হতে পারেন এই যাত্রার একজন অংশীদার।
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              {chips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-green-200 text-green-800 shadow-sm"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* স্ট্যাট কার্ড */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mt-8 md:mt-10 max-w-2xl mx-auto">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-green-100 px-3 py-4 text-center shadow-sm"
            >
              <p className="text-xl md:text-2xl font-black text-green-700">
                {s.value}
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/invest"
            className="inline-flex items-center gap-2 bg-green-700 text-white px-8 py-3.5 rounded-full font-bold text-base md:text-lg shadow-md shadow-green-900/10 hover:bg-green-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            বিনিয়োগ করুন →
          </Link>
          <p className="text-xs text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
            গ্যারান্টিড রিটার্ন নয় — শুধু প্রকৃত লাভের অংশীদারিত্ব ও লিখিত
            চুক্তি।
          </p>
        </div>
      </div>
    </section>
  );
}