import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (!projectId) {
    return NextResponse.json({ error: "ভুল আইডি" }, { status: 400 });
  }

  const body = await request.json();
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
  } = body;

  const data: Prisma.ProjectUpdateInput = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof description === "string") data.description = description.trim();
  if (startDate) data.startDate = new Date(startDate);
  if (typeof isAcceptingFunds === "boolean")
    data.isAcceptingFunds = isAcceptingFunds;
  if (typeof targetAmount === "number") data.targetAmount = targetAmount;
  if (typeof ownContributionAmount === "number")
    data.ownContributionAmount = ownContributionAmount;
  if (typeof fundUsage === "string") data.fundUsage = fundUsage.trim();
  if (typeof timeline === "string") data.timeline = timeline.trim();
  if (typeof risks === "string") data.risks = risks.trim();
  if (typeof profitShareNote === "string")
    data.profitShareNote = profitShareNote.trim();

  if (typeof isFeaturedOnInvestPage === "boolean") {
    if (isFeaturedOnInvestPage) {
      await prisma.project.updateMany({
        where: { isFeaturedOnInvestPage: true, NOT: { id: projectId } },
        data: { isFeaturedOnInvestPage: false },
      });
    }
    data.isFeaturedOnInvestPage = isFeaturedOnInvestPage;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
  });

  revalidatePath("/invest");
  return NextResponse.json({ success: true, project });
}