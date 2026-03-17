import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

const db = prisma as any

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const order = await db.order.findUnique({
            where: { orderId: id },
            select: {
                id: true,
                orderId: true,
                userId: true,
                paymentStatus: true,
                paymentDetails: true,
                price: true,
                planName: true,
                paymentType: true
            }
        })

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
        }

        // Ownership check
        if (order.userId !== session.user.id) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        // --- PROACTIVE SYNC: If status is Pending, check Midtrans directly ---
        // This handles cases where webhook might be delayed or blocked (e.g. localhost)
        let currentStatus = order.paymentStatus
        if (currentStatus === 'Pending') {
            try {
                const { coreApi } = await import("@/lib/midtrans")
                const statusResponse = await coreApi.transaction.status(order.orderId).catch(() => null)
                
                if (statusResponse) {
                    const transStatus = statusResponse.transaction_status
                    const fraudStatus = statusResponse.fraud_status
                    
                    let newStatus = 'Pending'
                    let isSuccess = false
                    
                    if (transStatus === "capture") {
                        if (fraudStatus === "accept") {
                            newStatus = "success"
                            isSuccess = true
                        } else {
                            newStatus = "Challenge"
                        }
                    } else if (transStatus === "settlement") {
                        newStatus = "success"
                        isSuccess = true
                    } else if (["cancel", "deny", "expire"].includes(transStatus)) {
                        newStatus = "Failed"
                    }
                    
                    if (newStatus !== currentStatus) {
                        // Update local order status
                        await db.order.update({
                            where: { id: order.id },
                            data: { paymentStatus: newStatus }
                        })
                        currentStatus = newStatus
                        
                        // If becomes success, activate the plan
                        if (isSuccess && order.userId) {
                            const plan = await db.plan.findFirst({
                                where: { name: order.planName }
                            })
                            if (plan) {
                                const { calculateExpirationDate } = await import("@/lib/subscription")
                                const user = await db.user.findUnique({ where: { id: order.userId }, select: { planExpireDate: true } })
                                const expireDate = calculateExpirationDate(plan.duration, user?.planExpireDate)
                                
                                await db.user.update({
                                    where: { id: order.userId },
                                    data: {
                                        plan: plan.name,
                                        planExpireDate: expireDate,
                                        isActive: true
                                    }
                                })
                            }
                        }
                    }
                }
            } catch (syncError) {
                console.error("Proactive status sync failed:", syncError)
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.orderId,
                paymentStatus: currentStatus, // Return synced status
                paymentDetails: order.paymentDetails,
                price: order.price,
                subtotal: Math.round(order.price / 1.11),
                tax: Math.round(order.price - (order.price / 1.11)),
                planName: order.planName,
                paymentType: order.paymentType
            }
        })
    } catch (error) {
        console.error("Error fetching payment info:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
