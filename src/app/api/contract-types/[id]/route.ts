import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const contractTypeSchema = z.object({
  name: z.string().trim().min(1, "Nama contract type wajib diisi").max(191),
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
    const validation = contractTypeSchema.safeParse(body)

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

    const { name } = validation.data
    const branchId = (session.user as any).branchId as string | null
    const existing = await prisma.contractType.findFirst({
      where: { 
        id,
        branchId: branchId || null,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Contract type tidak ditemukan atau akses ditolak" },
        { status: 404 },
      )
    }

    const updated = await prisma.contractType.update({
      where: { id: existing.id },
      data: { name },
    })

    return NextResponse.json({
      success: true,
      message: "Contract type berhasil diperbarui",
      data: { id: updated.id, name: updated.name },
    })
  } catch (error) {
    console.error("Error updating contract type:", error)
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui contract type" },
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

    const branchId = (session.user as any).branchId as string | null
    const existing = await prisma.contractType.findFirst({
      where: { 
        id,
        branchId: branchId || null,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Contract type tidak ditemukan atau akses ditolak" },
        { status: 404 },
      )
    }

    await prisma.contractType.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({
      success: true,
      message: "Contract type berhasil dihapus",
    })
  } catch (error) {
    console.error("Error deleting contract type:", error)
    return NextResponse.json(
      { success: false, message: "Gagal menghapus contract type" },
      { status: 500 },
    )
  }
}

