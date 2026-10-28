import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cache } from "react";
import { siteConfig } from "@/lib/siteConfig";
import ContestDetail from "@/app/components/ContestDetail";
import { plainText } from "@/lib/contestPublic";

export const revalidate = 3600;

const getItem = cache(async (slug: string) => {
  return prisma.contestPost.findUnique({ where: { slug } });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item || !item.isPublished) {
    return { title: `পাওয়া যায়নি - ${siteConfig.brand.name}` };
  }
  const hasEn = !!(item.titleEn && item.contentEn);
  const image = item.posterImage || item.image;
  return {
    title: `${item.title} | ${siteConfig.brand.name}`,
    description: item.summary || plainText(item.content).slice(0, 160),
    alternates: {
      canonical: `/contests/${item.slug}`,
      languages: {
        bn: `/contests/${item.slug}`,
        en: hasEn ? `/en/contests/${item.slug}` : `/contests/${item.slug}`,
      },
    },
    openGraph: image ? { images: [image] } : undefined,
  };
}

export default async function ContestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item || !item.isPublished) notFound();
  return <ContestDetail item={item} locale="bn" />;
}