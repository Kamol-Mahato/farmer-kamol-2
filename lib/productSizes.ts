export type NormalizedSize = {
    label: string;
    labelEn: string | null;
    stockKg: number;
    price: number;
    discountPrice: number | null;
    isActive: boolean;
    sortOrder: number;
  };
  
  type Result =
    | { ok: true; sizes: NormalizedSize[] }
    | { ok: false; error: string };
  
  const MAX_SIZES = 6;
  
  // অ্যাডমিন ফর্ম থেকে আসা সাইজের তালিকা যাচাই ও পরিষ্কার করে
  export function normalizeSizes(raw: unknown): Result {
    if (raw === undefined || raw === null) return { ok: true, sizes: [] };
    if (!Array.isArray(raw)) {
      return { ok: false, error: "সাইজের তথ্য সঠিক নয়" };
    }
    if (raw.length > MAX_SIZES) {
      return { ok: false, error: `সর্বোচ্চ ${MAX_SIZES}টি সাইজ দেওয়া যাবে` };
    }
  
    const sizes: NormalizedSize[] = [];
    const seen = new Set<string>();
  
    for (let i = 0; i < raw.length; i++) {
      const r = raw[i] as Record<string, unknown>;
      const label = String(r.label ?? "").trim();
      const stockKg = Number(r.stockKg);
      const price = Number(r.price);
      const discountRaw = r.discountPrice;
      const hasDiscount =
        discountRaw !== undefined && discountRaw !== null && discountRaw !== "";
      const discountPrice = hasDiscount ? Number(discountRaw) : null;
  
      if (!label) {
        return { ok: false, error: `সাইজ ${i + 1}: নাম দিন (যেমন ৩০০ গ্রাম)` };
      }
      if (seen.has(label)) {
        return { ok: false, error: `"${label}" নামে দুইটি সাইজ আছে` };
      }
      seen.add(label);
      if (!Number.isFinite(stockKg) || stockKg <= 0) {
        return {
          ok: false,
          error: `"${label}": স্টক থেকে কমবে — ০ এর বেশি সংখ্যা দিন (যেমন ০.৩)`,
        };
      }
      if (!Number.isFinite(price) || price <= 0) {
        return { ok: false, error: `"${label}": দাম দিন` };
      }
      if (
        discountPrice !== null &&
        (!Number.isFinite(discountPrice) ||
          discountPrice <= 0 ||
          discountPrice >= price)
      ) {
        return {
          ok: false,
          error: `"${label}": সেল দাম মূল দামের চেয়ে কম হতে হবে`,
        };
      }
  
      sizes.push({
        label,
        labelEn: String(r.labelEn ?? "").trim() || null,
        stockKg: Math.round(stockKg * 1000) / 1000,
        price,
        discountPrice,
        isActive: r.isActive === undefined ? true : Boolean(r.isActive),
        sortOrder: i,
      });
    }
  
    return { ok: true, sizes };
  }