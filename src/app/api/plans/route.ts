import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(100, "Plan name too long"),
  price: z.number().min(0, "Price must be non-negative"),
  duration: z.enum(["lifetime", "month", "year"], {
    errorMap: () => ({ message: "Duration must be lifetime, month, or year" }),
  }),
  maxUsers: z.number().int().min(-1, "Max users must be -1 (unlimited) or positive"),
  maxCustomers: z.number().int().min(-1),
  maxVenders: z.number().int().min(-1),
  maxClients: z.number().int().min(-1),
  storageLimit: z.number().int().min(-1),
  trialDays: z.number().int().min(0, "Trial days must be non-negative"),
  isDisable: z.boolean().optional().default(false),
  hasAccount: z.boolean().optional().default(true),
  hasCrm: z.boolean().optional().default(true),
  hasHrm: z.boolean().optional().default(true),
  hasProject: z.boolean().optional().default(false),
  hasPos: z.boolean().optional().default(false),
  hasChatgpt: z.boolean().optional().default(false),
})

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

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const plans = await prisma.plan.findMany({
      orderBy: { price: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: plans.map(mapPlanToResponse),
    })
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch plans" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Only super admin can create plans
    const userType = (session.user as any).type || (session.user as any).role
    if (userType !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can manage plans" }, { status: 403 })
    }

    const body = await request.json()
    const validation = planSchema.safeParse(body)

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

    const data = validation.data

    // Check if plan name already exists
    const existing = await prisma.plan.findUnique({ where: { name: data.name } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Plan with name "${data.name}" already exists` },
        { status: 409 }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        price: data.price,
        duration: data.duration,
        maxUsers: data.maxUsers,
        maxCustomers: data.maxCustomers,
        maxVenders: data.maxVenders,
        maxClients: data.maxClients,
        storageLimit: data.storageLimit,
        trialDays: data.trialDays,
        isDisable: data.isDisable ?? false,
        hasAccount: data.hasAccount ?? true,
        hasCrm: data.hasCrm ?? true,
        hasHrm: data.hasHrm ?? true,
        hasProject: data.hasProject ?? false,
        hasPos: data.hasPos ?? false,
        hasChatgpt: data.hasChatgpt ?? false,
      },
    })

    return NextResponse.json(
      { success: true, data: mapPlanToResponse(plan), message: "Plan created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create plan" },
      { status: 500 }
    )
  }
}
