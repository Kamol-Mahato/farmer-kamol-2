"use client";
import type { SizeChoice } from "@/lib/sizeChoices";

export default function SizeChips({
  choices,
  selected,
  onSelect,
  maxVisible,
  compact = false,
  ariaLabel,
}: {
  choices: SizeChoice[];
  selected: number;
  onSelect: (index: number) => void;
  maxVisible?: number;
  compact?: boolean;
  ariaLabel: string;
}) {
  const visible = maxVisible ? choices.slice(0, maxVisible) : choices;

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`flex flex-wrap ${compact ? "gap-1 mt-1.5" : "gap-2"}`}
    >
      {visible.map((c, i) => {
        const active = i === selected;
        return (
          <button
            key={c.sizeId ?? "base"}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={c.outOfStock}
            onClick={() => onSelect(i)}
            className={`whitespace-nowrap rounded-full border font-bold transition ${
              compact ? "px-2 py-1 text-[10px] md:text-xs" : "px-4 py-2 text-sm"
            } ${
              active
                ? "bg-green-800 border-green-800 text-white shadow-sm"
                : c.outOfStock
                  ? "bg-gray-50 border-gray-200 text-gray-300 line-through cursor-not-allowed"
                  : "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}