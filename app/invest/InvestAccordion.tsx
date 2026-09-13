"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/* ============================================================
   একটা টেক্সট ব্লকের জন্য — শুধু "আরও পড়ুন" / "কম দেখুন" টগল
   ============================================================ */
export function ExpandableText({
  teaser,
  rest,
}: {
  teaser: string;
  rest: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p className="text-gray-700 text-sm md:text-base leading-relaxed">
        {teaser}
      </p>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
            {rest}
          </p>
        </div>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="mt-3 inline-flex items-center gap-1 text-green-700 font-bold text-sm hover:text-green-800"
      >
        {open ? "কম দেখুন" : "আরও পড়ুন"}
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
}

/* ============================================================
   ধাপগুলোর জন্য accordion — প্রতিটি ধাপে ক্লিক করলে বিস্তারিত দেখা যাবে
   ============================================================ */
type Step = { step: string; title: string; text: string };

export function StepAccordion({ steps }: { steps: Step[] }) {
  const [openStep, setOpenStep] = useState<string | null>(steps[0]?.step ?? null);

  return (
    <div className="space-y-3">
      {steps.map((item) => {
        const isOpen = openStep === item.step;
        return (
          <div
            key={item.step}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpenStep(isOpen ? null : item.step)}
              className="w-full flex items-center gap-4 text-left px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm">
                {item.step}
              </div>
              <span
                className={`flex-1 font-bold text-sm md:text-base ${
                  isOpen ? "text-green-700" : "text-gray-900"
                }`}
              >
                {item.title}
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
                <p className="px-4 pb-4 pl-[52px] text-gray-600 text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}