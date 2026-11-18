"use client";

import Link from "next/link";

type Item = { id: string; label: string };

type Props = {
  items: Item[];
  allLabel: string;
  allHref: string;
};

// শুধু মোবাইলে — নেভবারের নিচে আটকে থাকা (sticky) ক্যাটাগরি বার
//
// ✏️ ব্যাকগ্রাউন্ড রঙ: নিচে "bg-green-50"
//    সংখ্যা: 50 (সবচেয়ে হালকা) → 100 → 200 → ... → 900 (সবচেয়ে গাঢ়)
//    অস্বচ্ছতা: "bg-green-50/90" = ৯০% (সংখ্যা কমালে আরও স্বচ্ছ)
// ✏️ বারের উচ্চতা: "pt-1.5 pb-1.5" (উপর-নিচ ফাঁক) আর চিপের "py-1"
// ✏️ চিপের লেখার সাইজ: "text-[12px]"
export default function HomeCategoryNav({ items, allLabel, allHref }: Props) {
  function go(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const chip =
  "block w-full whitespace-nowrap text-center rounded-full border text-[11px] min-[360px]:text-[12px] font-bold px-1 py-1 active:scale-95 transition";

  return (
    <div className="md:hidden sticky top-[72px] z-40 -mt-1 bg-green-800 -mb-px shadow-sm px-2 pt-1.5 pb-1.5">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => go(e, item.id)}
            className={`${chip} bg-white text-green-800 border-green-600 hover:bg-yellow-400 hover:text-green-900`}
          >
            {item.label}
          </a>
        ))}
        <Link
          href={allHref}
          className={`${chip} bg-yellow-400 text-green-900 border-yellow-500`}
        >
          {allLabel}
        </Link>
      </div>
    </div>
  );
}