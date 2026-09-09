import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/components/Breadcrumb";
import { safeJsonLd } from "@/lib/jsonLd";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: `Banglar Fosol - Crops, Fruits, Vegetables, Trees & Medicinal Plants | ${siteConfig.brand.nameEn}`,
    description: `Explore crops, fruits, vegetables, trees and medicinal plants of Bangladesh — Banglar Fosol by ${siteConfig.brand.nameEn}.`,
    alternates: {
      canonical: "/en/banglar-fosol",
      languages: {
        bn: "/banglar-fosol",
        en: "/en/banglar-fosol",
        "x-default": "/banglar-fosol",
      },
    },
  };
}

export default async function BanglarFosolIndexEn({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: catQuery } = await searchParams;

  const categories = await prisma.fosolCategory.findMany({
    where: { isVisible: true },
    orderBy: { displayOrder: "asc" },
  });

  const activeSlug = catQuery || "all";
  const activeCategory =
    activeSlug === "all" ? null : categories.find((c) => c.slug === activeSlug);

  const items = await prisma.fosolItem.findMany({
    where: {
      isPublished: true,
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
    },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Banglar Fosol",
    url: `${siteConfig.domain.url}/en/banglar-fosol`,
    inLanguage: "en",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <Breadcrumb
        items={[{ label: "Home", href: "/en" }, { label: "Banglar Fosol" }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 pt-8 text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Banglar Fosol
        </h1>
        <p className="text-gray-500 mb-8">
          Crops, fruits, vegetables, trees and medicinal plants of Bangladesh —
          in one place
        </p>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          <Link
            href="/en/banglar-fosol"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeSlug === "all"
                ? "bg-green-700 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/en/banglar-fosol?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeSlug === cat.slug
                  ? "bg-green-700 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {cat.nameEn || cat.name}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="text-gray-500 py-16">No items in this section yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-left">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/en/banglar-fosol/${item.category.slug}/${item.slugEn || item.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group border border-gray-100"
              >
                {item.image && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.titleEn || item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {item.category.nameEn || item.category.name}
                  </span>
                  <h2 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition leading-snug">
                    {item.titleEn || item.title}
                  </h2>
                  {item.scientificName && (
                    <p className="text-xs text-gray-500 italic mt-1">
                      {item.scientificName}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    {item.updatedAt.toLocaleDateString("en-GB")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
