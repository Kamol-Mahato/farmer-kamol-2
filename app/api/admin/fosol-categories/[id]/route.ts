import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  const { id } = await params;
  const catId = Number(id);
  if (!catId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const category = await prisma.fosolCategory.update({
      where: { id: catId },
      data: {
        name: body.name?.trim(),
        nameEn: body.nameEn?.trim() || null,
        slug: body.slug?.trim().toLowerCase(),
        description: body.description ?? null,
        descriptionEn: body.descriptionEn ?? null,
        displayOrder: body.displayOrder,
        isVisible: body.isVisible,
      },
    });
    return NextResponse.json(category);
  } catch (e) {
    console.error(e);
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
  const catId = Number(id);
  if (!catId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.fosolCategory.delete({ where: { id: catId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "মুছা যায়নি (আইটেম থাকতে পারে)" },
      { status: 500 },
    );
  }
}
