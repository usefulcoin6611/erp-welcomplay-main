import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

const createSchema = z.object({
  pipelineId: z.string().min(1, "Pipeline wajib dipilih"),
  name: z.string().min(1, "Nama stage wajib diisi").max(191),
})

type LeadStageItem = {
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

    const stages = await prisma.leadStage.findMany({
      where: { pipelineId },
      orderBy: { order: "asc" },
    })

    const data: LeadStageItem[] = stages.map((s) => ({
      id: s.id,
      name: s.name,
      order: s.order ?? 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil lead stages" },
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

    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
    })

    if (!pipeline) {
      return NextResponse.json(
        { success: false, message: "Pipeline tidak ditemukan" },
        { status: 404 },
      )
    }

    const lastStage = await prisma.leadStage.findFirst({
      where: { pipelineId },
      orderBy: { order: "desc" },
    })

    const nextOrder = (lastStage?.order ?? 0) + 1

    const created = await prisma.leadStage.create({
      data: {
        name,
        order: nextOrder,
        pipelineId,
      },
    })

    const data: LeadStageItem = {
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
      { success: false, message: "Gagal membuat lead stage" },
      { status: 500 },
    )
  }
}
