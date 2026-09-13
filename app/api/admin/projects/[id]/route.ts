import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminOnly } from "@/lib/adminAuth";
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
  const { name, description, startDate, isAcceptingFunds } = body;

  const data: Prisma.ProjectUpdateInput = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof description === "string") data.description = description.trim();
  if (startDate) data.startDate = new Date(startDate);
  if (typeof isAcceptingFunds === "boolean")
    data.isAcceptingFunds = isAcceptingFunds;

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
  });

  return NextResponse.json({ success: true, project });
}