import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

const pipelineSchema = z.object({
  name: z.string().min(1, "Nama pipeline wajib diisi"),
})

type PipelineListItem = {
  id: string
  name: string
  deals: number
  value: number
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId ?? null

    const pipelines = await prisma.pipeline.findMany({
      where: {
        branchId: branchId || null,
      },
      include: {
        deals: {
          select: { price: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    const data: PipelineListItem[] = pipelines.map((p: any) => ({
      id: p.id,
      name: p.name,
      deals: p.deals.length,
      value: p.deals.reduce((sum: number, d: any) => sum + (d.price ?? 0), 0),
    }))

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data pipeline" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const existing = await prisma.pipeline.findFirst({
      where: {
        name,
        branchId: branchId || null,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama pipeline sudah digunakan" },
        { status: 400 },
      )
    }

    const created = await prisma.pipeline.create({
      data: {
        name,
        branchId,
      },
    })

    const data: PipelineListItem = {
      id: created.id,
      name: created.name,
      deals: 0,
      value: 0,
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal membuat pipeline" },
      { status: 500 },
    )
  }
}

