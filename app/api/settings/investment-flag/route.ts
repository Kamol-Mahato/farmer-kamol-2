import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.systemControlCenter.findUnique({
    where: { id: 1 },
    select: { enableInvestmentProgram: true },
  });

  return NextResponse.json({
    enabled: Boolean(settings?.enableInvestmentProgram),
  });
}