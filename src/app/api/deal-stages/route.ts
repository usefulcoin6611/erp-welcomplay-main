import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

const createSchema = z.object({
  pipelineId: z.string().min(1, "Pipeline wajib dipilih"),
  name: z.string().min(1, "Nama stage wajib diisi").max(191),
})

type DealStageItem = {
  id: string
  name: string
  order: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pipelineId = searchParams.get("pipelineId")

    if (!pipelineId) {
      return NextResponse.json(
        { success: false, message: "pipelineId wajib diisi" },
        { status: 400 },
      )
    }

    const branchId = (session.user as any).branchId ?? null

    const stages = await prisma.dealStage.findMany({
      where: { 
        pipelineId,
        pipeline: {
          branchId: branchId || null,
        },
      },
      orderBy: { order: "asc" },
    })

    const data: DealStageItem[] = stages.map((s: any) => ({
      id: s.id,
      name: s.name,
      order: s.order ?? 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil deal stages" },
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
    const result = createSchema.safeParse(json)

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

    const { pipelineId, name } = result.data

    const branchId = (session.user as any).branchId ?? null

    const pipeline = await prisma.pipeline.findFirst({
      where: { 
        id: pipelineId,
        branchId: branchId || null,
      },
    })

    if (!pipeline) {
      return NextResponse.json(
        { success: false, message: "Pipeline tidak ditemukan atau akses ditolak" },
        { status: 404 },
      )
    }

    const lastStage = await prisma.dealStage.findFirst({
      where: { pipelineId },
      orderBy: { order: "desc" },
    })

    const nextOrder = (lastStage?.order ?? 0) + 1

    const created = await prisma.dealStage.create({
      data: {
        name,
        order: nextOrder,
        pipelineId,
      },
    })

    const data: DealStageItem = {
      id: created.id,
      name: created.name,
      order: created.order ?? 0,
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
      { success: false, message: "Gagal membuat deal stage" },
      { status: 500 },
    )
  }
}

