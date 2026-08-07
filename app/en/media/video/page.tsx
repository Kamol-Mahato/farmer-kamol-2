import { prisma } from "@/lib/prisma"
import Breadcrumb from "@/app/components/Breadcrumb"
import VideoGalleryClient from "./VideoGalleryClient"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/siteConfig"

export const revalidate = 86400

export const metadata: Metadata = {
  title: `Video Gallery - ${siteConfig.brand.nameEn}`,
  description: `Watch videos from ${siteConfig.brand.nameEn}'s YouTube channel — our farm, products, and daily work.`,
  alternates: {
    canonical: "/en/media/video",
    languages: {
      bn: "/media/video",
      en: "/en/media/video",
    },
  },
}

export default async function MediaVideoPage() {
    const [videos, systemSettings] = await Promise.all([
    prisma.youtubeVideo.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.systemControlCenter.findUnique({ where: { id: 1 } }),
  ])

  const youtubeChannelUrl =
    systemSettings?.youtubeChannelUrl || "https://www.youtube.com/@FarmerKamol"
  const facebookPageUrl =
    systemSettings?.facebookPageUrl || "https://www.facebook.com/farmerkamol"

  return (
    <div>
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Videos" },
      ]} />
      <div className="max-w-6xl mx-auto px-4 py-2">
        <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">Our Videos</h1>
        <p className="text-gray-500 text-center mb-8">{siteConfig.brand.name} YouTube চ্যানেল থেকে</p>
        <VideoGalleryClient
          videos={videos}
          youtubeChannelUrl={youtubeChannelUrl}
          facebookPageUrl={facebookPageUrl}
        />
      </div>
    </div>
  )
}