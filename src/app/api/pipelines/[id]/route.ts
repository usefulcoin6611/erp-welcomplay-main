import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

const pipelineSchema = z.object({
  name: z.string().min(1, "Nama pipeline wajib diisi"),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 },
      )
    }

    const json = await request.json().catch(() => null)
    const result = pipelineSchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.errors[0]?.message ?? "Data tidak valid",
          errors: result.error.format(),
        },
        { status: 400 },
      )
    }

    const { name } = result.data
    const branchId = (session.user as any).branchId ?? null

    const duplicate = await prisma.pipeline.findFirst({
      where: {
        id: { not: id },
        name,
        ...(branchId ? { branchId } : { branchId: null }),
      },
    })

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Nama pipeline sudah digunakan" },
        { status: 400 },
      )
    }

    const pipeline = await prisma.pipeline.update({
      where: { 
        id,
        branchId: branchId || null,
      },
      data: { name },
      include: {
        deals: {
          select: { price: true },
        },
      },
    })

    const data = {
      id: pipeline.id,
      name: pipeline.name,
      deals: pipeline.deals.length,
      value: pipeline.deals.reduce((sum: number, d: any) => sum + (d.price ?? 0), 0),
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui pipeline" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 },
      )
    }

    const pipeline = await prisma.pipeline.findFirst({
      where: { 
        id,
        branchId: (session.user as any).branchId ?? null,
      },
      include: {
        leads: true,
        deals: true,
        leadStages: true,
      },
    })

    if (!pipeline) {
      return NextResponse.json(
        { success: false, message: "Pipeline tidak ditemukan" },
        { status: 404 },
      )
    }

    if (
      pipeline.leads.length > 0 ||
      pipeline.deals.length > 0 ||
      pipeline.leadStages.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pipeline tidak dapat dihapus karena sudah digunakan oleh leads, deals, atau stages",
        },
        { status: 400 },
      )
    }

    await prisma.pipeline.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Pipeline berhasil dihapus",
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus pipeline" },
      { status: 500 },
    )
  }
}

