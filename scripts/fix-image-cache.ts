import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const BUCKET = process.env.SUPABASE_BUCKET!;
const ONE_YEAR = "31536000";

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

  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list("", { limit: 1000 });
  if (error) throw error;

  console.log(`মোট ফাইল: ${files?.length ?? 0}\n`);

  let done = 0;
  let failed = 0;

  for (const file of files ?? []) {
    const { data: downloaded, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(file.name);

    if (downloadError || !downloaded) {
      console.error(
        `❌ ডাউনলোড ব্যর্থ: ${file.name} — ${downloadError?.message}`,
      );
      failed++;
      continue;
    }

    const buffer = Buffer.from(await downloaded.arrayBuffer());
    const contentType = file.metadata?.mimetype || "application/octet-stream";

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(file.name, buffer, {
        contentType,
        upsert: true,
        cacheControl: ONE_YEAR,
      });

    if (uploadError) {
      console.error(`❌ আপলোড ব্যর্থ: ${file.name} — ${uploadError.message}`);
      failed++;
      continue;
    }

    console.log(`✅ ${file.name} — cache 1 বছর করা হলো`);
    done++;
  }

  console.log("\n--- সারাংশ ---");
  console.log(`ঠিক হয়েছে: ${done} টি ফাইল, ব্যর্থ: ${failed} টি`);
}

main().catch(console.error);
