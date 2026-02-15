import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const est = await prisma.estimate.findUnique({
      where: { estimateId: id },
      include: { customer: true, items: true }
    })
    if (!est) return NextResponse.json({ success: false, message: "Estimate not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: est })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch estimate" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await prisma.estimate.update({
      where: { estimateId: id },
      data: {
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        status: typeof body.status === "number" ? body.status : undefined,
        total: typeof body.total === "number" ? body.total : undefined,
        description: body.description ?? undefined,
        customerId: typeof body.customerId === "string" && body.customerId !== "" ? body.customerId : undefined,
        categoryId: typeof body.categoryId === "string" && body.categoryId !== "" ? body.categoryId : undefined,
      }
    })
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update estimate" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.estimate.delete({
      where: { estimateId: id }
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete estimate" }, { status: 500 })
  }
}
