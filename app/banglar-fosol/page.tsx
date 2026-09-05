import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/app/components/Breadcrumb";
import { safeJsonLd } from "@/lib/jsonLd";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: `বাংলার ফসল - ফসল, ফল, শাকসবজি, গাছ ও ঔষধি | ${siteConfig.brand.name}`,
    description: `বাংলাদেশের ফসল, ফল, শাকসবজি, গাছ ও ঔষধি গাছ সম্পর্কে জানুন — ${siteConfig.brand.name}-এর বাংলার ফসল বিভাগ।`,
    alternates: {
      canonical: "/banglar-fosol",
      languages: {
        bn: "/banglar-fosol",
        en: "/en/banglar-fosol",
        "x-default": "/banglar-fosol",
      },
    },
  };
}

export default async function BanglarFosolIndexPage({
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
    name: "বাংলার ফসল",
    description: "বাংলাদেশের ফসল, ফল, শাকসবজি, গাছ ও ঔষধি গাছ",
    url: `${siteConfig.domain.url}/banglar-fosol`,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <Breadcrumb
        items={[{ label: "হোম", href: "/" }, { label: "বাংলার ফসল" }]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 pt-8 text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">বাংলার ফসল</h1>
        <p className="text-gray-500 mb-8">
          ফসল, ফল, শাকসবজি, গাছ ও ঔষধি — বাংলাদেশের মাটির পরিচয় এক জায়গায়
        </p>

        {/* Category pills — Blog style */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          <Link
            href="/banglar-fosol"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeSlug === "all"
                ? "bg-green-700 text-white"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            সব
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/banglar-fosol?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeSlug === cat.slug
                  ? "bg-green-700 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Card grid — Blog style */}
        {items.length === 0 ? (
          <p className="text-gray-400 py-16">এই বিভাগে এখনো কোনো আইটেম নেই।</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-left">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/banglar-fosol/${item.category.slug}/${item.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group border border-gray-100"
              >
                {item.image && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {item.category.name}
                  </span>
                  <h2 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition leading-snug">
                    {item.title}
                  </h2>
                  {item.scientificName && (
                    <p className="text-xs text-gray-400 italic mt-1">
                      {item.scientificName}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    {item.updatedAt.toLocaleDateString("bn-BD")}
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
