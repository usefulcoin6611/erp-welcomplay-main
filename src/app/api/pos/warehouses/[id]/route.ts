import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * PATCH /api/pos/warehouses/[id]
 * Update a warehouse.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })

    const existing = await prisma.warehouse.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, message: "Warehouse not found" }, { status: 404 })

    const updated = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(typeof body.name === "string" && body.name.trim() ? { name: body.name.trim() } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("Error updating warehouse:", error)
    return NextResponse.json({ success: false, message: "Failed to update warehouse" }, { status: 500 })
  }
}

/**
 * DELETE /api/pos/warehouses/[id]
 * Delete a warehouse.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const existing = await prisma.warehouse.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, message: "Warehouse not found" }, { status: 404 })

    await prisma.warehouse.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Warehouse deleted" })
  } catch (error) {
    console.error("Error deleting warehouse:", error)
    return NextResponse.json({ success: false, message: "Failed to delete warehouse" }, { status: 500 })
  }
}

/**
 * GET /api/pos/warehouses/[id]
 * Get a single warehouse.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    const warehouse = await prisma.warehouse.findUnique({ where: { id } })
    if (!warehouse) return NextResponse.json({ success: false, message: "Warehouse not found" }, { status: 404 })

    return NextResponse.json({ success: true, data: warehouse })
  } catch (error) {
    console.error("Error fetching warehouse:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch warehouse" }, { status: 500 })
  }
}
