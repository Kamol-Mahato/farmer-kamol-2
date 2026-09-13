import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";

export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    include: {
      investment: {
        include: {
          project: { select: { name: true } },
          investorProfile: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transactions);
}