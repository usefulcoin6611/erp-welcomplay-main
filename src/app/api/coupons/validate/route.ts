import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

const db = prisma as any

/**
 * GET /api/coupons/validate?code=XXX
 * Validate a coupon code for subscription checkout.
 * Returns discount % and name if valid; requires auth (company or super admin).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = (searchParams.get("code") || "").trim().toUpperCase()
    if (!code) {
      return NextResponse.json(
        { success: false, valid: false, message: "Coupon code is required" },
        { status: 400 }
      )
    }

    // Check if coupon feature is enabled globally
    const brandSettings = await prisma.setting.findFirst({
      where: { key: "system_brand_settings", userId: null }
    })
    if (brandSettings) {
      const parsed = JSON.parse(brandSettings.value)
      if (!parsed.enable_coupon) {
        return NextResponse.json({
          success: true,
          valid: false,
          message: "Coupon feature is currently disabled",
        })
      }
    }

    const coupon = await db.coupon.findUnique({
      where: { code },
    })

    if (!coupon) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: "Invalid coupon code",
      })
    }

    if (!coupon.isActive) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: "This coupon is no longer active",
      })
    }

    if (coupon.limit > 0 && coupon.used >= coupon.limit) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: "This coupon has reached its usage limit",
      })
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discount: coupon.discount,
      name: coupon.name,
      code: coupon.code,
      message: `${coupon.discount}% discount applied`,
    })
  } catch (error) {
    console.error("Error validating coupon:", error)
    return NextResponse.json(
      { success: false, valid: false, message: "Failed to validate coupon" },
      { status: 500 }
    )
  }
}
