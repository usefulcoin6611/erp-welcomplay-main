import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const db = prisma as any

const couponSchema = z.object({
  name: z.string().min(1, "Coupon name is required").max(191),
  code: z.string().min(1, "Coupon code is required").max(50).toUpperCase(),
  discount: z.number().min(0, "Discount must be non-negative").max(100, "Discount cannot exceed 100%"),
  limit: z.number().int().min(0, "Limit must be non-negative"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ]
    }

    const coupons = await db.coupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: coupons })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = couponSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message, errors: validation.error.format() },
        { status: 400 }
      )
    }

    const { name, code, discount, limit } = validation.data

    // Check code uniqueness
    const existing = await db.coupon.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Coupon code "${code}" already exists` },
        { status: 409 }
      )
    }

    const coupon = await db.coupon.create({
      data: { name, code, discount, limit, used: 0, isActive: true },
    })

    return NextResponse.json(
      { success: true, data: coupon, message: "Coupon created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ success: false, message: "Failed to create coupon" }, { status: 500 })
  }
}
