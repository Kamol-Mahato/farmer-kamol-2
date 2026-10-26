// app/[landing]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import LandingPage from "@/app/components/LandingPage";
import { getLanding, seoLandings } from "@/lib/seoLandings";
import { siteConfig } from "@/lib/siteConfig";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return seoLandings.map((l) => ({ landing: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}): Promise<Metadata> {
  const { landing: slug } = await params;
  const l = getLanding(slug);
  if (!l) return {};
  return {
    title: l.title,
    description: l.description,
    keywords: l.keywords,
    alternates: {
      canonical: `/${l.slug}`,
      languages: {
        bn: `/${l.slug}`,
        en: `/en/${l.slug}`,
      },
    },
    openGraph: {
      title: l.title,
      description: l.description,
      url: `/${l.slug}`,
      siteName: siteConfig.brand.displayName,
      type: "website",
      locale: "bn_BD",
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
  const l = getLanding(slug);
  if (!l) notFound();
  return <LandingPage landing={l} />;
}