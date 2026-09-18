import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import { verifyAdminOrAgent } from "@/lib/adminAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ investmentId: string }> },
) {
  const { investmentId } = await params;
  const id = parseInt(investmentId, 10);
  if (!id) {
    return NextResponse.json({ error: "ভুল আইডি" }, { status: 400 });
  }

  const investment = await prisma.investment.findUnique({
    where: { id },
    include: {
      project: true,
      agreement: true,
      investorProfile: {
        select: {
          userId: true, // ownership-check-এর জন্য দরকার
          fatherName: true,
          address: true,
          nidNumber: true,
          photoImageUrl: true,
          signatureImageUrl: true,
          user: { select: { name: true, phone: true } },
        },
      },
    },
  });

  if (!investment || !investment.agreement) {
    return NextResponse.json({ error: "চুক্তি পাওয়া যায়নি" }, { status: 404 });
  }

  // ownership check — নিজের চুক্তি অথবা admin/agent হলে দেখা যাবে
  const customerId = await getCustomerId();
  const admin = await verifyAdminOrAgent();
  const isOwner = customerId && customerId === investment.investorProfile.userId;

  if (!isOwner && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(investment);
}