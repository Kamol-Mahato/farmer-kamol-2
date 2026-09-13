import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerId } from "@/lib/customerAuth";

export async function GET() {
  const customerId = await getCustomerId();
  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { isAcceptingFunds: true },
    select: { id: true, name: true, description: true, startDate: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}