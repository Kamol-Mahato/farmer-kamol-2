import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { safeJsonLd } from "@/lib/jsonLd";
import { cache } from "react";

export const revalidate = 3600;

const getItem = cache(async (categorySlug: string, slug: string) => {
  return prisma.fosolItem.findFirst({
    where: {
      isPublished: true,
      category: { slug: categorySlug, isVisible: true },
      OR: [{ slugEn: slug }, { slug }],
    },
    include: { category: true },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const item = await getItem(category, slug);
  if (!item) return { title: `Not found | ${siteConfig.brand.nameEn}` };

  const title = item.titleEn || item.title;
  const raw = (item.contentEn || item.content || "").replace(/<[^>]+>/g, "");
  const description = item.seoDescription || raw.slice(0, 160);

  return {
    title: `${title} | Banglar Fosol | ${siteConfig.brand.nameEn}`,
    description,
    alternates: {
      canonical: `/en/banglar-fosol/${item.category.slug}/${item.slugEn || item.slug}`,
      languages: {
        bn: `/banglar-fosol/${item.category.slug}/${item.slug}`,
        en: `/en/banglar-fosol/${item.category.slug}/${item.slugEn || item.slug}`,
      },
    },
  };
}

export default async function FosolItemEnPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const item = await getItem(category, slug);
  if (!item) notFound();

  const title = item.titleEn || item.title;
  const content = item.contentEn || item.content;
  const catName = item.category.nameEn || item.category.name;
  const pageUrl = `${siteConfig.domain.url}/en/banglar-fosol/${item.category.slug}/${item.slugEn || item.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    inLanguage: "en",
    datePublished: item.createdAt.toISOString(),
    dateModified: item.updatedAt.toISOString(),
    author: { "@type": "Person", name: siteConfig.brand.founderName },
    publisher: {
      "@type": "Organization",
      name: siteConfig.brand.nameEn,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.domain.url}${siteConfig.domain.logo}`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };

  const related = await prisma.fosolItem.findMany({
    where: {
      categoryId: item.categoryId,
      isPublished: true,
      id: { not: item.id },
    },
    take: 4,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-6 pt-8 md:pt-6">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/en" className="hover:text-green-700">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/en/banglar-fosol" className="hover:text-green-700">
            Banglar Fosol
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/en/banglar-fosol/${item.category.slug}`}
            className="hover:text-green-700"
          >
            {catName}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-700 font-medium">{title}</span>
        </nav>

        {item.image && (
          <div className="relative w-full h-64 rounded-xl overflow-hidden mb-6">
            <Image
              src={item.image}
              alt={title}
              fill
              priority
              sizes="768px"
              className="object-cover"
            />
          </div>
        )}

        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {catName}
        </span>
        <h1 className="text-3xl font-bold text-green-800 mt-3 mb-2">{title}</h1>
        {item.scientificName && (
          <p className="text-sm text-gray-500 italic mb-3">
            {item.scientificName}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-6 text-xs">
          {(item.seasonEn || item.season) && (
            <span className="bg-yellow-50 text-yellow-800 border border-yellow-100 px-2 py-1 rounded-full">
              Season: {item.seasonEn || item.season}
            </span>
          )}
          {(item.regionEn || item.region) && (
            <span className="bg-blue-50 text-blue-800 border border-blue-100 px-2 py-1 rounded-full">
              Region: {item.regionEn || item.region}
            </span>
          )}
          {(item.usesEn || item.uses) && (
            <span className="bg-purple-50 text-purple-800 border border-purple-100 px-2 py-1 rounded-full">
              Uses: {item.usesEn || item.uses}
            </span>
          )}
        </div>

        <div
          className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {related.length > 0 && (
          <div className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-lg font-bold text-green-900 mb-4">
              More in this category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/en/banglar-fosol/${item.category.slug}/${r.slugEn || r.slug}`}
                  className="block px-4 py-3 rounded-xl border border-green-100 hover:bg-green-50 text-green-800 font-medium text-sm"
                >
                  {r.titleEn || r.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
