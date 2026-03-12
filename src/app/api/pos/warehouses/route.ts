import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/pos/warehouses
 * List all warehouses (filtered by branchId from session).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get("active") !== "false"

    const where: any = {}
    if (branchId) where.branchId = branchId
    if (activeOnly) where.isActive = true

    const warehouses = await prisma.warehouse.findMany({
      where,
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, data: warehouses })
  } catch (error) {
    console.error("Error fetching warehouses:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch warehouses" }, { status: 500 })
  }
}

/**
 * POST /api/pos/warehouses
 * Create a new warehouse.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const body = await request.json().catch(() => null)

    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ success: false, message: "Warehouse name is required" }, { status: 400 })
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name: body.name.trim(),
        address: body.address ?? null,
        phone: body.phone ?? null,
        branchId,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json({ success: true, data: warehouse }, { status: 201 })
  } catch (error) {
    console.error("Error creating warehouse:", error)
    return NextResponse.json({ success: false, message: "Failed to create warehouse" }, { status: 500 })
  }
}
