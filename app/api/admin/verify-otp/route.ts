import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyOtpHash } from "@/lib/otp"
import { checkRateLimit, recordFailedAttempt, clearAttempts } from "@/lib/rateLimiter"

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: "সব তথ্য দিন" }, { status: 400 })
    }

    const rateCheck = await checkRateLimit(`admin-verify-otp:${phone}`)
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000)
      return NextResponse.json(
        { error: `অনেকবার ভুল চেষ্টা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।` },
        { status: 429 }
      )
    }

    const admin = await prisma.user.findUnique({ where: { phone } })

    if (
      !admin ||
      !admin.otp ||
      (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")
    ) {
      await recordFailedAttempt(`admin-verify-otp:${phone}`)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (admin.otpAttempts >= 5) {
      await prisma.user.update({
        where: { phone },
        data: { otp: null, otpExpiry: null, otpAttempts: 0 },
      })
      return NextResponse.json(
        { error: "অনেকবার ভুল চেষ্টা হয়েছে, নতুন OTP চান" },
        { status: 429 }
      )
    }

    if (!admin.otpExpiry || new Date() > admin.otpExpiry) {
      await recordFailedAttempt(`admin-verify-otp:${phone}`)
      return NextResponse.json({ error: "OTP expired" }, { status: 400 })
    }

    if (!verifyOtpHash(String(otp), admin.otp)) {
      await prisma.user.update({
        where: { phone },
        data: { otpAttempts: { increment: 1 } },
      })
      await recordFailedAttempt(`admin-verify-otp:${phone}`)
      return NextResponse.json({ error: "Wrong OTP" }, { status: 400 })
    }

    await clearAttempts(`admin-verify-otp:${phone}`)
    return NextResponse.json({ message: "OTP verified" })
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error)
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 })
  }
}