import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

type BillListRow = {
  id: string
  billNumber: string
  billDate: string
  dueDate: string
  vendorId: string | null
  vendorName: string
  category: string
  total: number
  status: string
  statusLabel: string
}

function mapStatus(status: string | null | undefined): { value: string; label: string } {
  const s = (status || "").toLowerCase()
  switch (s) {
    case "draft":
      return { value: "draft", label: "Draft" }
    case "sent":
      return { value: "sent", label: "Sent" }
    case "partial":
      return { value: "partial", label: "Partial" }
    case "unpaid":
      return { value: "unpaid", label: "Unpaid" }
    case "paid":
      return { value: "paid", label: "Paid" }
    default:
      return { value: "draft", label: "Draft" }
  }
}

async function getSessionBranch() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { error: "Unauthorized", status: 401 as const, branchId: null as string | null }
  }

  const branchId = (session.user as any).branchId as string | null
  if (!branchId) {
    return { error: "User has no assigned branch", status: 400 as const, branchId: null }
  }

  return { error: null, status: 200 as const, branchId }
}

export async function GET(request: NextRequest) {
  try {
    const s = await getSessionBranch()
    if (s.error || !s.branchId) {
      return NextResponse.json({ success: false, message: s.error }, { status: s.status })
    }

    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const status = url.searchParams.get("status")

    const where: any = {
      branchId: s.branchId,
    }

    if (date) {
      where.billDate = new Date(date)
    }
    if (status && status !== "all") {
      where.status = status
    }

    const billsDb = await prisma.bill.findMany({
      where,
      include: {
        vendor: true,
        category: true,
      },
      orderBy: {
        billDate: "desc",
      },
    })

    const data: BillListRow[] = billsDb.map((b: any) => {
      const s = mapStatus(b.status)
      return {
        id: b.billId as string,
        billNumber: b.billId as string,
        billDate:
          b.billDate instanceof Date ? b.billDate.toISOString().slice(0, 10) : "",
        dueDate:
          b.dueDate instanceof Date ? b.dueDate.toISOString().slice(0, 10) : "",
        vendorId: b.vendorId ?? null,
        vendorName: b.vendor?.name ?? "",
        category: b.category?.name ?? "",
        total: Number(b.total) || 0,
        status: s.value,
        statusLabel: s.label,
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bill" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const s = await getSessionBranch()
    if (s.error || !s.branchId) {
      return NextResponse.json({ success: false, message: s.error }, { status: s.status })
    }

    const body = await request.json().catch(() => ({}))
    const {
      billId,
      vendorId,
      billDate,
      dueDate,
      categoryId,
      reference,
      description,
      status,
      total,
      items,
    } = body || {}

    if (!vendorId || !billDate || !dueDate) {
      return NextResponse.json(
        { success: false, message: "vendorId, billDate, dan dueDate wajib diisi" },
        { status: 400 },
      )
    }

    const created = await prisma.bill.create({
      data: {
        billId: billId || undefined,
        vendorId,
        branchId: s.branchId,
        billDate: new Date(billDate),
        dueDate: new Date(dueDate),
        categoryId:
          typeof categoryId === "string" && categoryId
            ? categoryId
            : null,
        reference: reference ?? null,
        description: description ?? null,
        status: status ?? "draft",
        total: typeof total === "number" ? total : 0,
        items: Array.isArray(items)
          ? {
              create: items.map((it: any) => ({
                itemName: String(it.itemName || ""),
                quantity: Number(it.quantity) || 0,
                price: Number(it.price) || 0,
                discount: Number(it.discount) || 0,
                taxRate: Number(it.taxRate) || 0,
                amount:
                  (Number(it.price) || 0) * (Number(it.quantity) || 0) -
                  (Number(it.discount) || 0),
                description: it.description ? String(it.description) : null,
              })),
            }
          : undefined,
      },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json(
      { success: false, message: "Gagal membuat bill" },
      { status: 500 },
    )
  }
}
