import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateContractSchema = z.object({
  subject: z.string().min(1).optional(),
  clientName: z.string().min(1).optional(),
  value: z.number().nonnegative().optional(),
  type: z.string().min(1).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  status: z.string().optional(),
})

function mapContractToResponse(contract: any, projectName?: string) {
  const numberPart = contract.contractId.split("-").slice(-1)[0] as string
  const contractNumber = `CTR-${numberPart}`
  return {
    id: contract.contractId,
    contractNumber,
    subject: contract.subject,
    client: contract.clientName,
    project: projectName ?? (contract.projectId ? contract.projectId : "-"),
    projectId: contract.projectId ?? null,
    type: contract.type,
    value: contract.value,
    startDate: contract.startDate.toISOString().slice(0, 10),
    endDate: contract.endDate.toISOString().slice(0, 10),
    status: contract.status,
    description: contract.description ?? undefined,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contract = await prisma.contract.findUnique({
      where: { contractId: id },
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract tidak ditemukan" },
        { status: 404 },
      )
    }

    let projectName: string | undefined
    if (contract.projectId) {
      const project = await prisma.project.findUnique({
        where: { projectId: contract.projectId },
        select: { name: true },
      })
      projectName = project?.name
    }

    const data = mapContractToResponse(contract, projectName)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const role = (session.user as { role?: string }).role
    if (role === "client") {
      return NextResponse.json(
        { success: false, message: "Client role cannot edit contracts." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = updateContractSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message ?? "Data tidak valid",
          errors: parsed.error.format(),
        },
        { status: 400 },
      )
    }

    const existing = await prisma.contract.findUnique({
      where: { contractId: id },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Contract tidak ditemukan" },
        { status: 404 },
      )
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.subject != null) data.subject = parsed.data.subject
    if (parsed.data.clientName != null) data.clientName = parsed.data.clientName
    if (parsed.data.value != null) data.value = parsed.data.value
    if (parsed.data.type != null) data.type = parsed.data.type
    if (parsed.data.startDate != null) data.startDate = new Date(parsed.data.startDate)
    if (parsed.data.endDate != null) data.endDate = new Date(parsed.data.endDate)
    if (parsed.data.description !== undefined) data.description = parsed.data.description
    if (parsed.data.projectId !== undefined) data.projectId = parsed.data.projectId || null
    if (parsed.data.status != null) data.status = parsed.data.status

    const updated = await prisma.contract.update({
      where: { contractId: id },
      data,
    })

    let projectName: string | undefined
    if (updated.projectId) {
      const project = await prisma.project.findUnique({
        where: { projectId: updated.projectId },
        select: { name: true },
      })
      projectName = project?.name
    }

    return NextResponse.json({
      success: true,
      message: "Contract berhasil diperbarui",
      data: mapContractToResponse(updated, projectName),
    })
  } catch (error) {
    console.error("Contract PUT error:", error)
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
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
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const role = (session.user as { role?: string }).role
    if (role === "client") {
      return NextResponse.json(
        { success: false, message: "Client role cannot delete contracts." },
        { status: 403 }
      )
    }

    const existing = await prisma.contract.findUnique({
      where: { contractId: id },
    })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Contract tidak ditemukan" },
        { status: 404 },
      )
    }

    await prisma.contract.delete({
      where: { contractId: id },
    })

    return NextResponse.json({
      success: true,
      message: "Contract berhasil dihapus",
    })
  } catch (error) {
    console.error("Contract DELETE error:", error)
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    )
  }
}
