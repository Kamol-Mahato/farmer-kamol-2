import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import { getApiLocale, tr } from "@/lib/apiLocale";

export async function GET(request: Request) {
  const locale = getApiLocale(request);
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json(
      { error: tr(locale, "লগইন করুন", "Please log in") },
      { status: 401 },
    );
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
      project: { select: { name: true, nameEn: true } },
      agreement: true,
      transactions: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(investments);
}

export async function POST(request: Request) {
  const locale = getApiLocale(request);
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json(
      { error: tr(locale, "লগইন করুন", "Please log in") },
      { status: 401 },
    );
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: customerId },
  });
  if (!profile || profile.verificationStatus !== "APPROVED") {
    return NextResponse.json(
      { error: tr(locale, "প্রোফাইল এখনো অনুমোদিত হয়নি", "Your profile has not been approved yet") },
      { status: 400 },
    );
  }

  const { projectId, amount, termMonths } = await request.json();
  const projectIdNum = parseInt(projectId, 10);
  const amountNum = parseFloat(amount);

  if (!projectIdNum || !amountNum || amountNum <= 0) {
    return NextResponse.json(
      { error: tr(locale, "প্রজেক্ট ও সঠিক পরিমাণ দিন", "Please select a project and enter a valid amount") },
      { status: 400 },
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectIdNum },
  });
  if (!project || !project.isAcceptingFunds) {
    return NextResponse.json(
      { error: tr(locale, "এই প্রজেক্টে এখন বিনিয়োগ নেওয়া হচ্ছে না", "This project is not accepting investments right now") },
      { status: 400 },
    );
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const datePrefix = `FK-INV-${year}-${month}-${date}-`;

  const countToday = await prisma.agreement.count({
    where: { agreementNo: { startsWith: datePrefix } },
  });
  const agreementNo = `${datePrefix}${String(countToday + 1).padStart(2, "0")}`;

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
    include: {
      agreement: true,
      project: { select: { name: true, nameEn: true } },
    },
  });

  return NextResponse.json({ success: true, investment });
}