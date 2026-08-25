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
  return prisma.fosolCategory.findFirst({ where: { slug, isVisible: true } })
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

  const items = await prisma.fosolItem.findMany({
    where: { categoryId: cat.id, isPublished: true },
    orderBy: { title: "asc" },
  })

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: cat.nameEn || cat.name,
    numberOfItems: items.length,
    inLanguage: "en",
  }

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/en" },
          { label: "Banglar Fosol", href: "/en/banglar-fosol" },
          { label: cat.nameEn || cat.name },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-green-900">
            {cat.nameEn || cat.name}
          </h1>
          {(cat.descriptionEn || cat.description) && (
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm">
              {cat.descriptionEn || cat.description}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No items in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/en/banglar-fosol/${cat.slug}/${item.slugEn || item.slug}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden group border border-green-50"
              >
                {item.image && item.image.startsWith("/") && (
                  <div className="relative w-full h-44 overflow-hidden">
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
                  <h2 className="font-bold text-green-800">{item.titleEn || item.title}</h2>
                  {item.scientificName && (
                    <p className="text-xs text-gray-400 italic mt-1">{item.scientificName}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}