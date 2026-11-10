"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { safeJsonLd } from "@/lib/jsonLd";

type Faq = { q: string; a: string };

export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="space-y-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.q}
            className={`bg-white rounded-xl border overflow-hidden transition-colors duration-300 ${
              isOpen ? "border-green-300" : "border-gray-200"
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-4 text-left px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <span
                className={`flex-1 font-bold text-sm md:text-base ${
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
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}