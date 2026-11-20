import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminOnly } from "@/lib/adminAuth";
import { cleanDuckPrices, parseDuckPrices } from "@/lib/duckPrices";

// ✅ হাঁসের বাচ্চার বর্তমান দাম পড়া
export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }
  try {
    const settings = await prisma.systemControlCenter.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });
    return NextResponse.json(parseDuckPrices(settings.duckChickPrices));
  } catch (error) {
    console.error("DUCK PRICES GET ERROR:", error);
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 });
  }
}

// ✅ দাম সেভ করা — সেভের সময় হাঁসের বাচ্চার পেজ সঙ্গে সঙ্গে আপডেট হবে
export async function PUT(request: Request) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const data = {
      prices: cleanDuckPrices(body?.prices),
      updatedAt: new Date().toISOString(),
    };
    await prisma.systemControlCenter.upsert({
      where: { id: 1 },
      update: { duckChickPrices: JSON.stringify(data) },
      create: { id: 1, duckChickPrices: JSON.stringify(data) },
    });
    revalidatePath("/hasher-bacha");
    revalidatePath("/en/hasher-bacha");
    return NextResponse.json(data);
  } catch (error) {
    console.error("DUCK PRICES PUT ERROR:", error);
    return NextResponse.json({ error: "সংরক্ষণ করা যায়নি" }, { status: 500 });
  }
}