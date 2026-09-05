import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";

export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  const categories = await prisma.fosolCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    let slug = (body.slug || "").trim().toLowerCase();

    if (!name) {
      return NextResponse.json(
        { error: "ক্যাটাগরির নাম দিন" },
        { status: 400 },
      );
    }

    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0980-\u09FF-]/g, "");
    }

    const existing = await prisma.fosolCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "এই slug আগেই আছে" }, { status: 409 });
    }

    const maxOrder = await prisma.fosolCategory.aggregate({
      _max: { displayOrder: true },
    });
    const category = await prisma.fosolCategory.create({
      data: {
        name,
        nameEn: body.nameEn?.trim() || null,
        slug,
        description: body.description || null,
        descriptionEn: body.descriptionEn || null,
        displayOrder:
          body.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1,
        isVisible: body.isVisible ?? true,
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "সংরক্ষণ ব্যর্থ" }, { status: 500 });
  }
}
