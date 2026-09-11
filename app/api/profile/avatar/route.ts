import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { verifyCustomer } from "@/lib/customerAuth";
import { verifyAdminOrAgent } from "@/lib/adminAuth";
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

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // ১০ MB পর্যন্ত raw ফাইল গ্রহণযোগ্য, compress হয়ে যাবে
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

async function getCurrentUser() {
  const customer = await verifyCustomer();
  if (customer) return customer;
  const staff = await verifyAdminOrAgent();
  if (staff) return staff;
  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "কোনো ফাইল পাওয়া যায়নি" },
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

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // ✅ প্রোফাইল ছবি resize + compress (২৫৬x২৫৬ যথেষ্ট, avatar কখনো বড় দেখানো হয় না)
    let buffer: Buffer = rawBuffer;
    let outputType: "jpeg" | "png" | "webp" = "jpeg";
    try {
      let pipeline = sharp(rawBuffer).resize({
        width: 256,
        height: 256,
        fit: "cover",
        withoutEnlargement: true,
      });

      if (file.type === "image/png") {
        pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
        outputType = "png";
      } else if (file.type === "image/webp") {
        pipeline = pipeline.webp({ quality: 80 });
        outputType = "webp";
      } else {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
        outputType = "jpeg";
      }

      buffer = await pipeline.toBuffer();
    } catch (err) {
      console.error(
        "Avatar resize error, ফলব্যাক হিসেবে আসল ছবি আপলোড হচ্ছে:",
        err,
      );
    }

    const MIME_TO_EXT: Record<string, string> = {
      jpeg: "jpg",
      png: "png",
      webp: "webp",
    };
    const ext = MIME_TO_EXT[outputType];
    const filename = `avatars/avatar-${user.id}-${Date.now()}.${ext}`;

    const contentType =
      outputType === "jpeg" ? "image/jpeg" : `image/${outputType}`;

    const { error: uploadError } = await getSupabase()
      .storage.from(process.env.SUPABASE_BUCKET!)
      .upload(filename, buffer, {
        contentType,
        upsert: true,
        cacheControl: "31536000",
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json(
        { error: "আপলোড ব্যর্থ হয়েছে" },
        { status: 500 },
      );
    }

    const { data } = getSupabase()
      .storage.from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename);

    const avatarUrl = data.publicUrl;

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("Avatar API Error:", error);
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ avatarUrl: user.avatarUrl || null });
}
