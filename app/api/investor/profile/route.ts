import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";
import type { Prisma } from "@prisma/client";

// প্রোফাইল সম্পূর্ণ ধরা হবে যখন এই সব ফিল্ড পূরণ হয়ে যাবে
function isProfileComplete(p: {
  emailVerified: boolean;
  fatherName: string | null;
  motherName: string | null;
  district: string | null;
  upazila: string | null;
  address: string | null;
  nidNumber: string | null;
  nidImageUrl: string | null;
  photoImageUrl: string | null;
  signatureImageUrl: string | null;
  paymentNumber: string | null;
  nomineeName: string | null;
  nomineePhone: string | null;
  nomineeRelation: string | null;
  nomineeNid: string | null;
  nomineeImageUrl: string | null;
  termsAcceptedAt: Date | null;
}) {
  return Boolean(
    p.emailVerified &&
      p.fatherName &&
      p.motherName &&
      p.district &&
      p.upazila &&
      p.address &&
      p.nidNumber &&
      p.nidImageUrl &&
      p.photoImageUrl &&
      p.signatureImageUrl &&
      p.paymentNumber &&
      p.nomineeName &&
      p.nomineePhone &&
      p.nomineeRelation &&
      p.nomineeNid &&
      p.nomineeImageUrl &&
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
  const {
    fatherName,
    motherName,
    district,
    upazila,
    address,
    nidNumber,
    paymentNumber,
    nomineeName,
    nomineePhone,
    nomineeRelation,
    nomineeNid,
    acceptTerms,
  } = body;

  const data: Prisma.InvestorProfileUpdateInput = {};
  if (typeof fatherName === "string") data.fatherName = fatherName.trim();
  if (typeof motherName === "string") data.motherName = motherName.trim();
  if (typeof district === "string") data.district = district.trim();
  if (typeof upazila === "string") data.upazila = upazila.trim();
  if (typeof address === "string") data.address = address.trim();
  if (typeof nidNumber === "string") data.nidNumber = nidNumber.trim();
  if (typeof paymentNumber === "string")
    data.paymentNumber = paymentNumber.trim();
  if (typeof nomineeName === "string") data.nomineeName = nomineeName.trim();
  if (typeof nomineePhone === "string")
    data.nomineePhone = nomineePhone.trim();
  if (typeof nomineeRelation === "string")
    data.nomineeRelation = nomineeRelation.trim();
  if (typeof nomineeNid === "string") data.nomineeNid = nomineeNid.trim();
  if (acceptTerms === true && !existing.termsAcceptedAt) {
    data.termsAcceptedAt = new Date();
  }

  const merged = { ...existing, ...data } as typeof existing;
  if (isProfileComplete(merged) && !existing.profileCompletedAt) {
    data.profileCompletedAt = new Date();
  }
  if (existing.verificationStatus === "REJECTED") {
    data.verificationStatus = "PENDING";
    data.rejectionReason = null;
  }

  const profile = await prisma.investorProfile.update({
    where: { userId: customerId },
    data,
  });

  return NextResponse.json({ success: true, profile });
}