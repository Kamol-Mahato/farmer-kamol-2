import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import type { Prisma } from "@prisma/client";

// প্রোফাইল সম্পূর্ণ ধরা হবে যখন এই সব ফিল্ড পূরণ হয়ে যাবে
function isProfileComplete(p: {
  emailVerified: boolean;
  fatherName: string | null;
  address: string | null;
  nidNumber: string | null;
  nidImageUrl: string | null;
  photoImageUrl: string | null;
  signatureImageUrl: string | null;
  paymentNumber: string | null;
  termsAcceptedAt: Date | null;
}) {
  return Boolean(
    p.emailVerified &&
      p.fatherName &&
      p.address &&
      p.nidNumber &&
      p.nidImageUrl &&
      p.photoImageUrl &&
      p.signatureImageUrl &&
      p.paymentNumber &&
      p.termsAcceptedAt,
  );
}

export async function GET() {
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: customerId },
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const existing = await prisma.investorProfile.findUnique({
    where: { userId: customerId },
  });
  if (!existing || !existing.emailVerified) {
    return NextResponse.json(
      { error: "আগে ইমেইল ভেরিফাই করুন" },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { fatherName, address, nidNumber, paymentNumber, acceptTerms } = body;

  const data: Prisma.InvestorProfileUpdateInput = {};
  if (typeof fatherName === "string") data.fatherName = fatherName.trim();
  if (typeof address === "string") data.address = address.trim();
  if (typeof nidNumber === "string") data.nidNumber = nidNumber.trim();
  if (typeof paymentNumber === "string")
    data.paymentNumber = paymentNumber.trim();
  if (acceptTerms === true && !existing.termsAcceptedAt) {
    data.termsAcceptedAt = new Date();
  }

  const merged = { ...existing, ...data } as typeof existing;
  if (isProfileComplete(merged) && !existing.profileCompletedAt) {
    data.profileCompletedAt = new Date();
  }

  const profile = await prisma.investorProfile.update({
    where: { userId: customerId },
    data,
  });

  return NextResponse.json({ success: true, profile });
}