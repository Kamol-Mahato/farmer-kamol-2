import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";
import {
  buildContestData,
  revalidateContests,
  submitContestToIndexNow,
} from "@/lib/contestPayload";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }
  const { id } = await params;
  const item = await prisma.contestPost.findUnique({
    where: { id: parseInt(id) },
  });
  return NextResponse.json(item);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  const { id } = await params;
  const result = buildContestData(await req.json());
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const old = await prisma.contestPost.findUnique({
      where: { id: parseInt(id) },
      select: { slug: true },
    });
    const item = await prisma.contestPost.update({
      where: { id: parseInt(id) },
      data: result.data,
    });
    if (old?.slug && old.slug !== item.slug) revalidateContests(old.slug);
    revalidateContests(item.slug);
    if (item.isPublished) submitContestToIndexNow(item.slug);
    return NextResponse.json(item);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "এই slug আগে ব্যবহার হয়েছে, অন্যটা দিন" },
        { status: 409 },
      );
    }
    console.error("Contest update error:", e);
    return NextResponse.json({ error: "আপডেট হয়নি" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }
  const { id } = await params;
  const item = await prisma.contestPost.delete({
    where: { id: parseInt(id) },
  });
  revalidateContests(item.slug);
  return NextResponse.json({ success: true });
}