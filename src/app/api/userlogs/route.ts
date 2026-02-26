import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

function isAllowed(session: { user?: { role?: string } }): boolean {
  const role = session.user?.role
  return role === "super admin" || role === "company"
}

/**
 * GET /api/userlogs?month=YYYY-MM&userId=...
 * List login details. Filter by month (default current) and optional userId.
 * Only super admin and company can access.
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isAllowed(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const monthParam = searchParams.get("month")
  const userIdParam = searchParams.get("userId")

  const now = new Date()
  const year = monthParam ? parseInt(monthParam.slice(0, 4), 10) : now.getFullYear()
  const month = monthParam ? parseInt(monthParam.slice(5, 7), 10) : now.getMonth() + 1
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59, 999)

  const where: { date?: { gte: Date; lte: Date }; userId?: string } = {
    date: { gte: start, lte: end },
  }
  if (userIdParam) where.userId = userIdParam

  const logs = await prisma.loginDetail.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  })

  const list = logs.map((log) => {
    const details = log.details as Record<string, unknown> | null
    return {
      id: log.id,
      userId: log.userId,
      userName: log.user.name ?? log.user.email,
      userEmail: log.user.email,
      userType: log.user.role,
      date: log.date.toISOString(),
      ip: log.ip ?? "-",
      country: details && typeof details.country === "string" ? details.country : "-",
      device_type: details && typeof details.device_type === "string" ? details.device_type : "-",
      os_name: details && typeof details.os_name === "string" ? details.os_name : "-",
      details: log.details,
    }
  })

  return NextResponse.json(list)
}
