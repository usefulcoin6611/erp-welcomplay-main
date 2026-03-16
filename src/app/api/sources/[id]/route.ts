import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const sourceSchema = z.object({
  name: z.string().trim().min(1, "Nama source wajib diisi"),
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
    const validation = sourceSchema.safeParse(body)

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

    const branchId = (session.user as any).branchId ?? null

    const source = await (prisma as any).source.update({
      where: { 
        id,
        branchId: branchId || null,
      },
      data: {
        name,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Source berhasil diperbarui",
      data: source,
    })
  } catch (error) {
    console.error("Error updating source:", error)
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui source" },
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

    const branchId = (session.user as any).branchId ?? null

    await (prisma as any).source.delete({
      where: { 
        id,
        branchId: branchId || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Source berhasil dihapus",
    })
  } catch (error) {
    console.error("Error deleting source:", error)
    return NextResponse.json(
      { success: false, message: "Gagal menghapus source" },
      { status: 500 },
    )
  }
}

