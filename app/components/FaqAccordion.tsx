"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

type FaqItem = { q: string; a: string };
type FaqGroup = { category: string; items: FaqItem[] };

export default function FaqAccordion({
  groups,
  locale = "bn",
}: {
  groups: FaqGroup[];
  locale?: "bn" | "en";
}) {
  const [activeCategory, setActiveCategory] = useState<string>("__all__");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const t =
    locale === "en"
      ? {
          all: "All",
          searchPlaceholder: "Search a question...",
          noResults: "No matching questions found.",
        }
      : {
          all: "সব",
          searchPlaceholder: "প্রশ্ন খুঁজুন...",
          noResults: "কোনো প্রশ্ন খুঁজে পাওয়া যায়নি।",
        };

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter(
        (g) => activeCategory === "__all__" || g.category === activeCategory,
      )
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            !q ||
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, activeCategory, query]);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory("__all__")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "__all__"
              ? "bg-green-700 text-white"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {t.all}
        </button>
        {groups.map((g) => (
          <button
            key={g.category}
            onClick={() => setActiveCategory(g.category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === g.category
                ? "bg-green-700 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {g.category}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="space-y-8">
        {filteredGroups.length === 0 && (
          <p className="text-center text-gray-500 py-10">{t.noResults}</p>
        )}

        {filteredGroups.map((group) => (
          <div key={group.category}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-green-700 mb-3">
              {group.category}
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
              {group.items.map((item) => {
                const key = `${group.category}__${item.q}`;
                const isOpen = openKey === key;
                return (
                  <div key={key}>
                    <button
                      onClick={() => setOpenKey(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <span
                        className={`font-medium ${
                          isOpen ? "text-green-700" : "text-gray-900"
                        }`}
                      >
                        {item.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-gray-500 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-green-700" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-gray-600 leading-relaxed whitespace-pre-line">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
