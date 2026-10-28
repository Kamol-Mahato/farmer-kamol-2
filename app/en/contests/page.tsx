import { prisma } from "@/lib/prisma";
import ContestList from "@/app/components/ContestList";
import { CONTEST_TYPE_KEYS } from "@/lib/contestPublic";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: "Contests, Offers & News | Farmer Kamol",
    description:
      "See the latest contests, special offers and announcements from Farmer Kamol.",
    alternates: {
      canonical: "/en/contests",
      languages: { bn: "/contests", en: "/en/contests" },
    },
  };
}

export default async function ContestsPageEn({
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

  // ইংরেজি লেখা না থাকলে আইটেমটা শুধু বাংলা তালিকায় থাকবে
  const items = await prisma.contestPost.findMany({
    where: {
      isPublished: true,
      titleEn: { not: null },
      contentEn: { not: null },
      ...(activeType ? { type: activeType } : {}),
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return <ContestList items={items} locale="en" activeType={activeType} />;
}