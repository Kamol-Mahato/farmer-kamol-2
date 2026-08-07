import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminOrAgent } from "@/lib/adminAuth"

export async function GET(req: Request) {
  const isAuthorized = await verifyAdminOrAgent()
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get("id") || "0")
  if (!id) return NextResponse.json({ error: "ID নেই" }, { status: 400 })

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      orderItems: { include: { product: true } },
    },
  })

  if (!order) return NextResponse.json({ error: "অর্ডার নেই" }, { status: 404 })
  return NextResponse.json(order)
}
