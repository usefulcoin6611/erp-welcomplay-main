import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const db = prisma as any

const couponUpdateSchema = z.object({
  name: z.string().min(1, "Coupon name is required").max(191).optional(),
  code: z.string().min(1, "Coupon code is required").max(50).toUpperCase().optional(),
  discount: z.number().min(0, "Discount must be non-negative").max(100, "Discount cannot exceed 100%").optional(),
  limit: z.number().int().min(0, "Limit must be non-negative").optional(),
  isActive: z.boolean().optional(),
})

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const coupon = await db.coupon.findUnique({ where: { id } })

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: coupon })
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch coupon" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const body = await request.json()
    const validation = couponUpdateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message, errors: validation.error.format() },
        { status: 400 }
      )
    }

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 })
    }

    const data = validation.data

    // Check code uniqueness if changing code
    if (data.code && data.code !== existing.code) {
      const codeConflict = await db.coupon.findUnique({ where: { code: data.code } })
      if (codeConflict) {
        return NextResponse.json(
          { success: false, message: `Coupon code "${data.code}" already exists` },
          { status: 409 }
        )
      }
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.code !== undefined) updateData.code = data.code
    if (data.discount !== undefined) updateData.discount = data.discount
    if (data.limit !== undefined) updateData.limit = data.limit
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const updated = await db.coupon.update({ where: { id }, data: updateData })

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Coupon updated successfully",
    })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ success: false, message: "Failed to update coupon" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await props.params
    const existing = await db.coupon.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 })
    }

    await db.coupon.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ success: false, message: "Failed to delete coupon" }, { status: 500 })
  }
}
