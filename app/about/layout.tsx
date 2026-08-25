import type { Metadata } from "next"
import { siteConfig } from "@/lib/siteConfig"

const pageTitle = `আমাদের সম্পর্কে - সমন্বিত কৃষি, পশুপালন ও ফসল চাষ | ${siteConfig.brand.name}`
const pageDescription = `${siteConfig.brand.name}-এর গল্প, মিশন ও ভিশন — সিরাজগঞ্জের রায়গঞ্জের সারইল গ্রাম থেকে সমন্বিত কৃষিতে খাঁটি মধু, ঘি ও সরিষার তেল সরাসরি খামার থেকে আপনার দরজায়।`
const pageUrl = `${siteConfig.domain.url}/about`
const ogImage = `${siteConfig.domain.url}${siteConfig.domain.ogImage}`

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Farmer Kamol সম্পর্কে",
    "সমন্বিত কৃষি",
    "সিরাজগঞ্জ খামার",
    "রায়গঞ্জ সারইল",
    "খাঁটি মধু",
    "দেশি ঘি",
    "সরিষার তেল",
    siteConfig.brand.founderNameBn,
    "কৃষক থেকে ভোক্তা",
  ],
  authors: [{ name: siteConfig.brand.name, url: siteConfig.domain.url }],
  creator: siteConfig.brand.name,
  publisher: siteConfig.brand.name,
  alternates: {
    canonical: "/about",
    languages: {
      bn: "/about",
      en: "/en/about",
      "x-default": "/about",
    },
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    url: pageUrl,
    siteName: siteConfig.brand.name,
    title: `আমাদের সম্পর্কে | ${siteConfig.brand.name}`,
    description: pageDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brand.name} - ${siteConfig.brand.slogan}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `আমাদের সম্পর্কে | ${siteConfig.brand.name}`,
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
        name: siteConfig.brand.name,
        url: siteConfig.domain.url,
      },
      about: { "@id": `${siteConfig.domain.url}/#organization` },
      inLanguage: "bn-BD",
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.domain.url}/#organization`,
      name: siteConfig.brand.name,
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
        availableLanguage: ["Bengali", "English"],
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
          name: "হোম",
          item: siteConfig.domain.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "আমাদের সম্পর্কে",
          item: pageUrl,
        },
      ],
    },
  ],
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
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