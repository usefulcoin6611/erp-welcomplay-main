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

    const { calculateUpgradeProration } = await import("@/lib/subscription")
    const proratedCredit = await calculateUpgradeProration(userId, plan.price)

    let price = Number(plan.price) || 0
    // Apply proration: subtract unused value of old plan from new plan price
    const basePrice = Math.max(0, price - proratedCredit)
    
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

    const discountAmount = basePrice * (discountPercent / 100)
    const priceAfterDiscount = Math.max(0, Math.round(basePrice - discountAmount))
    const taxAmount = Math.round(priceAfterDiscount * 0.11) // 11% tax
    const totalAmount = priceAfterDiscount + taxAmount

    const timestamp = Date.now()
    const orderId = `ORD-${timestamp}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`

    const isFree = totalAmount === 0
    const paymentStatus = isFree ? "success" : "Pending"
    const paymentType = isFree ? "Free" : paymentMethod.toUpperCase()

    const order = await db.order.create({
      data: {
        orderId,
        userId,
        userName,
        planName: plan.name,
        price: totalAmount, // Storing final total price inclusive of tax
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

    let midtransResponse = null
    if (!isFree) {
      const { createCoreApiCharge } = await import("@/lib/midtrans")
      try {
        midtransResponse = await createCoreApiCharge({
          orderId: order.orderId,
          amount: totalAmount,
          paymentMethod: paymentMethod.toLowerCase(),
          customerName: userName,
          customerEmail: user.email || "",
          planName: plan.name,
        })
        
        // Send Payment Notification Email
        if (user.email) {
          const { sendEmail, emailTemplates } = await import("@/lib/mail");
          const { subject, html } = emailTemplates.paymentNotification(
            userName,
            order.orderId,
            totalAmount.toLocaleString('id-ID'),
            plan.name,
            `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/settings?tab=subscription-plan`
          );
          await sendEmail({ to: user.email, subject, html }).catch(err => console.error("Email notify error:", err));
        }
        
        // Save Midtrans response to order for later retrieval
        await db.order.update({
          where: { id: order.id },
          data: { paymentDetails: midtransResponse }
        })
      } catch (midtransError: any) {
        console.error("Midtrans Charge Error:", midtransError)
        // If Midtrans fails, we should probably mark order as failed
        await db.order.update({
          where: { id: order.id },
          data: { paymentStatus: "Failed" }
        })
        return NextResponse.json(
          { success: false, message: `Payment Gateway Error: ${midtransError.message}` },
          { status: 500 }
        )
      }
    }

    if (isFree && userId) {
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 365)
      await db.user.update({
        where: { id: userId },
        data: {
          plan: plan.name,
          planExpireDate: expireDate,
          isActive: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        planName: plan.name,
        price: totalAmount,
        subtotal: priceAfterDiscount,
        tax: taxAmount,
        proratedCredit: proratedCredit,
        paymentStatus,
        midtransResponse, // Frontend will handle this
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
