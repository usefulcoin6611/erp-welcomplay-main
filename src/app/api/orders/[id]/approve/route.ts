import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * POST /api/orders/[id]/approve
 * 
 * Approve a pending Bank Transfer payment (super admin only).
 * - Sets paymentStatus to "Approved"
 * - Updates the user's plan and planExpireDate
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

    if (order.paymentStatus !== "Pending") {
      return NextResponse.json(
        { success: false, message: "Only pending orders can be approved" },
        { status: 400 }
      )
    }

    if (order.paymentType !== "Bank Transfer") {
      return NextResponse.json(
        { success: false, message: "Only Bank Transfer orders can be manually approved" },
        { status: 400 }
      )
    }

    // Update order status to Approved
    const updatedOrder = await db.order.update({
      where: { id },
      data: { paymentStatus: "Approved" },
    })

    // Update user's plan if userId is set
    if (order.userId) {
      // Calculate plan expiry based on plan duration (default 30 days for monthly)
      const planDuration = 30 // days - could be extended based on plan type
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + planDuration)

      await prisma.user.update({
        where: { id: order.userId },
        data: {
          plan: order.planName,
          planExpireDate: expireDate,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Payment approved for order ${order.orderId}. User plan updated to ${order.planName}.`,
    })
  } catch (error) {
    console.error("Error approving order:", error)
    return NextResponse.json(
      { success: false, message: "Failed to approve order" },
      { status: 500 }
    )
  }
}
