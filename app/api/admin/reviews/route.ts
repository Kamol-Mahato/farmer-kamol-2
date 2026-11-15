import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";

export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
  }

  try {
    const reviews = await prisma.productReview.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [
        { isApproved: "asc" }, // pending (false) আগে দেখাবে
        { createdAt: "desc" },
      ],
    });
    // রিভিউয়ের নম্বর দিয়ে এই পণ্যের কোনো অর্ডার আছে কি না মিলিয়ে দেখা (শুধু admin-এর জন্য)
    const withMatch = await Promise.all(
      reviews.map(async (r) => {
        const phone = r.reviewerPhone || r.user?.phone;
        const hasOrder = phone
          ? !!(await prisma.orderItem.findFirst({
              where: {
                productId: r.productId,
                order: { customer: { phone } },
              },
              select: { id: true },
            }))
          : false;
        return { ...r, hasOrder };
      }),
    );
    return NextResponse.json(withMatch);
  } catch (error) {
    console.error("ADMIN REVIEWS GET ERROR:", error);
    return NextResponse.json({ error: "লোড করা যায়নি" }, { status: 500 });
  }
}
