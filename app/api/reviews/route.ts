import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import { getApiLocale, tr } from "@/lib/apiLocale";
import { normalizePhone, isValidBDPhone } from "@/lib/phone";

// এখন যে কেউ রিভিউ দিতে পারবে (অ্যাকাউন্ট লাগবে না) — নাম ও নম্বর বাধ্যতামূলক
export async function GET() {
  return NextResponse.json({ eligible: true });
}

export async function POST(request: Request) {
  const locale = getApiLocale(request);
  const customerId = await getCustomerId(); // লগইন থাকলে যুক্ত হবে, না থাকলে null

  try {
    const body = await request.json();
    const productId = Number(body.productId);
    const rating = Number(body.rating);
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
    const phone =
      typeof body.phone === "string" ? normalizePhone(body.phone) : "";
    const comment =
      typeof body.comment === "string"
        ? body.comment.trim().slice(0, 1000)
        : null;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: tr(locale, "সঠিক তথ্য দিন", "Please provide valid details") },
        { status: 400 },
      );
    }
    if (!name || !isValidBDPhone(phone)) {
      return NextResponse.json(
        {
          error: tr(
            locale,
            "আপনার নাম ও সঠিক মোবাইল নম্বর দিন",
            "Please enter your name and a valid mobile number",
          ),
        },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: tr(locale, "পণ্য পাওয়া যায়নি", "Product not found") },
        { status: 404 },
      );
    }

    // একই নম্বর থেকে একই পণ্যে একটির বেশি রিভিউ নয়
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId,
        OR: [
          { reviewerPhone: phone },
          ...(customerId ? [{ userId: customerId }] : []),
        ],
      },
    });
    if (existingReview) {
      return NextResponse.json(
        {
          error: tr(
            locale,
            "এই নম্বর থেকে ইতিমধ্যে এই পণ্যে রিভিউ দেওয়া হয়েছে",
            "A review has already been submitted for this product from this number",
          ),
        },
        { status: 409 },
      );
    }

    // স্প্যাম ঠেকাতে: এক নম্বর থেকে ১ ঘণ্টায় ৩টির বেশি রিভিউ নয়
    const recentCount = await prisma.productReview.count({
      where: {
        reviewerPhone: phone,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentCount >= 3) {
      return NextResponse.json(
        {
          error: tr(
            locale,
            "অনেকবার চেষ্টা হয়েছে, কিছুক্ষণ পরে আবার চেষ্টা করুন",
            "Too many attempts, please try again later",
          ),
        },
        { status: 429 },
      );
    }

    // ✅ isApproved সবসময় false — admin approve না করা পর্যন্ত public-এ দেখাবে না
    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: customerId ?? null,
        reviewerName: name,
        reviewerPhone: phone,
        rating,
        comment,
        isApproved: false,
      },
    });

    return NextResponse.json({ success: true, id: review.id });
  } catch (error) {
    console.error("REVIEW SUBMIT ERROR:", error);
    return NextResponse.json(
      {
        error: tr(
          locale,
          "রিভিউ জমা দেওয়া যায়নি",
          "Could not submit your review",
        ),
      },
      { status: 500 },
    );
  }
}