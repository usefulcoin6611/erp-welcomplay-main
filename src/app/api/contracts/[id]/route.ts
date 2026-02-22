import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

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

    const numberPart = contract.contractId.split("-").slice(-1)[0] as string
    const contractNumber = `CTR-${numberPart}`

    const data = {
      id: contract.contractId,
      contractNumber,
      subject: contract.subject,
      client: contract.clientName,
      project: "",
      type: contract.type,
      value: contract.value,
      startDate: contract.startDate.toISOString().slice(0, 10),
      endDate: contract.endDate.toISOString().slice(0, 10),
      status: contract.status,
      description: contract.description ?? undefined,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    )
  }
}
