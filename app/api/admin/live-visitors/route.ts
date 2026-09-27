import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { liveVisitorCount } from "@/lib/liveVisitors";
import { getRedis } from "@/lib/rateLimiter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("admin_session")?.value ||
      cookieStore.get("agent_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await verifySession(token);
    const userId = data?.id as number | undefined;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ok =
      user &&
      user.isActive &&
      (user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN" ||
        user.role === "AGENT");
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let totalVisitors = 0;
    try {
      const raw = await getRedis().get<number | string>(
        "stats:total_visitors",
      );
      totalVisitors = raw ? Number(raw) : 0;
    } catch (err) {
      console.error("TOTAL VISITORS READ ERROR:", err);
    }

    return NextResponse.json({
      liveCount: liveVisitorCount(),
      totalVisitors,
    });
  } catch (error) {
    console.error("SITE STATS ERROR:", error);
    return NextResponse.json({ error: "সমস্যা হয়েছে" }, { status: 500 });
  }
}