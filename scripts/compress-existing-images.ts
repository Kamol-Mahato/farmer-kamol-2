import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"
import * as dotenv from "dotenv"

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const BUCKET = process.env.SUPABASE_BUCKET!

const DRY_RUN = process.argv.includes("--dry")
const SIZE_THRESHOLD_KB = 300 // এর চেয়ে বড় ফাইল কম্প্রেস করা হবে

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !BUCKET) {
    throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET .env-এ থাকতে হবে")
  }

  const { data: files, error } = await supabase.storage.from(BUCKET).list("", { limit: 1000 })
  if (error) throw error

  console.log(`মোট ফাইল: ${files?.length ?? 0}${DRY_RUN ? " (DRY RUN — কিছু পরিবর্তন হবে না)" : ""}\n`)

  let totalBeforeKB = 0
  let totalAfterKB = 0
  let compressedCount = 0

  for (const file of files ?? []) {
    const sizeKB = Math.round((file.metadata?.size ?? 0) / 1024)
    totalBeforeKB += sizeKB

    if (sizeKB <= SIZE_THRESHOLD_KB) {
      totalAfterKB += sizeKB
      continue
    }

    console.log(`বড় ফাইল: ${file.name} — ${sizeKB}KB`)

    if (DRY_RUN) {
      totalAfterKB += sizeKB
      continue
    }

    const { data: downloaded, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(file.name)
    if (downloadError || !downloaded) {
      console.error("  ডাউনলোড ব্যর্থ:", downloadError?.message)
      totalAfterKB += sizeKB
      continue
    }

    const buffer = Buffer.from(await downloaded.arrayBuffer())
    const ext = file.name.split(".").pop()?.toLowerCase()

    let pipeline = sharp(buffer).resize({ width: 1200, withoutEnlargement: true })
    let contentType = "image/jpeg"
    if (ext === "png") {
      pipeline = pipeline.png({ quality: 80, compressionLevel: 9 })
      contentType = "image/png"
    } else if (ext === "webp") {
      pipeline = pipeline.webp({ quality: 80 })
      contentType = "image/webp"
    } else {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true })
    }

    const compressed = await pipeline.toBuffer()
    const newSizeKB = Math.round(compressed.length / 1024)
    totalAfterKB += newSizeKB

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(file.name, compressed, { contentType, upsert: true })

    if (uploadError) {
      console.error("  আপলোড ব্যর্থ:", uploadError.message)
      continue
    }

    console.log(`  ✅ ${sizeKB}KB → ${newSizeKB}KB`)
    compressedCount++
  }

  console.log("\n--- সারাংশ ---")
  console.log(`কম্প্রেস হয়েছে: ${compressedCount} টি ফাইল`)
  console.log(`মোট সাইজ: ${Math.round(totalBeforeKB / 1024)}MB → ${Math.round(totalAfterKB / 1024)}MB`)
}

main().catch(console.error)