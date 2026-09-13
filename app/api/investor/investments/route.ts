import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";

export async function GET() {
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: customerId },
  });
  if (!profile) {
    return NextResponse.json([]);
  }

  const investments = await prisma.investment.findMany({
    where: { investorProfileId: profile.id },
    include: {
      project: { select: { name: true } },
      agreement: true,
      transactions: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(investments);
}

export async function POST(request: Request) {
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: customerId },
  });
  if (!profile || profile.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      { error: "প্রোফাইল এখনো অনুমোদিত হয়নি" },
      { status: 400 },
    );
  }

  const { projectId, amount, termMonths } = await request.json();
  const projectIdNum = parseInt(projectId, 10);
  const amountNum = parseFloat(amount);

  if (!projectIdNum || !amountNum || amountNum <= 0) {
    return NextResponse.json(
      { error: "প্রজেক্ট ও সঠিক পরিমাণ দিন" },
      { status: 400 },
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectIdNum },
  });
  if (!project || !project.isAcceptingFunds) {
    return NextResponse.json(
      { error: "এই প্রজেক্টে এখন বিনিয়োগ নেওয়া হচ্ছে না" },
      { status: 400 },
    );
  }

  const year = new Date().getFullYear();
  const countThisYear = await prisma.agreement.count({
    where: { agreementNo: { startsWith: `FK-INV-${year}-` } },
  });
  const agreementNo = `FK-INV-${year}-${String(countThisYear + 1).padStart(4, "0")}`;

  const investment = await prisma.investment.create({
    data: {
      investorProfileId: profile.id,
      projectId: projectIdNum,
      amount: amountNum,
      termMonths:
        termMonths && parseInt(termMonths, 10) > 0
          ? parseInt(termMonths, 10)
          : null,
      agreement: {
        create: { agreementNo },
      },
    },
    include: { agreement: true, project: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, investment });
}