import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const transactionId = parseInt(id, 10);
  if (!transactionId) {
    return NextResponse.json({ error: "ভুল আইডি" }, { status: 400 });
  }

  const { status, note } = await request.json();
  if (status !== "CONFIRMED" && status !== "REJECTED") {
    return NextResponse.json({ error: "ভুল স্ট্যাটাস" }, { status: 400 });
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { investment: true },
  });
  if (!transaction) {
    return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status,
      confirmedAt: status === "CONFIRMED" ? new Date() : null,
      note: note || transaction.note,
    },
  });

  if (
    status === "CONFIRMED" &&
    transaction.type === "DEPOSIT" &&
    transaction.investment.status === "PENDING"
  ) {
    await prisma.investment.update({
      where: { id: transaction.investmentId },
      data: { status: "ACTIVE", startDate: new Date() },
    });
  }

  return NextResponse.json({ success: true, transaction: updated });
}