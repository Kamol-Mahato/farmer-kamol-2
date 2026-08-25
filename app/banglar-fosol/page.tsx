import { prisma } from "@/lib/prisma"
import { siteConfig } from "@/lib/siteConfig"
import Link from "next/link"
import Image from "next/image"
import Breadcrumb from "@/app/components/Breadcrumb"
import { safeJsonLd } from "@/lib/jsonLd"

export const revalidate = 3600

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
    openGraph: {
      title: `বাংলার ফসল | ${siteConfig.brand.name}`,
      description: `ফসল, ফল, শাকসবজি, গাছ ও ঔষধি — বাংলাদেশের প্রকৃতির পরিচয়।`,
      url: `${siteConfig.domain.url}/banglar-fosol`,
    },
  }
}

export default async function BanglarFosolIndexPage() {
  const [categories, featured] = await Promise.all([
    prisma.fosolCategory.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { items: { where: { isPublished: true } } },
        },
      },
    }),
    prisma.fosolItem.findMany({
      where: { isPublished: true, isFeatured: true },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ])

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "বাংলার ফসল",
    description: "বাংলাদেশের ফসল, ফল, শাকসবজি, গাছ ও ঔষধি গাছ",
    url: `${siteConfig.domain.url}/banglar-fosol`,
    isPartOf: { "@type": "WebSite", name: siteConfig.brand.name, url: siteConfig.domain.url },
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListSchema) }}
      />
      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: "বাংলার ফসল" },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-green-900">বাংলার ফসল</h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
            ফসল, ফল, শাকসবজি, গাছ ও ঔষধি — বাংলাদেশের মাটির পরিচয় এক জায়গায়।
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/banglar-fosol/${cat.slug}`}
              className="bg-white border border-green-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md hover:border-green-300 transition"
            >
              <div className="text-2xl mb-2">
                {cat.slug === "fosol"
                  ? "🌾"
                  : cat.slug === "fol"
                    ? "🥭"
                    : cat.slug === "shobji"
                      ? "🥬"
                      : cat.slug === "gach"
                        ? "🌳"
                        : "🌿"}
              </div>
              <h2 className="font-bold text-green-800 text-sm">{cat.name}</h2>
              <p className="text-xs text-gray-400 mt-1">{cat._count.items} টি</p>
            </Link>
          ))}
        </div>

        {featured.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-green-900 mb-4">ফিচারড</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {featured.map((item) => (
                <Link
                  key={item.id}
                  href={`/banglar-fosol/${item.category.slug}/${item.slug}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group border border-green-50"
                >
                  {item.image && item.image.startsWith("/") && (
                    <div className="relative w-full h-40 overflow-hidden">
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
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {item.category.name}
                    </span>
                    <h3 className="font-bold text-green-800 mt-2 group-hover:text-green-600">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}