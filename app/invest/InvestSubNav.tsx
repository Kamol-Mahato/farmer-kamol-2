import Link from "next/link";

export default function InvestSubNav() {
  const links = [
    { href: "/invest#projects", label: "খাতসমূহ" },
    { href: "/invest/livestock", label: "লাইভস্টক" },
    { href: "/invest/crop", label: "ফসল চাষ" },
    { href: "/invest/aquaculture", label: "মাছ চাষ" },
    { href: "/invest#calculator", label: "লাভ বণ্টন" },
    { href: "/invest#how-to", label: "কীভাবে অংশীদার হবেন" },
    { href: "/contact", label: "যোগাযোগ" },
  ];

  return (
    <div className="sticky top-[76px] z-40 px-2 md:px-4 py-1.5 bg-transparent">
      <div
        className="
          max-w-5xl mx-auto
          flex items-center gap-1.5 md:gap-3
          px-1.5 md:px-3 py-1.5 md:py-1
          rounded-2xl md:rounded-full
          bg-white/90 md:bg-white/55 backdrop-blur-xl
          border border-white/40
          shadow-[0_8px_28px_rgba(22,101,52,0.10)]
        "
      >
        {/* লিংক — মোবাইলে এক লাইনে horizontal scroll */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/90 to-transparent z-10 md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/90 to-transparent z-10 md:hidden" />
          <div className="flex flex-nowrap items-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-hide px-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="
                  shrink-0 px-2 md:px-3 py-1 md:py-1.5
                  rounded-full
                  text-[11px] md:text-sm font-semibold
                  text-gray-700
                  hover:text-green-800 hover:bg-green-50
                  active:scale-[0.97]
                  transition-all duration-200 ease-out
                  whitespace-nowrap
                "
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA — সবসময় ডানে দেখা যাবে */}
        <Link
          href="/customer/dashboard"
          className="
            shrink-0 inline-flex items-center gap-1
            bg-green-700 text-white
            px-2.5 md:px-4 py-1.5 md:py-2
            rounded-full
            font-bold text-[11px] md:text-sm
            shadow-md shadow-green-900/15
            hover:bg-green-800 hover:shadow-lg
            active:scale-[0.97]
            transition-all duration-200 ease-out
            whitespace-nowrap
          "
        >
          বিনিয়োগ
          <span className="hidden sm:inline" aria-hidden>
            করুন →
          </span>
        </Link>
      </div>
    </div>
  );
}