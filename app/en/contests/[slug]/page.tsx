import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
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
  if (!item || !item.isPublished || !item.titleEn || !item.contentEn) {
    return { title: "Not found | Farmer Kamol" };
  }
  const image = item.posterImage || item.image;
  return {
    title: `${item.titleEn} | Farmer Kamol`,
    description:
      item.summaryEn || plainText(item.contentEn).slice(0, 160),
    alternates: {
      canonical: `/en/contests/${item.slug}`,
      languages: {
        bn: `/contests/${item.slug}`,
        en: `/en/contests/${item.slug}`,
      },
    },
    openGraph: image ? { images: [image] } : undefined,
  };
}

export default async function ContestDetailPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item || !item.isPublished) notFound();

  // ইংরেজি লেখা না থাকলে ৪০৪ নয়, বাংলা পেজে পাঠানো হবে
  if (!item.titleEn || !item.contentEn) {
    redirect(`/contests/${item.slug}`);
  }

  return <ContestDetail item={item} locale="en" />;
}