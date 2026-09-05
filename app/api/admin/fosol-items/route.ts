import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";
import { sanitizeHtml } from "@/lib/sanitize";

export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  const items = await prisma.fosolItem.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title?.trim() || !body.slug?.trim() || !body.categoryId) {
      return NextResponse.json(
        { error: "শিরোনাম, slug ও ক্যাটাগরি আবশ্যক" },
        { status: 400 },
      );
    }

    const item = await prisma.fosolItem.create({
      data: {
        title: body.title.trim(),
        slug: body.slug.trim(),
        titleEn: body.titleEn?.trim() || null,
        slugEn: body.slugEn?.trim() || null,
        titleBanglish: body.titleBanglish?.trim() || null,
        content: sanitizeHtml(body.content || ""),
        contentEn: body.contentEn ? sanitizeHtml(body.contentEn) : null,
        image: body.image || null,
        scientificName: body.scientificName || null,
        season: body.season || null,
        region: body.region || null,
        uses: body.uses || null,
        categoryId: Number(body.categoryId),
        isPublished: !!body.isPublished,
        isFeatured: !!body.isFeatured,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
      },
      include: { category: true },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    console.error(e);
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Slug আগেই ব্যবহৃত" }, { status: 409 });
    }
    return NextResponse.json({ error: "সংরক্ষণ ব্যর্থ" }, { status: 500 });
  }
}
