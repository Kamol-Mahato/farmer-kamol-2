import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";

export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    include: {
      _count: { select: { investments: true } },
      investments: {
        where: { status: { in: ["ACTIVE", "PENDING"] } },
        select: { amount: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ✅ প্রতি প্রজেক্টে raisedAmount + progressPct যোগ করা
  const withRaised = projects.map((p) => {
    const raisedAmount = p.investments
      .filter((i) => i.status === "ACTIVE")
      .reduce((sum, i) => sum + i.amount, 0);
    const pendingAmount = p.investments
      .filter((i) => i.status === "PENDING")
      .reduce((sum, i) => sum + i.amount, 0);
    const target = p.targetAmount ?? 0;
    const progressPct =
      target > 0 ? Math.min(100, Math.round((raisedAmount / target) * 100)) : null;

    // investments অ্যারে রেসপন্স থেকে বাদ (শুধু হিসাবের জন্য ছিল)
    const { investments, ...rest } = p;
    return {
      ...rest,
      raisedAmount,
      pendingAmount,
      progressPct,
    };
  });

  return NextResponse.json(withRaised);
}

export async function POST(request: Request) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    name,
    description,
    startDate,
    isAcceptingFunds,
    isFeaturedOnInvestPage,
    targetAmount,
    ownContributionAmount,
    fundUsage,
    timeline,
    risks,
    profitShareNote,
    durationMonths,
    investorProfitPct,
    totalLots,
    lotUnitName,
  } = await request.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "প্রজেক্টের নাম দিন" },
      { status: 400 },
    );
  }

  // ✅ একসাথে একটাই প্রজেক্ট /invest পেজে ফিচার হতে পারবে
  if (isFeaturedOnInvestPage === true) {
    await prisma.project.updateMany({
      where: { isFeaturedOnInvestPage: true },
      data: { isFeaturedOnInvestPage: false },
    });
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
      startDate: startDate ? new Date(startDate) : null,
      isAcceptingFunds:
        typeof isAcceptingFunds === "boolean" ? isAcceptingFunds : true,
      isFeaturedOnInvestPage:
        typeof isFeaturedOnInvestPage === "boolean" ? isFeaturedOnInvestPage : false,
      targetAmount: typeof targetAmount === "number" ? targetAmount : null,
      ownContributionAmount:
        typeof ownContributionAmount === "number" ? ownContributionAmount : null,
      fundUsage: typeof fundUsage === "string" ? fundUsage.trim() : null,
      timeline: typeof timeline === "string" ? timeline.trim() : null,
      risks: typeof risks === "string" ? risks.trim() : null,
      profitShareNote:
        typeof profitShareNote === "string" ? profitShareNote.trim() : null,
      durationMonths: typeof durationMonths === "number" ? durationMonths : null,
      investorProfitPct:
        typeof investorProfitPct === "number" ? investorProfitPct : null,
      totalLots: typeof totalLots === "number" ? totalLots : null,
      lotUnitName:
        typeof lotUnitName === "string" ? lotUnitName.trim() || null : null,
    },
  });

  revalidatePath("/invest");
  return NextResponse.json({ success: true, project });
}