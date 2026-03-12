import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/pos/product-categories
 * List product categories for POS filter buttons.
 * Returns categories that have at least one product (or all if no products exist).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null

    const where: any = {}
    if (branchId) where.branchId = branchId

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("Error fetching product categories:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 })
  }
}
