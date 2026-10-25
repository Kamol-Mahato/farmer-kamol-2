import { NextResponse } from "next/server";
import { verifyAdminOnly } from "@/lib/adminAuth";

export async function GET() {
  const admin = await verifyAdminOnly();
  if (!admin) return NextResponse.json({ admin: null });
  return NextResponse.json({ admin: { id: admin.id, name: admin.name } });
}