import { prisma } from "@/lib/prisma"
import { getCustomerId } from "@/lib/customerAuth"
import { NextResponse } from "next/server"

export async function GET() {
  const customerId = await getCustomerId()

  if (!customerId) {
    return NextResponse.json({ error: "লগইন করুন" }, { status: 401 })
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: {
        orderItems: { include: { product: true } },
        courierSummary: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error("CUSTOMER ORDERS API ERROR:", error)
    return NextResponse.json({ error: "অর্ডার লোড করা যায়নি" }, { status: 500 })
  }
}