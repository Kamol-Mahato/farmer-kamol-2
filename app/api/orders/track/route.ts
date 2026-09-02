import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateCustomId, resolveOrderIdFromCustomId } from "@/lib/orderIdUtils"
import { checkAndIncrementRate } from "@/lib/rateLimiter"

export async function GET(req: NextRequest) {
  const orderIdParam = req.nextUrl.searchParams.get("orderId")?.trim()

  if (!orderIdParam) {
    return NextResponse.json({ error: "Order ID required" }, { status: 400 })
  }

  // Rate limit: প্রতি IP-তে ১ মিনিটে সর্বোচ্চ ২০ বার
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const { allowed } = await checkAndIncrementRate(`track:${ip}`, 20, 60)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const orderId = await resolveOrderIdFromCustomId(orderIdParam)
    if (!orderId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        createdAt: true,
        dailySeq: true,
        orderStatus: true,
        courierProvider: true,
        courierSummary: {
          select: { courierStatus: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      orderId: generateCustomId(order.createdAt, order.dailySeq),
      orderStatus: order.orderStatus,
      courierProvider: order.courierProvider || null,
      courierStatus: order.courierSummary?.courierStatus || null,
      createdAt: order.createdAt,
    })
  } catch (error) {
    console.error("TRACK API ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}