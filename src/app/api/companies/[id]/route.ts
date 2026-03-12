import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"
import * as bcrypt from "bcryptjs"

const db = prisma as any

const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(191).optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().nullable(),
  plan: z.string().optional().nullable(),
  planExpireDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isEnableLogin: z.boolean().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

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

export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const company = await db.user.findFirst({
      where: { id, role: "company" },
      include: {
        branch: { select: { name: true } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    })

    if (!company) {
      return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: mapUserToCompany(company) })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch company" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can update companies" }, { status: 403 })
    }

    const { id } = await props.params
    const body = await request.json()
    const validation = updateCompanySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message, errors: validation.error.format() },
        { status: 400 }
      )
    }

    const existing = await db.user.findFirst({ where: { id, role: "company" } })
    if (!existing) {
      return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 })
    }

    const data = validation.data

    // Check email uniqueness if changing email
    if (data.email && data.email !== existing.email) {
      const emailConflict = await db.user.findUnique({ where: { email: data.email } })
      if (emailConflict) {
        return NextResponse.json(
          { success: false, message: `Email "${data.email}" is already registered` },
          { status: 409 }
        )
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined = undefined
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10)
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (hashedPassword !== undefined) updateData.password = hashedPassword
    if (data.plan !== undefined) updateData.plan = data.plan
    if (data.planExpireDate !== undefined) {
      updateData.planExpireDate = data.planExpireDate ? new Date(data.planExpireDate) : null
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isEnableLogin !== undefined) updateData.isEnableLogin = data.isEnableLogin

    // Update branch name if company name changed
    if (data.name && existing.branchId) {
      await db.branch.update({
        where: { id: existing.branchId },
        data: { name: data.name },
      })
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        branch: { select: { name: true } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: mapUserToCompany(updated),
      message: "Company updated successfully",
    })
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json({ success: false, message: "Failed to update company" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin") {
      return NextResponse.json({ success: false, message: "Only super admin can delete companies" }, { status: 403 })
    }

    const { id } = await props.params
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get("permanent") === "true"

    const existing = await db.user.findFirst({ where: { id, role: "company" } })
    if (!existing) {
      return NextResponse.json({ success: false, message: "Company not found" }, { status: 404 })
    }

    if (permanent) {
      // Hard delete
      await db.user.delete({ where: { id } })
      return NextResponse.json({ success: true, message: "Company permanently deleted" })
    } else {
      // Soft delete: set isActive = false
      await db.user.update({
        where: { id },
        data: { isActive: false },
      })
      return NextResponse.json({ success: true, message: "Company deactivated successfully" })
    }
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ success: false, message: "Failed to delete company" }, { status: 500 })
  }
}
