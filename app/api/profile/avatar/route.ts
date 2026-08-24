import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"
import { verifyCustomer } from "@/lib/customerAuth"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

let supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
    )
  }
  return supabase
}

const MAX_FILE_SIZE = 200 * 1024 // 200 KB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

async function getCurrentUser() {
  const customer = await verifyCustomer()
  if (customer) return customer
  const staff = await verifyAdminOrAgent()
  if (staff) return staff
  return null
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "শুধুমাত্র JPG, PNG বা WEBP ছবি আপলোড করা যাবে" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ছবির সাইজ ২০০ কেবি-র বেশি হতে পারবে না" },
        { status: 400 }
      )
    }

    const MIME_TO_EXT: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }
    const ext = MIME_TO_EXT[file.type] || "jpg"
    const filename = `avatars/avatar-${user.id}-${Date.now()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await getSupabase().storage
      .from(process.env.SUPABASE_BUCKET!)
      .upload(filename, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error("Avatar upload error:", uploadError)
      return NextResponse.json({ error: "আপলোড ব্যর্থ হয়েছে" }, { status: 500 })
    }

    const { data } = getSupabase().storage
      .from(process.env.SUPABASE_BUCKET!)
      .getPublicUrl(filename)

    const avatarUrl = data.publicUrl

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    })

    return NextResponse.json({ avatarUrl })
  } catch (error) {
    console.error("Avatar API Error:", error)
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ avatarUrl: user.avatarUrl || null })
}