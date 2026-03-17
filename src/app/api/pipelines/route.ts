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

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const userBranches = await (prisma as any).branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const pipelines = await (prisma.pipeline as any).findMany({
      where: {
        branchId: {
          in: branchIds
        }
      },
      include: {
        deals: {
          select: { price: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }) as any[]

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

    const { id: userId, role, ownerId, branchId } = session.user as any
    const companyId = role === "company" ? userId : ownerId

    if (role !== "super admin" && role !== "company" && role !== "employee") {
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

    const existing = await prisma.pipeline.findFirst({
      where: {
        name,
        branch: { ownerId: companyId },
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

