import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/orders
 * 
 * Returns all subscription orders (super admin only).
 * 
 * Query params:
 *   search: string (search by orderId, userName, planName, paymentType, coupon)
 *   status: string (filter by paymentStatus)
 *   page: number
 *   pageSize: number
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Only super admin can access orders
    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Super admin only" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    const db = prisma as any

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { userName: { contains: search, mode: "insensitive" } },
        { planName: { contains: search, mode: "insensitive" } },
        { paymentType: { contains: search, mode: "insensitive" } },
        { coupon: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.paymentStatus = status
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { orderDate: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, plan: true, planExpireDate: true },
        },
      },
    })

    // Map to response format
    const orderData = orders.map((order: any) => ({
      id: order.id,
      order_id: order.orderId,
      user_name: order.userName,
      plan_name: order.planName,
      price: order.price,
      payment_status: order.paymentStatus,
      payment_type: order.paymentType,
      date: order.orderDate.toISOString().slice(0, 10),
      coupon: order.coupon,
      receipt: order.receipt,
      is_refund: order.isRefund,
      userId: order.userId,
      userEmail: order.user?.email,
      userCurrentPlan: order.user?.plan,
    }))

    // Summary stats
    const totalRevenue = orders
      .filter((o: any) => o.paymentStatus === "success" || o.paymentStatus === "Approved")
      .reduce((sum: number, o: any) => sum + o.price, 0)

    const pendingCount = orders.filter((o: any) => o.paymentStatus === "Pending").length
    const successCount = orders.filter((o: any) => 
      o.paymentStatus === "success" || o.paymentStatus === "Approved"
    ).length
    const refundCount = orders.filter((o: any) => o.isRefund === 1).length

    return NextResponse.json({
      success: true,
      data: {
        orders: orderData,
        totalRecords: orderData.length,
        summary: {
          totalRevenue,
          pendingCount,
          successCount,
          refundCount,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders
 * 
 * Create a new order (super admin only - for manual plan upgrades).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Forbidden: Super admin only" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, userName, planName, price, paymentType, coupon, receipt } = body

    if (!userName || !planName) {
      return NextResponse.json(
        { success: false, message: "userName and planName are required" },
        { status: 400 }
      )
    }

    const db = prisma as any

    // Generate order ID
    const count = await db.order.count()
    const orderId = `ORD-${String(count + 1).padStart(3, "0")}`

    const order = await db.order.create({
      data: {
        orderId,
        userId: userId || null,
        userName,
        planName,
        price: price || 0,
        paymentStatus: "Approved",
        paymentType: paymentType || "Manually",
        coupon: coupon || null,
        receipt: receipt || null,
        isRefund: 0,
        orderDate: new Date(),
      },
    })

    // If userId provided, update user's plan
    if (userId) {
      const planDuration = 30 // days
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + planDuration)

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: planName,
          planExpireDate: expireDate,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    )
  }
}
