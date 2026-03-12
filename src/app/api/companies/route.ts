import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"
import * as bcrypt from "bcryptjs"

// Use prisma as any to bypass type checking for new fields not yet in generated client
const db = prisma as any

const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(191),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().nullable(),
  plan: z.string().optional().nullable(),
  planExpireDate: z.string().optional().nullable(),
  isEnableLogin: z.boolean().optional().default(true),
})

function mapUserToCompany(u: any) {
  const lastSession = u.sessions?.[0]
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    avatar: u.image ?? null,
    plan: u.plan ?? null,
    plan_expire_date: u.planExpireDate ? u.planExpireDate.toISOString().slice(0, 10) : null,
    is_active: u.isActive ?? true,
    is_enable_login: u.isEnableLogin ?? true,
    last_login_at: lastSession ? lastSession.createdAt.toISOString() : null,
    delete_status: u.isActive ? 1 : 0,
    branchId: u.branchId ?? null,
    branchName: u.branch?.name ?? null,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can access companies" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const includeDeleted = searchParams.get("includeDeleted") === "true"

    const where: any = { role: "company" }
    if (!includeDeleted) {
      where.isActive = true
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const companies = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { name: true } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: companies.map(mapUserToCompany),
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can create companies" }, { status: 403 })
    }

    const body = await request.json()
    const validation = createCompanySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message, errors: validation.error.format() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check email uniqueness
    const existing = await db.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Email "${data.email}" is already registered` },
        { status: 409 }
      )
    }

    // Hash password if provided
    let hashedPassword: string | null = null
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10)
    }

    // Create a branch for the company
    const branch = await db.branch.create({
      data: { name: data.name },
    })

    const company = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "company",
        branchId: branch.id,
        plan: data.plan ?? null,
        planExpireDate: data.planExpireDate ? new Date(data.planExpireDate) : null,
        isActive: true,
        isEnableLogin: data.isEnableLogin ?? true,
        emailVerified: false,
      },
      include: {
        branch: { select: { name: true } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    })

    return NextResponse.json(
      { success: true, data: mapUserToCompany(company), message: "Company created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ success: false, message: "Failed to create company" }, { status: 500 })
  }
}
