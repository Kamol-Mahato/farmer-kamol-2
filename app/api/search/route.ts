import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") || 8),
    20,
  );

  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const term = q;

  const [products, blogs, videos, galleries] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { nameEn: { contains: term, mode: "insensitive" } },
          { nameBanglish: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { descriptionEn: { contains: term, mode: "insensitive" } },
        ],
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.blog.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { titleEn: { contains: term, mode: "insensitive" } },
          { titleBanglish: { contains: term, mode: "insensitive" } },
          { content: { contains: term, mode: "insensitive" } },
          { category: { contains: term, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.youtubeVideo.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { titleEn: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { descriptionEn: { contains: term, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { displayOrder: "asc" },
    }),
    prisma.galleryItem.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: term, mode: "insensitive" } },
          { titleEn: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { descriptionEn: { contains: term, mode: "insensitive" } },
        ],
      },
      include: {
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
      },
      take: limit,
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  const results = [
    ...products.map((p) => ({
      type: "product" as const,
      id: p.id,
      title: p.name,
      titleEn: p.nameEn,
      subtitle: `৳${p.discountPrice ?? p.pricePerUnit}/${p.unit}`,
      image: p.images[0]?.imageUrl || null,
      url: `/shop/${p.slug}`,
      urlEn: p.slugEn ? `/en/shop/${p.slugEn}` : `/en/shop/${p.slug}`,
    })),
    ...blogs.map((b) => ({
      type: "blog" as const,
      id: b.id,
      title: b.title,
      titleEn: b.titleEn,
      subtitle: b.category,
      image: b.image || null,
      url: `/blog/${b.slug}`,
      urlEn: b.slugEn ? `/en/blog/${b.slugEn}` : `/en/blog/${b.slug}`,
    })),
    ...videos.map((v) => ({
      type: "video" as const,
      id: v.id,
      title: v.title,
      titleEn: v.titleEn,
      subtitle: v.platform || "VIDEO",
      image: v.thumbnailUrl || null,
      url: `/media/video`,
      urlEn: `/en/media/video`,
      externalUrl: v.youtubeUrl,
    })),
    ...galleries.map((g) => ({
      type: "gallery" as const,
      id: g.id,
      title: g.title,
      titleEn: g.titleEn,
      subtitle: "গ্যালারি",
      image: g.images[0]?.imageUrl || null,
      url: `/media/image`,
      urlEn: `/en/media/image`,
    })),
  ].slice(0, limit);

  return NextResponse.json({ results });
}
