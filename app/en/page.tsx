import Link from "next/link";
import HeroSlider from "@/app/en/components/HeroSlider";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/app/en/components/ProductCard";
import TopSellerSection from "@/app/en/components/TopSellerSection";
import HomeCategoryNav from "@/app/components/HomeCategoryNav";
import HomeCategorySections from "@/app/components/HomeCategorySections";
import { getHomeCategoryGroups } from "@/lib/homeCategories";
import { getHomeProducts, getHomeBlogs } from "@/lib/homeSections";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";
import dynamic from "next/dynamic";

// 🚀 BN হোমপেজের মতোই ভারী কম্পোনেন্টগুলো Lazy Load
const NoticeModal = dynamic(() => import("@/app/en/components/NoticeModal"));
const BlogSection = dynamic(() => import("@/app/en/components/BlogSection"));
const VideoSection = dynamic(() => import("@/app/en/components/VideoSection"));
const InvestSection = dynamic(
  () => import("@/app/en/components/InvestSection"),
);
const TestimonialSection = dynamic(
  () => import("@/app/en/components/TestimonialSection"),
);

export const revalidate = 86400;

const homeTitleEn = `${siteConfig.brand.displayName} | ${siteConfig.brand.sloganEn}`;

export const metadata: Metadata = {
  title: homeTitleEn,
  description: `Pure honey, ghee, mustard oil, and duck chicks — delivered directly from our farm in ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}, with no middlemen.`,
  openGraph: {
    title: homeTitleEn,
    description: `Pure honey, ghee, mustard oil, and duck chicks — delivered directly from our farm in ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}, with no middlemen.`,
    url: "/en",
    siteName: siteConfig.brand.nameEn,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.domain.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brand.nameEn} - ${siteConfig.brand.sloganEn}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitleEn,
    description: `Pure honey, ghee, mustard oil, and duck chicks — delivered directly from our farm in ${siteConfig.address.localityEn}, ${siteConfig.address.regionEn}, with no middlemen.`,
    images: [siteConfig.domain.ogImage],
  },
  alternates: {
    canonical: "/en",
    languages: {
      bn: "/",
      en: "/en",
    },
  },
};

export default async function HomePageEn() {
  const [
    products,
    systemSettings,
    featuredProducts,
    topSellerProducts,
    dbCategories,
    blogs,
    videos,
    heroVideos,
    reviews,
    categoryGroups,
  ] = await Promise.all([
    getHomeProducts(),
    prisma.systemControlCenter.findUnique({ where: { id: 1 } }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isActive: true, isTopSeller: true },
      include: {
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
    getHomeBlogs("en"),
    prisma.youtubeVideo.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    }),
    prisma.youtubeVideo.findMany({
      where: { heroOrder: { not: null } },
      orderBy: { heroOrder: "asc" },
      select: {
        id: true,
        youtubeUrl: true,
        title: true,
        titleEn: true,
        thumbnailUrl: true,
      },
    }),
    prisma.productReview.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, nameEn: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    getHomeCategoryGroups(),
  ]);

  const deliveryMode = (systemSettings?.deliveryChargeMode ?? "NORMAL") as
    "NORMAL" | "FREE" | "HALF";
  const blogCategories = dbCategories.map((c) => ({
    bn: c.name,
    en: c.nameEn || c.name,
  }));

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      <NoticeModal />

      <HomeCategoryNav
        items={categoryGroups.map((g) => ({ id: g.id, label: g.labelEn }))}
        allLabel="All Products"
        allHref="/en/shop"
      />
      <HeroSlider featuredProducts={featuredProducts} heroVideos={heroVideos} />

      <div className="bg-green-50 pt-3 pb-2 px-4">
  <div className="flex flex-wrap justify-center gap-2 md:gap-3">
    <span className="inline-flex items-center gap-1.5 bg-white border border-green-200 text-green-800 text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
      ✅ 100% Pure
    </span>
    <span className="inline-flex items-center gap-1.5 bg-white border border-green-200 text-green-800 text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
      🚚 Fast Delivery
    </span>
    <span className="inline-flex items-center gap-1.5 bg-white border border-green-200 text-green-800 text-xs md:text-sm font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
      💳 Cash on Delivery
    </span>
  </div>
</div>

      <TopSellerSection products={topSellerProducts} />

      <HomeCategorySections
        groups={categoryGroups}
        deliveryMode={deliveryMode}
        locale="en"
      />

      <div className="bg-green-50 py-3 px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-5">
            <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full hover:bg-green-700 hover:text-white transition cursor-default">
              Our Products
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-2">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                deliveryMode={deliveryMode}
              />
            ))}
          </div>
          <div className="text-center mt-4">
            <Link
              href="/en/shop"
              className="border-2 border-green-700 text-green-700 px-4 py-1 rounded-full font-bold hover:bg-green-700 hover:text-white text-xl transition"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </div>

      <BlogSection blogs={blogs} categories={blogCategories} />

      <VideoSection
        videos={videos}
        youtubeChannelUrl={
          systemSettings?.youtubeChannelUrl || siteConfig.social.youtube
        }
        facebookPageUrl={
          systemSettings?.facebookPageUrl || siteConfig.social.facebook
        }
      />

      {/* Investment CTA — on/off from the admin panel */}
      {systemSettings?.enableInvestmentProgram && <InvestSection />}

      <TestimonialSection reviews={reviews} />
    </div>
  );
}
