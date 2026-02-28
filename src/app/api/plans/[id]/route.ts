import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const planUpdateSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100).optional(),
  price: z.number().min(0).optional(),
  duration: z.enum(["lifetime", "month", "year"]).optional(),
  maxUsers: z.number().int().min(-1).optional(),
  maxCustomers: z.number().int().min(-1).optional(),
  maxVenders: z.number().int().min(-1).optional(),
  maxClients: z.number().int().min(-1).optional(),
  storageLimit: z.number().int().min(-1).optional(),
  trialDays: z.number().int().min(0).optional(),
  isDisable: z.boolean().optional(),
  hasAccount: z.boolean().optional(),
  hasCrm: z.boolean().optional(),
  hasHrm: z.boolean().optional(),
  hasProject: z.boolean().optional(),
  hasPos: z.boolean().optional(),
  hasChatgpt: z.boolean().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

function mapPlanToResponse(plan: any) {
  return {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    duration: plan.duration,
    max_users: plan.maxUsers,
    max_customers: plan.maxCustomers,
    max_venders: plan.maxVenders,
    max_clients: plan.maxClients,
    storage_limit: plan.storageLimit,
    trial_days: plan.trialDays,
    is_disable: plan.isDisable,
    account: plan.hasAccount,
    crm: plan.hasCrm,
    hrm: plan.hasHrm,
    project: plan.hasProject,
    pos: plan.hasPos,
    chatgpt: plan.hasChatgpt,
    createdAt: plan.createdAt?.toISOString(),
    updatedAt: plan.updatedAt?.toISOString(),
  }
}

export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const plan = await prisma.plan.findUnique({ where: { id } })

    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: mapPlanToResponse(plan) })
  } catch (error) {
    console.error("Error fetching plan:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch plan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userType = (session.user as any).type || (session.user as any).role
    if (userType !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can manage plans" }, { status: 403 })
    }

    const { id } = await props.params
    const body = await request.json()
    const validation = planUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
          errors: validation.error.format(),
        },
        { status: 400 }
      )
    }

    const existing = await prisma.plan.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 })
    }

    const data = validation.data

    // Check name uniqueness if name is being changed
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.plan.findUnique({ where: { name: data.name } })
      if (nameConflict) {
        return NextResponse.json(
          { success: false, message: `Plan with name "${data.name}" already exists` },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.maxUsers !== undefined && { maxUsers: data.maxUsers }),
        ...(data.maxCustomers !== undefined && { maxCustomers: data.maxCustomers }),
        ...(data.maxVenders !== undefined && { maxVenders: data.maxVenders }),
        ...(data.maxClients !== undefined && { maxClients: data.maxClients }),
        ...(data.storageLimit !== undefined && { storageLimit: data.storageLimit }),
        ...(data.trialDays !== undefined && { trialDays: data.trialDays }),
        ...(data.isDisable !== undefined && { isDisable: data.isDisable }),
        ...(data.hasAccount !== undefined && { hasAccount: data.hasAccount }),
        ...(data.hasCrm !== undefined && { hasCrm: data.hasCrm }),
        ...(data.hasHrm !== undefined && { hasHrm: data.hasHrm }),
        ...(data.hasProject !== undefined && { hasProject: data.hasProject }),
        ...(data.hasPos !== undefined && { hasPos: data.hasPos }),
        ...(data.hasChatgpt !== undefined && { hasChatgpt: data.hasChatgpt }),
      },
    })

    return NextResponse.json({
      success: true,
      data: mapPlanToResponse(updated),
      message: "Plan updated successfully",
    })
  } catch (error) {
    console.error("Error updating plan:", error)
    return NextResponse.json({ success: false, message: "Failed to update plan" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userType = (session.user as any).type || (session.user as any).role
    if (userType !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can manage plans" }, { status: 403 })
    }

    const { id } = await props.params
    const existing = await prisma.plan.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 })
    }

    // Prevent deleting Free Plan (price = 0)
    if (existing.price === 0) {
      return NextResponse.json(
        { success: false, message: "Cannot delete the Free Plan" },
        { status: 400 }
      )
    }

    await prisma.plan.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Plan deleted successfully" })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json({ success: false, message: "Failed to delete plan" }, { status: 500 })
  }
}
