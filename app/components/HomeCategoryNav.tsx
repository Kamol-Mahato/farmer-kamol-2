"use client";

type Item = { id: string; label: string };

// শুধু মোবাইলে — হিরো স্লাইডারের উপরের ক্যাটাগরি বার
export default function HomeCategoryNav({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  function go(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="md:hidden -mt-1 bg-green-900 border-b border-green-700 px-3 pb-2 pt-3">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => go(e, item.id)}
            className="block text-center whitespace-nowrap rounded-full bg-green-50 text-green-800 border border-green-600 text-[13px] font-bold py-1.5 px-1 active:scale-95 hover:bg-yellow-400 hover:text-green-900 transition"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}