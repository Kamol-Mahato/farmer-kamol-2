import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";
import { sanitizeHtml } from "@/lib/sanitize";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!itemId || isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const item = await prisma.fosolItem.update({
      where: { id: itemId },
      data: {
        title: body.title?.trim(),
        slug: body.slug?.trim(),
        titleEn: body.titleEn?.trim() || null,
        slugEn: body.slugEn?.trim() || null,
        titleBanglish: body.titleBanglish?.trim() || null,
        content: body.content != null ? sanitizeHtml(body.content) : undefined,
        contentEn:
          body.contentEn != null
            ? body.contentEn
              ? sanitizeHtml(body.contentEn)
              : null
            : undefined,
        image: body.image ?? null,
        scientificName: body.scientificName ?? null,
        season: body.season ?? null,
        seasonEn: body.seasonEn?.trim() || null,
        region: body.region ?? null,
        regionEn: body.regionEn?.trim() || null,
        uses: body.uses ?? null,
        usesEn: body.usesEn?.trim() || null,
        categoryId: body.categoryId ? Number(body.categoryId) : undefined,
        isPublished: body.isPublished,
        isFeatured: body.isFeatured,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
      },
      include: { category: true },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    console.error(e);
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Slug আগেই ব্যবহৃত" }, { status: 409 });
    }
    return NextResponse.json({ error: "আপডেট ব্যর্থ" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!itemId || isNaN(itemId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.fosolItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "মুছা যায়নি" }, { status: 500 });
  }
}
