import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";

export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    include: { _count: { select: { investments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const admin = await verifyAdminOnly();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, startDate, isAcceptingFunds } =
    await request.json();

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "প্রজেক্টের নাম দিন" },
      { status: 400 },
    );
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
      startDate: startDate ? new Date(startDate) : null,
      isAcceptingFunds:
        typeof isAcceptingFunds === "boolean" ? isAcceptingFunds : true,
    },
  });

  return NextResponse.json({ success: true, project });
}