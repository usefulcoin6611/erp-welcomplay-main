import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createContractSchema = z.object({
  subject: z.string().min(1),
  clientName: z.string().min(1),
  value: z.number().nonnegative(),
  type: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const usePagination = pageParam != null || limitParam != null
    const page = usePagination ? Math.max(1, parseInt(pageParam ?? "1", 10)) : 1
    const limit = usePagination
      ? Math.min(100, Math.max(1, parseInt(limitParam ?? "10", 10)))
      : 10000
    const skip = (page - 1) * limit

    const branchId = (session.user as any).branchId as string | null;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where: {
          branchId: branchId || null,
        },
        orderBy: { createdAt: "desc" },
        ...(usePagination && { skip, take: limit }),
      }),
      prisma.contract.count({
        where: {
          branchId: branchId || null,
        },
      }),
    ])

    const projectIds = [...new Set(contracts.map((c: { projectId: string | null }) => c.projectId).filter(Boolean))] as string[]
    const projects = projectIds.length > 0
      ? await prisma.project.findMany({
          where: { projectId: { in: projectIds } },
          select: { projectId: true, name: true },
        })
      : []
    const projectNameByProjectId = Object.fromEntries(projects.map((p: any) => [p.projectId, p.name]))

    const data = contracts.map((c: any) => {
      const numberPart = c.contractId.split("-").slice(-1)[0] as string
      const contractNumber = `CTR-${numberPart}`
      const projectName = c.projectId ? (projectNameByProjectId[c.projectId] ?? c.projectId) : ""
      return {
        id: c.contractId,
        number: contractNumber,
        contractNumber,
        subject: c.subject,
        client: c.clientName,
        project: projectName || "-",
        projectId: c.projectId ?? null,
        type: c.type,
        value: c.value,
        startDate: c.startDate.toISOString().slice(0, 10),
        endDate: c.endDate.toISOString().slice(0, 10),
        status: c.status,
        description: c.description ?? undefined,
      }
    })

    const payload: { success: true; data: typeof data; total?: number; page?: number; limit?: number } = {
      success: true,
      data,
    }
    if (usePagination) {
      payload.total = total
      payload.page = page
      payload.limit = limit
    }
    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const role = (session.user as { role?: string }).role
    if (role === "client") {
      return NextResponse.json(
        { success: false, message: "Client role cannot create contracts." },
        { status: 403 }
      )
    }

    const json = await request.json()
    const parsed = createContractSchema.safeParse(json)

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

    const {
      subject,
      clientName,
      value,
      type,
      startDate,
      endDate,
      description,
      projectId,
    } = parsed.data

    const branchId = (session.user as any).branchId as string | null;

    const last = await prisma.contract.findFirst({
      where: {
        branchId: branchId || null,
      },
      orderBy: { createdAt: "desc" },
    })

    let nextNumber = 1
    if (last?.contractId) {
      const match = last.contractId.match(/(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    const contractId = `CTR-2025-${String(nextNumber).padStart(3, "0")}`

    const created = await prisma.contract.create({
      data: {
        contractId,
        branchId,
        clientName,
        subject,
        value,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        status: "accept",
        createdById: session.user.id,
        projectId: projectId || null,
      },
    })

    const numberPart = created.contractId.split("-").slice(-1)[0] as string
    const contractNumber = `CTR-${numberPart}`

    const data = {
      id: created.contractId,
      contractNumber,
      subject: created.subject,
      client: created.clientName,
      project: created.projectId ?? "",
      type: created.type,
      value: created.value,
      startDate: created.startDate.toISOString().slice(0, 10),
      endDate: created.endDate.toISOString().slice(0, 10),
      status: created.status,
      description: created.description ?? undefined,
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    )
  }
}
