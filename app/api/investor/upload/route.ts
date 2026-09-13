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

// ধরন অনুযায়ী কোন resize আর কোন DB ফিল্ডে বসবে
const KIND_CONFIG: Record<
  string,
  { width: number; height: number; field: "nidImageUrl" | "photoImageUrl" | "signatureImageUrl" }
> = {
  nid: { width: 1000, height: 700, field: "nidImageUrl" },
  photo: { width: 400, height: 400, field: "photoImageUrl" },
  signature: { width: 600, height: 300, field: "signatureImageUrl" },
};

export async function POST(request: Request) {
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const existing = await prisma.investorProfile.findUnique({
    where: { userId: customerId },
  });
  if (!existing || !existing.emailVerified) {
    return NextResponse.json(
      { error: "আগে ইমেইল ভেরিফাই করুন" },
      { status: 400 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kind = formData.get("kind") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "কোনো ফাইল পাওয়া যায়নি" },
        { status: 400 },
      );
    }
    if (!kind || !KIND_CONFIG[kind]) {
      return NextResponse.json(
        { error: "অজানা ফাইল টাইপ" },
        { status: 400 },
      );
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

    const config = KIND_CONFIG[kind];
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    let buffer: Buffer = rawBuffer;
    try {
      buffer = await sharp(rawBuffer)
        .resize({
          width: config.width,
          height: config.height,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer();
    } catch (err) {
      console.error("Investor doc resize error, raw ফাইল আপলোড হচ্ছে:", err);
    }

    const filename = `investors/${kind}-${customerId}-${Date.now()}.jpg`;

    const { error: uploadError } = await getSupabase()
      .storage.from(process.env.SUPABASE_BUCKET!)
      .upload(filename, buffer, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "31536000",
      });

    if (uploadError) {
      console.error("Investor doc upload error:", uploadError);
      return NextResponse.json(
        { error: "আপলোড ব্যর্থ হয়েছে" },
        { status: 500 },
      );
    }

    const { data } = getSupabase()
      .storage.from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename);

    const url = data.publicUrl;

    await prisma.investorProfile.update({
      where: { userId: customerId },
      data: { [config.field]: url },
    });

    return NextResponse.json({ success: true, url, field: config.field });
  } catch (error) {
    console.error("Investor doc upload API error:", error);
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}