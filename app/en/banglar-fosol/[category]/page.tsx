import { prisma } from "@/lib/prisma"
import { siteConfig } from "@/lib/siteConfig"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import Breadcrumb from "@/app/components/Breadcrumb"
import { safeJsonLd } from "@/lib/jsonLd"
import { cache } from "react"

export const revalidate = 3600

const getCategory = cache(async (slug: string) => {
  return prisma.fosolCategory.findFirst({
    where: { slug, isVisible: true },
  })
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: catSlug } = await params
  const cat = await getCategory(catSlug)
  if (!cat) return { title: `Category not found | ${siteConfig.brand.nameEn}` }

  const title = cat.nameEn || cat.name
  return {
    title: `${title} | Banglar Fosol | ${siteConfig.brand.nameEn}`,
    description: (cat.descriptionEn || cat.description || `${title} of Bangladesh`).slice(0, 160),
    alternates: {
      canonical: `/en/banglar-fosol/${cat.slug}`,
      languages: {
        bn: `/banglar-fosol/${cat.slug}`,
        en: `/en/banglar-fosol/${cat.slug}`,
      },
    },
  }
}

export default async function FosolCategoryEnPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: catSlug } = await params
  const cat = await getCategory(catSlug)
  if (!cat) notFound()

  const [categories, items] = await Promise.all([
    prisma.fosolCategory.findMany({
      where: { isVisible: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.fosolItem.findMany({
      where: { categoryId: cat.id, isPublished: true },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  const catName = cat.nameEn || cat.name

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: catName,
    numberOfItems: items.length,
    inLanguage: "en",
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/en" },
          { label: "Banglar Fosol", href: "/en/banglar-fosol" },
          { label: catName },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 pt-8 text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">{catName}</h1>
        <p className="text-gray-500 mb-8">
          {cat.descriptionEn || cat.description || `Learn about ${catName} in Bangladesh`}
        </p>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          <Link
            href="/en/banglar-fosol"
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition"
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/en/banglar-fosol/${c.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                c.id === cat.id
                  ? "bg-green-700 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {c.nameEn || c.name}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="text-gray-400 py-16">No items in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/en/banglar-fosol/${cat.slug}/${item.slugEn || item.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group border border-gray-100"
              >
                {item.image && item.image.startsWith("/") ? (
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.titleEn || item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                    <span className="text-4xl opacity-60">🌾</span>
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {catName}
                  </span>
                  <h2 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition">
                    {item.titleEn || item.title}
                  </h2>
                  {item.scientificName && (
                    <p className="text-xs text-gray-400 italic mt-1">{item.scientificName}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    {item.updatedAt.toLocaleDateString("en-GB")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}