import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

const VALID_BARCODE_TYPES = ["code128", "code39", "code93"]
const VALID_BARCODE_FORMATS = ["css", "bmp"]

/**
 * GET /api/pos/barcode-settings
 * Get barcode settings for the current branch.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null

    const setting = await prisma.barcodeSetting.findFirst({
      where: branchId ? { branchId } : { branchId: null },
      orderBy: { createdAt: "desc" },
    })

    if (!setting) {
      // Return defaults if no setting exists
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          barcodeType: "code128",
          barcodeFormat: "css",
          branchId,
        },
      })
    }

    return NextResponse.json({ success: true, data: setting })
  } catch (error) {
    console.error("Error fetching barcode settings:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch barcode settings" }, { status: 500 })
  }
}

/**
 * POST /api/pos/barcode-settings
 * Save barcode settings (upsert).
 * Mirrors reference-erp barcode/settings endpoint.
 *
 * Body: { barcodeType: string, barcodeFormat: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const body = await request.json().catch(() => null)

    if (!body) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })

    const barcodeType = VALID_BARCODE_TYPES.includes(body.barcodeType) ? body.barcodeType : "code128"
    const barcodeFormat = VALID_BARCODE_FORMATS.includes(body.barcodeFormat) ? body.barcodeFormat : "css"

    // Upsert: update existing or create new
    const existing = await prisma.barcodeSetting.findFirst({
      where: branchId ? { branchId } : { branchId: null },
    })

    let setting
    if (existing) {
      setting = await prisma.barcodeSetting.update({
        where: { id: existing.id },
        data: { barcodeType, barcodeFormat },
      })
    } else {
      setting = await prisma.barcodeSetting.create({
        data: { barcodeType, barcodeFormat, branchId },
      })
    }

    return NextResponse.json({ success: true, data: setting })
  } catch (error) {
    console.error("Error saving barcode settings:", error)
    return NextResponse.json({ success: false, message: "Failed to save barcode settings" }, { status: 500 })
  }
}
