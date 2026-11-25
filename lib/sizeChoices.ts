import { getUnitToKgMultiplier } from "@/lib/unitKg";
import { translateUnit } from "@/lib/unitTranslate";

export type PublicSize = {
  id: number;
  label: string;
  labelEn: string | null;
  stockKg: number;
  price: number;
  discountPrice: number | null;
};

export type SizeChoice = {
  sizeId: number | null; // null = মূল সাইজ (পণ্যের নিজের একক, যেমন ১ কেজি)
  label: string;
  price: number;
  discountPrice: number | null;
  stockKg: number; // একটা প্যাকে স্টক থেকে কত কমবে
  outOfStock: boolean;
};

const EPS = 1e-9;

function baseLabel(unit: string, locale: "bn" | "en") {
  if (locale === "en") {
    const u = translateUnit(unit);
    return /^\d/.test(u) ? u : `1 ${u}`;
  }
  return /^[০-৯]/.test(unit) ? unit : `১ ${unit}`;
}

// প্রথম choice সবসময় মূল সাইজ, তারপর অ্যাডমিনের দেওয়া সাইজগুলো
export function buildSizeChoices(
  p: {
    unit: string;
    pricePerUnit: number;
    discountPrice: number | null;
    stockQty: number;
    sizes?: PublicSize[] | null;
  },
  locale: "bn" | "en",
): SizeChoice[] {
  const sizes = p.sizes ?? [];
  const hasSizes = sizes.length > 0;
  const baseKg = getUnitToKgMultiplier(p.unit);

  const base: SizeChoice = {
    sizeId: null,
    label: baseLabel(p.unit, locale),
    price: p.pricePerUnit,
    discountPrice: p.discountPrice,
    stockKg: baseKg,
    // সাইজ না থাকলে আগের নিয়মই (স্টক ০ হলে শেষ), থাকলে প্যাকের জন্য যথেষ্ট স্টক আছে কিনা
    outOfStock: hasSizes ? p.stockQty + EPS < baseKg : p.stockQty <= 0,
  };

  const extra: SizeChoice[] = sizes.map((s) => ({
    sizeId: s.id,
    label: locale === "en" ? s.labelEn || s.label : s.label,
    price: s.price,
    discountPrice: s.discountPrice,
    stockKg: s.stockKg,
    outOfStock: p.stockQty + EPS < s.stockKg,
  }));

  return [base, ...extra];
}