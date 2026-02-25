import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().trim().min(1, "Nama label wajib diisi").max(191),
  color: z.string().trim().min(1, "Warna label wajib dipilih"),
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

    const body = await request.json()
    const validation = updateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0]?.message ?? "Data tidak valid",
          errors: validation.error.format(),
        },
        { status: 400 },
      )
    }

    const { name, color } = validation.data

    const existing = await (prisma as any).pipelineLabel.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Label tidak ditemukan" },
        { status: 404 },
      )
    }

    const updated = await (prisma as any).pipelineLabel.update({
      where: { id },
      data: {
        name,
        color,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Label berhasil diperbarui",
      data: {
        id: updated.id as string,
        name: updated.name as string,
        color: updated.color as string,
      },
    })
  } catch (error) {
    console.error("Error updating label:", error)
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui label" },
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

    const existing = await (prisma as any).pipelineLabel.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Label tidak ditemukan" },
        { status: 404 },
      )
    }

    await (prisma as any).pipelineLabel.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Label berhasil dihapus",
    })
  } catch (error) {
    console.error("Error deleting label:", error)
    return NextResponse.json(
      { success: false, message: "Gagal menghapus label" },
      { status: 500 },
    )
  }
}

