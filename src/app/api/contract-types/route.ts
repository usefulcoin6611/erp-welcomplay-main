import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"

const CONTRACT_TYPES_KEY = "crm_contract_types"

type ContractTypeItem = {
  id: string
  name: string
}

const defaultContractTypes: ContractTypeItem[] = [
  { id: "ct-1", name: "Service Agreement" },
  { id: "ct-2", name: "Maintenance Contract" },
  { id: "ct-3", name: "Support Contract" },
  { id: "ct-4", name: "License Agreement" },
  { id: "ct-5", name: "Consulting Agreement" },
]

function parseStoredValue(value: string | null): ContractTypeItem[] {
  if (!value) return defaultContractTypes
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return defaultContractTypes
    const safe = parsed
      .map((item) => {
        if (
          item &&
          typeof item === "object" &&
          typeof (item as any).id === "string" &&
          typeof (item as any).name === "string"
        ) {
          return { id: (item as any).id, name: (item as any).name } as ContractTypeItem
        }
        return null
      })
      .filter((v): v is ContractTypeItem => v !== null)
    return safe.length > 0 ? safe : defaultContractTypes
  } catch {
    return defaultContractTypes
  }
}

async function getCurrentContractTypes(): Promise<ContractTypeItem[]> {
  const setting = await prisma.setting.findUnique({
    where: { key: CONTRACT_TYPES_KEY },
  })
  return parseStoredValue(setting?.value ?? null)
}

async function saveContractTypes(items: ContractTypeItem[]): Promise<void> {
  await prisma.setting.upsert({
    where: { key: CONTRACT_TYPES_KEY },
    create: {
      key: CONTRACT_TYPES_KEY,
      value: JSON.stringify(items),
    },
    update: {
      value: JSON.stringify(items),
    },
  })
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const items = await getCurrentContractTypes()
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal memuat contract types" },
      { status: 500 }
    )
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(191),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json().catch(() => null)
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid" },
        { status: 400 }
      )
    }

    const current = await getCurrentContractTypes()
    const nextIndex =
      current.reduce((max, item) => {
        const match = item.id.match(/^ct-(\d+)$/)
        if (!match) return max
        const num = parseInt(match[1], 10)
        return Number.isNaN(num) ? max : Math.max(max, num)
      }, 0) + 1

    const newItem: ContractTypeItem = {
      id: `ct-${nextIndex}`,
      name: parsed.data.name.trim(),
    }

    const updated = [...current, newItem]
    await saveContractTypes(updated)

    return NextResponse.json({ success: true, data: newItem })
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan contract type" },
      { status: 500 }
    )
  }
}

