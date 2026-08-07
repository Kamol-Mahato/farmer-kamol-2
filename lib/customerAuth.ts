import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifySession } from "@/lib/session"

/** customer_session verify + DB থেকে active CUSTOMER */
export async function verifyCustomer() {
  const cookieStore = await cookies()
  const customerCookie = cookieStore.get("customer_session")
  if (!customerCookie) return null

  const data = await verifySession(customerCookie.value)
  const userId = data?.id as number | undefined
  if (!userId) return null

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isActive || user.role !== "CUSTOMER") return null

  return user
}

export async function getCustomerId(): Promise<number | null> {
  const user = await verifyCustomer()
  return user?.id ?? null
}