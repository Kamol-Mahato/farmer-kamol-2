import Link from "next/link";
import dynamic from "next/dynamic";
import HeroSlider from "./components/HeroSlider";
import { prisma } from "@/lib/prisma";
import ProductCard from "./components/ProductCard";
import TopSellerSection from "./components/TopSellerSection";
import { getHomeProducts, getHomeBlogs } from "@/lib/homeSections";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/siteConfig";

// 🚀 ভারী কম্পোনেন্টগুলো Dynamic Import (Lazy Load) করা হলো
const NoticeModal = dynamic(() => import("./components/NoticeModal"));
const BlogSection = dynamic(() => import("./components/BlogSection"));
const VideoSection = dynamic(() => import("./components/VideoSection"));
const InvestSection = dynamic(() => import("./components/InvestSection"));
const TestimonialSection = dynamic(() => import("./components/TestimonialSection"));

export const revalidate = 86400; // ২৪ ঘণ্টা safety-net; Admin Save করলেই সাথে সাথে revalidatePath() দিয়ে আগে আপডেট হয়ে যাবে

export const metadata: Metadata = {
  title: `${siteConfig.brand.name} - ${siteConfig.brand.slogan}`,
  description: `${siteConfig.address.region}ের ${siteConfig.address.locality} থেকে সরাসরি খাঁটি মধু, ঘি, সরিষার তেল ও চীন হাঁসের বাচ্চা — কোনো মধ্যস্থতাকারী ছাড়া, খামার থেকে আপনার দরজায়।`,
  alternates: {
    canonical: "/",
    languages: {
      bn: "/",
      en: "/en",
    },
  },
};

export default async function HomePage() {
  const [
    products,
    systemSettings,
    featuredProducts,
    topSellerProducts,
    blogs,
    videos,
    heroVideos,
    reviews,
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
    getHomeBlogs("bn"),
    prisma.youtubeVideo.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      take: 6,
    }),
    prisma.youtubeVideo.findMany({
      where: { heroOrder: { not: null } },
      orderBy: { heroOrder: "asc" },
      select: { id: true, youtubeUrl: true, title: true, thumbnailUrl: true },
    }),
    prisma.productReview.findMany({
      where: { isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const deliveryMode = (systemSettings?.deliveryChargeMode ?? "NORMAL") as
    "NORMAL" | "FREE" | "HALF";

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      <NoticeModal />

      {/* Hero Slider */}
      <HeroSlider featuredProducts={featuredProducts} heroVideos={heroVideos} />

      {/* Top Seller Section */}
      <TopSellerSection products={topSellerProducts} />

      {/* Featured Products */}
      <div className="bg-green-50 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 md:gap-10 text-green-900 text-xs md:text-sm font-bold mb-3">
            <span>✅ ১০০% খাঁটি</span>
            <span>🚚 দ্রুত ডেলিভারি</span>
            <span>💳 ক্যাশ অন ডেলিভারি</span>
          </div>
          <div className="text-center mb-5">
            <h2 className="inline-flex items-center gap-2 border-2 border-green-700 text-green-700 text-lg md:text-xl font-bold px-6 py-2 rounded-full hover:bg-green-700 hover:text-white transition cursor-default">
              আমাদের পণ্য সমূহ
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
              href="/shop"
              className="border-2 border-green-700 text-green-700 px-4 py-1 rounded-full font-bold hover:bg-green-700 hover:text-white text-xl transition"
            >
              সব পণ্য দেখুন →
            </Link>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <BlogSection blogs={blogs} />

      {/* Video Section */}
      <VideoSection
        videos={videos}
        youtubeChannelUrl={
          systemSettings?.youtubeChannelUrl || siteConfig.social.youtube
        }
        facebookPageUrl={
          systemSettings?.facebookPageUrl || siteConfig.social.facebook
        }
      />

      {/* Investment CTA — admin panel থেকে on/off */}
      {systemSettings?.enableInvestmentProgram && <InvestSection />}

      {/* Reviews — Footer-এর ঠিক আগে */}
      <TestimonialSection reviews={reviews} />
    </div>
  );
}
