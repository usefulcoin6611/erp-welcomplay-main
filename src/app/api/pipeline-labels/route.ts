import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

const createSchema = z.object({
  pipelineId: z.string().min(1, "Pipeline wajib dipilih"),
  name: z.string().trim().min(1, "Nama label wajib diisi").max(191),
  color: z.string().trim().min(1, "Warna label wajib dipilih"),
})

type PipelineLabelItem = {
  id: string
  name: string
  color: string
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

    const labels = await (prisma as any).pipelineLabel.findMany({
      where: { pipelineId },
      orderBy: { createdAt: "asc" },
    })

    const data: PipelineLabelItem[] = labels.map((l: any) => ({
      id: l.id as string,
      name: l.name as string,
      color: l.color as string,
    }))

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil labels" },
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

    const { pipelineId, name, color } = result.data

    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
    })

    if (!pipeline) {
      return NextResponse.json(
        { success: false, message: "Pipeline tidak ditemukan" },
        { status: 404 },
      )
    }

    const existing = await (prisma as any).pipelineLabel.findFirst({
      where: {
        pipelineId,
        name,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama label sudah digunakan di pipeline ini" },
        { status: 400 },
      )
    }

    const created = await (prisma as any).pipelineLabel.create({
      data: {
        pipelineId,
        name,
        color,
      },
    })

    const data: PipelineLabelItem = {
      id: created.id as string,
      name: created.name as string,
      color: created.color as string,
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
      { success: false, message: "Gagal membuat label" },
      { status: 500 },
    )
  }
}

