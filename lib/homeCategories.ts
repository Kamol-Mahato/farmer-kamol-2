import { prisma } from "@/lib/prisma";

// হোমের ৪টা ক্যাটাগরি সেকশন — slug অথবা নামের শব্দ মিললেই ওই ক্যাটাগরির পণ্য ধরা হবে
type Def = {
  id: string; // সেকশনের anchor id (চিপ ক্লিকে এখানে স্ক্রল করবে)
  slugs: string[]; // ছোট হাতের slug
  words: string[]; // ক্যাটাগরির নামে এই শব্দ থাকলেও মিলবে
  labelBn: string;
  labelEn: string;
  titleBn: string;
  titleEn: string;
  landingBn: string;
  landingEn: string;
};

export const HOME_CATEGORY_DEFS: Def[] = [
  {
    id: "ghee",
    slugs: ["gawa-ghee"],
    words: ["ঘি", "ঘী", "ghee"],
    labelBn: "ঘী",
    labelEn: "Ghee",
    titleBn: "Farmer Kamol এর ঘী",
    titleEn: "Farmer Kamol's Ghee",
    landingBn: "/khati-ghee",
    landingEn: "/en/khati-ghee",
  },
  {
    id: "honey",
    slugs: ["natural-honey"],
    words: ["মধু", "honey"],
    labelBn: "মধু",
    labelEn: "Honey",
    titleBn: "Farmer Kamol এর মধু",
    titleEn: "Farmer Kamol's Honey",
    landingBn: "/khati-modhu",
    landingEn: "/en/khati-modhu",
  },
  {
    id: "mustard-oil",
    slugs: ["pure-oils"],
    words: ["তেল", "oil"],
    labelBn: "সরিষা তেল",
    labelEn: "Mustard Oil",
    titleBn: "Farmer Kamol এর সরিষা তেল",
    titleEn: "Farmer Kamol's Mustard Oil",
    landingBn: "/khati-sorisha-tel",
    landingEn: "/en/khati-sorisha-tel",
  },
  {
    id: "gur",
    slugs: ["khejur-gur"],
    words: ["গুড়", "jaggery", "khejur"],
    labelBn: "গুড়",
    labelEn: "Jaggery",
    titleBn: "Farmer Kamol এর গুড়",
    titleEn: "Farmer Kamol's Jaggery",
    landingBn: "/khejurer-gur",
    landingEn: "/en/khejurer-gur",
  },
];

function matches(
  def: Def,
  cat: { name: string; slug: string; nameEn: string | null } | null,
) {
  if (!cat) return false;
  if (def.slugs.includes(cat.slug.toLowerCase())) return true;
  const text = `${cat.name} ${cat.nameEn ?? ""}`.toLowerCase();
  return def.words.some((w) => text.includes(w));
}

// একটাই কুয়েরি — পণ্য থাকলে তবেই গ্রুপ ফেরত আসবে (খালি হলে সেকশন/চিপ দেখাবে না)
export async function getHomeCategoryGroups() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  const used = new Set<number>();
  return HOME_CATEGORY_DEFS.map((def) => {
    const items = products
      .filter((p) => !used.has(p.id) && matches(def, p.category))
      .slice(0, 10);
    items.forEach((p) => used.add(p.id));
    return { ...def, products: items };
  }).filter((g) => g.products.length > 0);
}

export type HomeCategoryGroup = Awaited<
  ReturnType<typeof getHomeCategoryGroups>
>[number];