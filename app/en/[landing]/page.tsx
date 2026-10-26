// app/en/[landing]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "@/app/components/LandingPage";
import { getLandingEn, seoLandingsEn } from "@/lib/seoLandingsEn";
import { siteConfig } from "@/lib/siteConfig";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return seoLandingsEn.map((l) => ({ landing: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}): Promise<Metadata> {
  const { landing: slug } = await params;
  const l = getLandingEn(slug);
  if (!l) return {};
  return {
    title: l.title,
    description: l.description,
    keywords: l.keywords,
    alternates: {
      canonical: `/en/${l.slug}`,
      languages: {
        bn: `/${l.slug}`,
        en: `/en/${l.slug}`,
      },
    },
    openGraph: {
      title: l.title,
      description: l.description,
      url: `/en/${l.slug}`,
      siteName: siteConfig.brand.displayName,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: siteConfig.domain.ogImage,
          width: 1200,
          height: 630,
          alt: l.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: l.title,
      description: l.description,
      images: [siteConfig.domain.ogImage],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const { landing: slug } = await params;
  const l = getLandingEn(slug);
  if (!l) notFound();
  return <LandingPage landing={l} locale="en" />;
}