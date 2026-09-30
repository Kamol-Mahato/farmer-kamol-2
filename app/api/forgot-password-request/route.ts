import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rateLimiter";
import { getApiLocale, tr } from "@/lib/apiLocale";

// বাংলাদেশী মোবাইল নম্বর ফরম্যাট: 01 দিয়ে শুরু, মোট ১১ ডিজিট
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export async function POST(request: Request) {
  const locale = getApiLocale(request);
  try {
    const { phone } = await request.json();

    if (!phone || !BD_PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        {
          error: tr(
            locale,
            "সঠিক বাংলাদেশী মোবাইল নম্বর দিন (১১ ডিজিট)",
            "Please enter a valid Bangladeshi mobile number (11 digits)",
          ),
        },
        { status: 400 },
      );
    }

    // 🔒 বার বার request করে spam করা ঠেকাতে rate limit
    const rateCheck = await checkRateLimit(`forgot-password:${phone}`);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.remainingMs || 0) / 60000);
      return NextResponse.json(
        {
          error: tr(
            locale,
            `অনেকবার request করা হয়েছে। ${minutes} মিনিট পর আবার চেষ্টা করুন।`,
            `Too many requests. Please try again in ${minutes} minute(s).`,
          ),
        },
        { status: 429 },
      );
    }
    await recordFailedAttempt(`forgot-password:${phone}`);

    const customer = await prisma.user.findUnique({ where: { phone } });

    // 🔒 আছে/নাই — একই response (user enumeration ঠেকাতে)
    if (customer) {
      await prisma.user.update({
        where: { phone },
        data: {
          passwordResetRequested: true,
          passwordResetRequestedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: tr(
        locale,
        "রিকোয়েস্ট গ্রহণ করা হয়েছে। অ্যাকাউন্ট থাকলে আমাদের টিম শীঘ্রই যোগাযোগ করবে। জরুরি হলে: 01737939688",
        "Your request has been received. If an account exists, our team will contact you shortly. For urgent help: 01737939688",
      ),
    });
  } catch (error) {
    console.error("FORGOT PASSWORD REQUEST ERROR:", error);
    return NextResponse.json(
      {
        error: tr(
          locale,
          "সমস্যা হয়েছে, আবার চেষ্টা করুন",
          "Something went wrong, please try again",
        ),
      },
      { status: 500 },
    );
  }
}
