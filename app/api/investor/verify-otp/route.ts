import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import { getRedis } from "@/lib/rateLimiter";
import { verifyOtpHash } from "@/lib/otp";
import { getApiLocale, tr } from "@/lib/apiLocale";

export async function POST(request: Request) {
  const locale = getApiLocale(request);
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json(
        { error: tr(locale, "লগইন করুন", "Please log in") },
        { status: 401 },
      );
    }

    const { otp } = await request.json();
    if (!otp) {
      return NextResponse.json(
        { error: tr(locale, "কোড দিন", "Please enter the code") },
        { status: 400 },
      );
    }

    const key = `investor-otp:${customerId}`;
    const raw = await getRedis().get<string>(key);
    if (!raw) {
      return NextResponse.json(
        {
          error: tr(
            locale,
            "কোডের মেয়াদ শেষ, নতুন কোড চান",
            "The code has expired. Please request a new one.",
          ),
        },
        { status: 400 },
      );
    }

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (data.attempts >= 5) {
      await getRedis().del(key);
      return NextResponse.json(
        {
          error: tr(
            locale,
            "অনেকবার ভুল চেষ্টা হয়েছে, নতুন কোড চান",
            "Too many incorrect attempts. Please request a new code.",
          ),
        },
        { status: 429 },
      );
    }

    if (!verifyOtpHash(String(otp), data.otpHash)) {
      data.attempts += 1;
      await getRedis().set(key, JSON.stringify(data), { ex: 5 * 60 });
      return NextResponse.json(
        { error: tr(locale, "কোড সঠিক নয়", "Incorrect code") },
        { status: 400 },
      );
    }

    await getRedis().del(key);

    await prisma.investorProfile.upsert({
      where: { userId: customerId },
      update: { email: data.email, emailVerified: true },
      create: { userId: customerId, email: data.email, emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      message: tr(locale, "ভেরিফাই সফল হয়েছে", "Verification successful"),
    });
  } catch (error) {
    console.error("INVESTOR OTP VERIFY ERROR:", error);
    return NextResponse.json(
      { error: tr(locale, "ভেরিফাই করা যায়নি", "Could not verify") },
      { status: 500 },
    );
  }
}