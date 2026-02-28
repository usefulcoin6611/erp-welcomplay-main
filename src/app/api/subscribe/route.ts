import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

const db = prisma as any

/**
 * POST /api/subscribe
 * Company user subscribes to a plan. Creates an order; applies coupon if valid.
 * Body: { planId: string, paymentMethod: string, couponCode?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string; name?: string; email?: string; role?: string }
    const userName = user.name || user.email || "Company User"
    const userId = user.id

    const body = await request.json().catch(() => ({}))
    const planId = typeof body.planId === "string" ? body.planId.trim() : ""
    const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "Bank Transfer"
    const couponCode = typeof body.couponCode === "string" ? body.couponCode.trim().toUpperCase() : ""

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Plan ID is required" },
        { status: 400 }
      )
    }

    const plan = await db.plan.findUnique({
      where: { id: planId },
    })
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      )
    }
    if (plan.isDisable) {
      return NextResponse.json(
        { success: false, message: "This plan is not available" },
        { status: 400 }
      )
    }

    let price = Number(plan.price) || 0
    let appliedCouponCode: string | null = null
    let discountPercent = 0

    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode },
      })
      if (coupon && coupon.isActive && (coupon.limit === 0 || coupon.used < coupon.limit)) {
        discountPercent = Number(coupon.discount) || 0
        appliedCouponCode = couponCode
      }
    }

    const discountAmount = price * (discountPercent / 100)
    const priceAfterDiscount = Math.max(0, Math.round(price - discountAmount))

    const count = await db.order.count()
    const orderId = `ORD-${String(count + 1).padStart(3, "0")}`

    const isFree = priceAfterDiscount === 0
    const paymentStatus = isFree ? "success" : "Pending"
    const paymentType = isFree ? "Free" : paymentMethod || "Bank Transfer"

    const order = await db.order.create({
      data: {
        orderId,
        userId,
        userName,
        planName: plan.name,
        price: priceAfterDiscount,
        paymentStatus,
        paymentType,
        coupon: appliedCouponCode,
        receipt: null,
        isRefund: 0,
        orderDate: new Date(),
      },
    })

    if (appliedCouponCode) {
      await db.coupon.update({
        where: { code: appliedCouponCode },
        data: { used: { increment: 1 } },
      })
    }

    if (isFree && userId) {
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 365)
      await db.user.update({
        where: { id: userId },
        data: {
          plan: plan.name,
          planExpireDate: expireDate,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        planName: plan.name,
        price: priceAfterDiscount,
        paymentStatus,
        discountApplied: discountPercent > 0,
      },
      message: isFree
        ? "Subscription activated successfully."
        : "Order created. Complete payment to activate your plan.",
    })
  } catch (error) {
    console.error("Error creating subscription order:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create subscription" },
      { status: 500 }
    )
  }
}
