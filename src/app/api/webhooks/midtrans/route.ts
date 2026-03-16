import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyMidtransSignature } from "@/lib/midtrans"

const db = prisma as any

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log("[Midtrans Webhook] Received:", payload)

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type
    } = payload

    // 1. Verify Signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    )

    if (!isValid) {
      console.warn("[Midtrans Webhook] Invalid signature for order:", order_id)
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
    }

    // 2. Find Order
    const order = await db.order.findUnique({
      where: { orderId: order_id },
      include: { user: true }
    })

    if (!order) {
      console.error("[Midtrans Webhook] Order not found:", order_id)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // 3. Map Midtrans status to generic status
    let paymentStatus = "Pending"
    let isSuccess = false

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        paymentStatus = "success"
        isSuccess = true
      } else {
        paymentStatus = "Challenge"
      }
    } else if (transaction_status === "settlement") {
      paymentStatus = "success"
      isSuccess = true
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      paymentStatus = "Failed"
    } else if (["refund", "chargeback", "partial_refund"].includes(transaction_status)) {
      paymentStatus = "Refunded"
    }

    // 4. Update Order
    await db.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: paymentStatus,
        paymentType: payment_type ? payment_type.toUpperCase() : order.paymentType
      }
    })

    // 5. If Success, Update User Plan
    if (isSuccess && order.userId) {
      const plan = await db.plan.findUnique({
        where: { name: order.planName }
      })

      if (plan) {
        const { getPlanChangeType } = await import("@/lib/subscription")
        const user = await db.user.findUnique({ where: { id: order.userId } })
        const changeType = await getPlanChangeType(user?.plan, plan.name)

        const now = new Date()
        let expireDate = new Date()
        const daysToAdd = plan.duration === 'year' ? 365 : 30 // Simplify for ERP logic

        if (changeType === 'upgrade' || changeType === 'new' || changeType === 'renewal') {
          // EXCEPTION: If it's a renewal, we might want to add to existing expire date
          if (changeType === 'renewal' && user.planExpireDate && user.planExpireDate > now) {
            expireDate = new Date(user.planExpireDate)
          }
          expireDate.setDate(expireDate.getDate() + daysToAdd)

          await db.user.update({
            where: { id: order.userId },
            data: {
              plan: plan.name,
              planExpireDate: expireDate,
              pendingPlan: null, // Clear any pending plan
              isActive: true,
            }
          })
        } else if (changeType === 'downgrade') {
          // DOWNGRADE: Don't change current plan, just set pendingPlan
          await db.user.update({
            where: { id: order.userId },
            data: {
              pendingPlan: plan.name,
              isActive: true,
            }
          })
          console.log(`[Midtrans Webhook] Downgrade scheduled: ${plan.name} for user ${order.userId}`)
        }
        
        console.log(`[Midtrans Webhook] Successfully processed ${changeType} plan ${plan.name} for user ${order.userId}`)
      }
    }

    return NextResponse.json({ message: "OK" })
  } catch (error) {
    console.error("[Midtrans Webhook] Error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
