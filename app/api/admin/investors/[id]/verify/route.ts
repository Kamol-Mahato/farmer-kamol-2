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
  const profileId = parseInt(id, 10);
  if (!profileId) {
    return NextResponse.json({ error: "ভুল আইডি" }, { status: 400 });
  }

  const { status, reason } = await request.json();
  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "ভুল স্ট্যাটাস" }, { status: 400 });
  }
  

  const profile = await prisma.investorProfile.update({
    where: { id: profileId },
    data: {
      verificationStatus: status,
      verifiedAt: status === "APPROVED" ? new Date() : null,
      rejectionReason: status === "REJECTED" ? (reason || null) : null,
    },
  });

  return NextResponse.json({ success: true, profile });
}