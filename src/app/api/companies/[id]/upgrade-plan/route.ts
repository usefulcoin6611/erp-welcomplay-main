import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const upgradePlanSchema = z.object({
  plan: z.string().min(1, "Plan is required"),
  planExpireDate: z.string().optional().nullable(),
})

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can upgrade plans" }, { status: 403 })
    }

    const { id } = await props.params
    const body = await request.json()
    const validation = upgradePlanSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({ where: { id, role: "company" } })
    if (!existing) {
      return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 })
    }

    const { plan, planExpireDate } = validation.data

    const updated = await prisma.user.update({
      where: { id },
      data: {
        plan,
        planExpireDate: planExpireDate ? new Date(planExpireDate) : null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        plan: updated.plan,
        plan_expire_date: updated.planExpireDate ? updated.planExpireDate.toISOString().slice(0, 10) : null,
      },
      message: `Plan upgraded to ${plan} successfully`,
    })
  } catch (error) {
    console.error("Error upgrading plan:", error)
    return NextResponse.json({ success: false, message: "Failed to upgrade plan" }, { status: 500 })
  }
}
