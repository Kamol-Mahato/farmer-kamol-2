import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyOtpHash } from "@/lib/otp";
import {
  checkRateLimit,
  recordFailedAttempt,
  clearAttempts,
} from "@/lib/rateLimiter";

export async function POST(req: Request) {
  try {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({ error: "সব ফিল্ড আবশ্যক" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" },
        { status: 400 },
      );
    }

    const rateCheck = await checkRateLimit(`admin-reset-password:${phone}`);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000);
      return NextResponse.json(
        {
          error: `অনেকবার ভুল চেষ্টা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।`,
        },
        { status: 429 },
      );
    }

    const admin = await prisma.user.findUnique({ where: { phone } });

    if (
      !admin ||
      !admin.otp ||
      (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN")
    ) {
      await recordFailedAttempt(`admin-reset-password:${phone}`);
      return NextResponse.json({ error: "ভুল রিকোয়েস্ট" }, { status: 400 });
    }

    if (admin.otpAttempts >= 5) {
      await prisma.user.update({
        where: { phone },
        data: { otp: null, otpExpiry: null, otpAttempts: 0 },
      });
      return NextResponse.json(
        { error: "অনেকবার ভুল চেষ্টা হয়েছে, নতুন OTP চান" },
        { status: 429 },
      );
    }

    if (!admin.otpExpiry || new Date() > admin.otpExpiry) {
      await recordFailedAttempt(`admin-reset-password:${phone}`);
      return NextResponse.json({ error: "OTP এর মেয়াদ শেষ" }, { status: 400 });
    }

    if (!verifyOtpHash(String(otp), admin.otp)) {
      await prisma.user.update({
        where: { phone },
        data: { otpAttempts: { increment: 1 } },
      });
      await recordFailedAttempt(`admin-reset-password:${phone}`);
      return NextResponse.json({ error: "ভুল OTP" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { phone },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
        otpAttempts: 0,
      },
    });

    await clearAttempts(`admin-reset-password:${phone}`);
    return NextResponse.json({ message: "Password reset success" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}
