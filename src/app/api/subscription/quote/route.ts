import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { calculateUpgradeProration, getPlanById } from "@/lib/subscription"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!planId) {
      return NextResponse.json({ success: false, message: "Plan ID is required" }, { status: 400 })
    }

    const plan = await getPlanById(planId)
    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 })
    }

    const proratedCredit = await calculateUpgradeProration(session.user.id, plan.price)

    return NextResponse.json({
      success: true,
      data: {
        planId: plan.id,
        planName: plan.name,
        originalPrice: plan.price,
        proratedCredit: proratedCredit,
        finalBasePrice: Math.max(0, plan.price - proratedCredit)
      }
    })
  } catch (error) {
    console.error("Error fetching subscription quote:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
