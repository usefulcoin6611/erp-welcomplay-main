import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * POST /api/orders/[id]/refund
 * 
 * Process a refund for a successful order (super admin only).
 * - Sets isRefund to 1
 * - Optionally reverts user's plan to Free
 */
export async function POST(
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

    // Find the order
    const order = await db.order.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    if (order.isRefund === 1) {
      return NextResponse.json(
        { success: false, message: "Order has already been refunded" },
        { status: 400 }
      )
    }

    if (order.paymentStatus !== "success" && order.paymentStatus !== "Approved") {
      return NextResponse.json(
        { success: false, message: "Only successful orders can be refunded" },
        { status: 400 }
      )
    }

    if (order.paymentType === "Manually") {
      return NextResponse.json(
        { success: false, message: "Manually upgraded orders cannot be refunded" },
        { status: 400 }
      )
    }

    // Mark order as refunded
    const updatedOrder = await db.order.update({
      where: { id },
      data: { isRefund: 1 },
    })

    // Revert user's plan to Free if userId is set
    if (order.userId) {
      await prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: "Free",
          planExpireDate: null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Refund processed for order ${order.orderId}. User plan reverted to Free.`,
    })
  } catch (error) {
    console.error("Error processing refund:", error)
    return NextResponse.json(
      { success: false, message: "Failed to process refund" },
      { status: 500 }
    )
  }
}
