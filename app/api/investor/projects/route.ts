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

  const projects = await prisma.project.findMany({
    where: { isAcceptingFunds: true },
    select: {
      id: true,
      name: true,
      nameEn: true,
      description: true,
      startDate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}