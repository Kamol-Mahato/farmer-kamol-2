import type { Metadata } from "next"
import { siteConfig } from "@/lib/siteConfig"

const pageTitle = `About Us - Integrated Farming, Livestock & Crop Cultivation | ${siteConfig.brand.nameEn}`
const pageDescription = `Learn about ${siteConfig.brand.nameEn}'s story, mission, and vision — pure honey, ghee, and mustard oil through integrated farming in ${siteConfig.address.villageEn}, ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}, delivered straight from the farm to your door.`
const pageUrl = `${siteConfig.domain.url}/en/about`
const ogImage = `${siteConfig.domain.url}${siteConfig.domain.ogImage}`

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "About Farmer Kamol",
    "integrated farming Bangladesh",
    "Sirajganj farm",
    "Raiganj Sarail",
    "pure honey Bangladesh",
    "desi ghee",
    "mustard oil",
    siteConfig.brand.founderName,
    "farm to door",
  ],
  authors: [{ name: siteConfig.brand.nameEn, url: siteConfig.domain.url }],
  creator: siteConfig.brand.nameEn,
  publisher: siteConfig.brand.nameEn,
  alternates: {
    canonical: "/en/about",
    languages: {
      bn: "/about",
      en: "/en/about",
      "x-default": "/about",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    url: pageUrl,
    siteName: siteConfig.brand.nameEn,
    title: `About Us | ${siteConfig.brand.nameEn}`,
    description: pageDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brand.nameEn} - ${siteConfig.brand.sloganEn}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${siteConfig.brand.nameEn}`,
    description: pageDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageTitle,
      description: pageDescription,
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteConfig.domain.url}/#website`,
        name: siteConfig.brand.nameEn,
        url: siteConfig.domain.url,
      },
      about: { "@id": `${siteConfig.domain.url}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.domain.url}/#organization`,
      name: siteConfig.brand.nameEn,
      url: siteConfig.domain.url,
      logo: `${siteConfig.domain.url}${siteConfig.domain.logo}`,
      foundingDate: siteConfig.brand.foundingYear,
      founder: {
        "@type": "Person",
        name: siteConfig.brand.founderName,
        alternateName: siteConfig.brand.founderNameBn,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.address.localityEn,
        addressRegion: siteConfig.address.regionEn,
        addressCountry: siteConfig.address.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: siteConfig.address.latitude,
        longitude: siteConfig.address.longitude,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteConfig.contact.phone,
        contactType: "customer service",
        availableLanguage: ["English", "Bengali"],
      },
      sameAs: [
        siteConfig.social.facebook,
        siteConfig.social.youtube,
        siteConfig.social.instagram,
        siteConfig.social.tiktok,
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.domain.url}/#founder`,
      name: siteConfig.brand.founderName,
      alternateName: siteConfig.brand.founderNameBn,
      jobTitle: "Founder",
      worksFor: { "@id": `${siteConfig.domain.url}/#organization` },
      url: pageUrl,
      image: `${siteConfig.domain.url}${siteConfig.domain.logo}`,
      homeLocation: {
        "@type": "Place",
        name: `${siteConfig.address.villageEn}, ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteConfig.domain.url}/en`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About Us",
          item: pageUrl,
        },
      ],
    },
  ],
}

export default function AboutLayoutEn({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}