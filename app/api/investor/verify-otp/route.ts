import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import { getRedis } from "@/lib/rateLimiter";
import { verifyOtpHash } from "@/lib/otp";

export async function POST(request: Request) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
    }

    const { otp } = await request.json();
    if (!otp) {
      return NextResponse.json({ error: "কোড দিন" }, { status: 400 });
    }

    const key = `investor-otp:${customerId}`;
    const raw = await getRedis().get<string>(key);
    if (!raw) {
      return NextResponse.json(
        { error: "কোডের মেয়াদ শেষ, নতুন কোড চান" },
        { status: 400 },
      );
    }

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;

    if (data.attempts >= 5) {
      await getRedis().del(key);
      return NextResponse.json(
        { error: "অনেকবার ভুল চেষ্টা হয়েছে, নতুন কোড চান" },
        { status: 429 },
      );
    }

    if (!verifyOtpHash(String(otp), data.otpHash)) {
      data.attempts += 1;
      await getRedis().set(key, JSON.stringify(data), { ex: 5 * 60 });
      return NextResponse.json({ error: "কোড সঠিক নয়" }, { status: 400 });
    }

    await getRedis().del(key);

    await prisma.investorProfile.upsert({
      where: { userId: customerId },
      update: { email: data.email, emailVerified: true },
      create: { userId: customerId, email: data.email, emailVerified: true },
    });

    return NextResponse.json({ success: true, message: "ভেরিফাই সফল হয়েছে" });
  } catch (error) {
    console.error("INVESTOR OTP VERIFY ERROR:", error);
    return NextResponse.json({ error: "ভেরিফাই করা যায়নি" }, { status: 500 });
  }
}