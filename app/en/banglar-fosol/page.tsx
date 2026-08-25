import { prisma } from "@/lib/prisma"
import { siteConfig } from "@/lib/siteConfig"
import Link from "next/link"
import Image from "next/image"
import Breadcrumb from "@/app/components/Breadcrumb"
import { safeJsonLd } from "@/lib/jsonLd"

export const revalidate = 3600

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
  }
}

export default async function BanglarFosolIndexEn() {
  const [categories, featured] = await Promise.all([
    prisma.fosolCategory.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { items: { where: { isPublished: true } } } },
      },
    }),
    prisma.fosolItem.findMany({
      where: { isPublished: true, isFeatured: true },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ])

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Banglar Fosol",
    url: `${siteConfig.domain.url}/en/banglar-fosol`,
    inLanguage: "en",
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/en" },
          { label: "Banglar Fosol" },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-green-900">Banglar Fosol</h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
            Crops, fruits, vegetables, trees and medicinal plants of Bangladesh — in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/en/banglar-fosol/${cat.slug}`}
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
              <h2 className="font-bold text-green-800 text-sm">{cat.nameEn || cat.name}</h2>
              <p className="text-xs text-gray-400 mt-1">{cat._count.items} items</p>
            </Link>
          ))}
        </div>

        {featured.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-green-900 mb-4">Featured</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {featured.map((item) => {
                const href = `/en/banglar-fosol/${item.category.slug}/${item.slugEn || item.slug}`
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group border border-green-50"
                  >
                    {item.image && item.image.startsWith("/") && (
                      <div className="relative w-full h-40 overflow-hidden">
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
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {item.category.nameEn || item.category.name}
                      </span>
                      <h3 className="font-bold text-green-800 mt-2">
                        {item.titleEn || item.title}
                      </h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}