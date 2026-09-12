import { NextResponse } from "next/server";
import { getCustomerId } from "@/lib/customerAuth";
import { getRedis } from "@/lib/rateLimiter";
import { generateOTP, getOTPExpiry, hashOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const customerId = await getCustomerId();
    if (!customerId) {
      return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
    }

    const { email } = await request.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "সঠিক ইমেইল দিন" }, { status: 400 });
    }

    // 🔒 একই অ্যাকাউন্ট থেকে বারবার "আবার পাঠান" চাপলে ৬০ সেকেন্ড অপেক্ষা করাতে
    const cooldownKey = `investor-otp-cooldown:${customerId}`;
    const alreadySent = await getRedis().get(cooldownKey);
    if (alreadySent) {
      return NextResponse.json(
        { error: "একটু আগেই কোড পাঠানো হয়েছে, ৬০ সেকেন্ড পর আবার চেষ্টা করুন" },
        { status: 429 },
      );
    }

    const otp = generateOTP();
    await getRedis().set(
      `investor-otp:${customerId}`,
      JSON.stringify({ otpHash: hashOtp(otp), email, attempts: 0 }),
      { ex: 5 * 60 },
    );
    await getRedis().set(cooldownKey, "1", { ex: 60 });

    await sendOtpEmail(email, otp);

    return NextResponse.json({ success: true, message: "কোড পাঠানো হয়েছে" });
  } catch (error) {
    console.error("INVESTOR OTP REQUEST ERROR:", error);
    return NextResponse.json({ error: "কোড পাঠাতে সমস্যা হয়েছে" }, { status: 500 });
  }
}