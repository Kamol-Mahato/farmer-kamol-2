// হাঁসের বাচ্চার দাম — জাত ও বয়সের ধাপ। দাম ডাটাবেসে JSON টেক্সট হিসেবে থাকে।
export const DUCK_BREEDS = [
    { key: "deshi", bn: "দেশি", en: "Deshi (local)" },
    { key: "khaki", bn: "খাকি ক্যাম্বেল", en: "Khaki Campbell" },
    { key: "china", bn: "চিনা হাঁস", en: "Chinese duck" },
  ] as const;
  
  export const DUCK_AGE_TIERS = [
    { key: "d1", bn: "১ দিন", en: "1 day" },
    { key: "d2_7", bn: "২–৭ দিন", en: "2–7 days" },
    { key: "d7_15", bn: "৭–১৫ দিন", en: "7–15 days" },
    { key: "d15_30", bn: "১৫–৩০ দিন", en: "15–30 days" },
  ] as const;
  
  export type DuckPrices = Record<string, Record<string, number | null>>;
  export type DuckPriceData = { prices: DuckPrices; updatedAt: string | null };
  
  export function emptyDuckPrices(): DuckPrices {
    const out: DuckPrices = {};
    for (const b of DUCK_BREEDS) {
      out[b.key] = {};
      for (const t of DUCK_AGE_TIERS) out[b.key][t.key] = null;
    }
    return out;
  }
  
  // যেকোনো ইনপুট (ডাটাবেসের টেক্সট বা ফর্মের মান) থেকে নিরাপদ দামের টেবিল বানায়
  export function cleanDuckPrices(input: unknown): DuckPrices {
    const out = emptyDuckPrices();
    if (!input || typeof input !== "object") return out;
    const src = input as Record<string, unknown>;
    for (const b of DUCK_BREEDS) {
      const row = src[b.key];
      if (!row || typeof row !== "object") continue;
      for (const t of DUCK_AGE_TIERS) {
        const v = (row as Record<string, unknown>)[t.key];
        if (v === null || v === undefined || v === "") continue;
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0 && n <= 100000) {
          out[b.key][t.key] = Math.round(n);
        }
      }
    }
    return out;
  }
  
  export function parseDuckPrices(raw: string | null | undefined): DuckPriceData {
    if (!raw) return { prices: emptyDuckPrices(), updatedAt: null };
    try {
      const data = JSON.parse(raw);
      return {
        prices: cleanDuckPrices(data?.prices),
        updatedAt: typeof data?.updatedAt === "string" ? data.updatedAt : null,
      };
    } catch {
      return { prices: emptyDuckPrices(), updatedAt: null };
    }
  }