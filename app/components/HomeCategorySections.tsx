import Link from "next/link";
import ProductCard from "./ProductCard";
import ProductCardEn from "@/app/en/components/ProductCard";
import type { HomeCategoryGroup } from "@/lib/homeCategories";

type Props = {
  groups: HomeCategoryGroup[];
  deliveryMode: "NORMAL" | "FREE" | "HALF";
  locale?: "bn" | "en";
};

// Farmer Kamol এর ঘী / মধু / সরিষা তেল / গুড় — মোবাইল ও পিসি দুই জায়গাতেই
export default function HomeCategorySections({
  groups,
  deliveryMode,
  locale = "bn",
}: Props) {
  const isEn = locale === "en";
  const Card = isEn ? ProductCardEn : ProductCard;

  return (
    <>
      {groups.map((g) => {
        const href = isEn ? g.landingEn : g.landingBn;
        return (
          <section
            key={g.id}
            id={g.id}
            className="bg-green-50 py-3 px-4 scroll-mt-32"
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-4">
                <h2 className="inline-block">
                  <Link
                    href={href}
                    className="pill-link"
                  >
                    {isEn ? g.titleEn : g.titleBn}
                  </Link>
                </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {g.products.map((product) => (
                  <div
                    key={product.id}
                    className="w-[calc(50%-6px)] lg:w-[calc(20%-10px)]"
                  >
                    <Card product={product} deliveryMode={deliveryMode} />
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <Link
                  href={href}
                  className="text-green-700 font-bold text-sm md:text-base hover:underline"
                >
                  {isEn ? "View details →" : "বিস্তারিত দেখুন →"}
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}