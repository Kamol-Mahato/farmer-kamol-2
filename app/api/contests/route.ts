import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";
import {
  buildContestData,
  revalidateContests,
  submitContestToIndexNow,
} from "@/lib/contestPayload";

// অ্যাডমিন লিস্ট (ড্রাফটসহ) — পাবলিক পেজ সরাসরি ডাটাবেস থেকে পড়ে
export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }
  const items = await prisma.contestPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  const result = buildContestData(await req.json());
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const item = await prisma.contestPost.create({ data: result.data });
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
    console.error("Contest create error:", e);
    return NextResponse.json({ error: "সংরক্ষণ হয়নি" }, { status: 500 });
  }
}