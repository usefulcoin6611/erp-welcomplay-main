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
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: "desc" },
    })

    const data = contracts.map((c: any) => {
      const numberPart = c.contractId.split("-").slice(-1)[0] as string
      const contractNumber = `CTR-${numberPart}`
      return {
        id: c.contractId,
        contractNumber,
        subject: c.subject,
        client: c.clientName,
        project: "",
        type: c.type,
        value: c.value,
        startDate: c.startDate.toISOString().slice(0, 10),
        endDate: c.endDate.toISOString().slice(0, 10),
        status: c.status,
        description: c.description ?? undefined,
      }
    })

    return NextResponse.json({ success: true, data })
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

    const { subject, clientName, value, type, startDate, endDate, description } =
      parsed.data

    const last = await prisma.contract.findFirst({
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
        clientName,
        subject,
        value,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        status: "accept",
        createdById: session.user.id,
      },
    })

    const numberPart = created.contractId.split("-").slice(-1)[0] as string
    const contractNumber = `CTR-${numberPart}`

    const data = {
      id: created.contractId,
      contractNumber,
      subject: created.subject,
      client: created.clientName,
      project: "",
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
