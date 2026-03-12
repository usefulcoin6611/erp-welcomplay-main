import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/orders/[id]
 * Get a single order by ID (super admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const db = prisma as any

    const order = await db.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, plan: true, planExpireDate: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/orders/[id]
 * Delete an order (super admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Super admin only" }, { status: 403 })
    }

    const { id } = await params
    const db = prisma as any

    // Check if order exists
    const order = await db.order.findUnique({ where: { id } })
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    await db.order.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete order" },
      { status: 500 }
    )
  }
}
