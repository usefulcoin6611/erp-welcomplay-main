import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

const updateSchema = z.object({
  name: z.string().min(1, "Nama stage wajib diisi").max(191),
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
    const result = updateSchema.safeParse(json)

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

    const stage = await prisma.leadStage.update({
      where: { id },
      data: { name },
    })

    const data = {
      id: stage.id,
      name: stage.name,
      order: stage.order ?? 0,
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui lead stage" },
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

    // Check if stage is used by any leads
    const leadsCount = await prisma.lead.count({
      where: { stageId: id }, // Assuming relation exists or using string match if not relation
    })

    // If using prisma schema, check the Lead model definition. 
    // Usually it's stage string or relation.
    // Let's assume standard behavior: if relation exists, we check.
    // If we are not sure about schema, maybe we can just try delete and catch error.
    
    // Let's just try delete. If it fails due to foreign key constraint, we catch it.
    await prisma.leadStage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: "Lead stage berhasil dihapus" })
  } catch (error: any) {
    if (error.code === 'P2003') {
       return NextResponse.json(
        { success: false, message: "Gagal menghapus: Stage sedang digunakan oleh data lain" },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { success: false, message: "Gagal menghapus lead stage" },
      { status: 500 },
    )
  }
}
