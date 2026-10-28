import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/siteConfig";
import ContestList from "@/app/components/ContestList";
import { CONTEST_TYPE_KEYS } from "@/lib/contestPublic";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: `প্রতিযোগিতা, অফার ও খবর | ${siteConfig.brand.name}`,
    description: `${siteConfig.brand.name}-এর সর্বশেষ প্রতিযোগিতা, বিশেষ অফার ও ঘোষণা এখানে দেখুন।`,
    alternates: {
      canonical: "/contests",
      languages: { bn: "/contests", en: "/en/contests" },
    },
  };
}

export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType = (CONTEST_TYPE_KEYS as readonly string[]).includes(
    type ?? "",
  )
    ? (type as string)
    : "";

  const items = await prisma.contestPost.findMany({
    where: { isPublished: true, ...(activeType ? { type: activeType } : {}) },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return <ContestList items={items} locale="bn" activeType={activeType} />;
}