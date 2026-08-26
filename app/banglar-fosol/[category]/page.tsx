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
  if (!cat) return { title: `ক্যাটাগরি পাওয়া যায়নি | ${siteConfig.brand.name}` }

  return {
    title: `${cat.name} | বাংলার ফসল | ${siteConfig.brand.name}`,
    description: (
      cat.description ||
      `${cat.name} সম্পর্কে জানুন — ${siteConfig.brand.name}-এর বাংলার ফসল।`
    ).slice(0, 160),
    alternates: {
      canonical: `/banglar-fosol/${cat.slug}`,
      languages: {
        bn: `/banglar-fosol/${cat.slug}`,
        en: `/en/banglar-fosol/${cat.slug}`,
      },
    },
  }
}

export default async function FosolCategoryPage({
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: cat.name,
    numberOfItems: items.length,
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: "বাংলার ফসল", href: "/banglar-fosol" },
          { label: cat.name },
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 py-12 pt-8 text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">{cat.name}</h1>
        <p className="text-gray-500 mb-8">
          {cat.description || `বাংলাদেশের ${cat.name} সম্পর্কে জানুন`}
        </p>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          <Link
            href="/banglar-fosol"
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition"
          >
            সব
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/banglar-fosol/${c.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                c.id === cat.id
                  ? "bg-green-700 text-white"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="text-gray-400 py-16">এই ক্যাটাগরিতে এখনো কোনো আইটেম নেই।</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-left">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/banglar-fosol/${cat.slug}/${item.slug}`}
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
                    {cat.name}
                  </span>
                  <h2 className="text-lg font-bold text-green-800 mt-2 group-hover:text-green-600 transition">
                    {item.title}
                  </h2>
                  {item.scientificName && (
                    <p className="text-xs text-gray-400 italic mt-1">{item.scientificName}</p>
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
  )
}