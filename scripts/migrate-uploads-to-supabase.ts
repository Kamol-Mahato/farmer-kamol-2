import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter } as any);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const BUCKET = process.env.SUPABASE_BUCKET!;

async function main() {
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !BUCKET
  ) {
    throw new Error(
      "SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET .env-এ থাকতে হবে",
    );
  }

  const images = await prisma.productImage.findMany({
    where: { imageUrl: { startsWith: "/uploads/" } },
  });

  console.log(`Found ${images.length} local images to migrate`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const img of images) {
    // imageUrl = "/uploads/xxx.jpg" → public/uploads/xxx.jpg
    const localPath = path.join(process.cwd(), "public", img.imageUrl);

    if (!fs.existsSync(localPath)) {
      console.log("SKIP (file missing):", img.imageUrl);
      skip++;
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const filename = path.basename(img.imageUrl);
    const contentType = filename.endsWith(".png")
      ? "image/png"
      : filename.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("Upload failed:", filename, error.message);
      fail++;
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    const publicUrl = data.publicUrl;

    await prisma.productImage.update({
      where: { id: img.id },
      data: { imageUrl: publicUrl },
    });

    console.log("OK:", img.imageUrl, "→", publicUrl);
    ok++;
  }

  console.log("\nDone!");
  console.log(`OK: ${ok} | SKIP: ${skip} | FAIL: ${fail}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
