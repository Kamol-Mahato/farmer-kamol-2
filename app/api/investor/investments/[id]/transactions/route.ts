import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import sharp from "sharp";

let supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    );
  }
  return supabase;
}

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const { id } = await params;
  const investmentId = parseInt(id, 10);
  if (!investmentId) {
    return NextResponse.json({ error: "ভুল আইডি" }, { status: 400 });
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: customerId },
  });
  if (!profile) {
    return NextResponse.json({ error: "প্রোফাইল পাওয়া যায়নি" }, { status: 400 });
  }

  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
  });
  if (!investment || investment.investorProfileId !== profile.id) {
    return NextResponse.json({ error: "ইনভেস্টমেন্ট পাওয়া যায়নি" }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const amount = parseFloat(formData.get("amount") as string);
    const note = (formData.get("note") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "সঠিক পরিমাণ দিন" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "শুধুমাত্র JPG, PNG বা WEBP ছবি আপলোড করা যাবে" },
        { status: 400 },
      );
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "ছবির সাইজ ১০ এমবি-র বেশি হতে পারবে না" },
        { status: 400 },
      );
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let buffer: Buffer = rawBuffer;
    try {
      buffer = await sharp(rawBuffer)
        .resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
    } catch (err) {
      console.error("Slip resize error, raw ফাইল আপলোড হচ্ছে:", err);
    }

    const filename = `investors/slips/${investmentId}-${Date.now()}.jpg`;
    const { error: uploadError } = await getSupabase()
      .storage.from(process.env.SUPABASE_BUCKET!)
      .upload(filename, buffer, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "31536000",
      });

    if (uploadError) {
      console.error("Slip upload error:", uploadError);
      return NextResponse.json({ error: "আপলোড ব্যর্থ হয়েছে" }, { status: 500 });
    }

    const { data } = getSupabase()
      .storage.from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename);

    const transaction = await prisma.transaction.create({
      data: {
        investmentId,
        type: "DEPOSIT",
        amount,
        slipImageUrl: data.publicUrl,
        note,
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Deposit slip upload error:", error);
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}