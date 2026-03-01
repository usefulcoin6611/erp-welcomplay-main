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

async function buildBillItems(
  branchId: string,
  itemsInput: any,
): Promise<{ error: string | null; items: any[] }> {
  const rawItems: any[] = Array.isArray(itemsInput) ? itemsInput : []

  if (!rawItems.length) {
    return { error: "Minimal satu item produk wajib diisi", items: [] }
  }

  const normalized = rawItems.map((it) => {
    const productId =
      typeof it.productId === "string" && it.productId ? it.productId : null
    const quantity = Number(it.quantity) || 0
    const price = Number(it.price) || 0
    const discount = Number(it.discount) || 0
    const taxRate = Number(it.taxRate) || 0
    const description =
      typeof it.description === "string" && it.description
        ? String(it.description)
        : null

    return { productId, quantity, price, discount, taxRate, description }
  })

  if (normalized.some((it) => !it.productId)) {
    return {
      error: "Semua item wajib memilih Product/Service dari katalog",
      items: [],
    }
  }

  const productIds = Array.from(
    new Set(
      normalized
        .map((it) => it.productId)
        .filter((id): id is string => typeof id === "string" && !!id),
    ),
  )

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      branchId,
    },
  })

  const productMap = new Map<string, any>()
  for (const p of products) {
    if (typeof p.id === "string") {
      productMap.set(p.id, p)
    }
  }

  if (
    normalized.some(
      (it) => !it.productId || !productMap.has(it.productId as string),
    )
  ) {
    return {
      error: "Produk pada salah satu item tidak ditemukan di Products/Services",
      items: [],
    }
  }

  const items = normalized.map((it) => {
    const product = productMap.get(it.productId as string)
    const amount =
      (it.price || 0) * (it.quantity || 0) - (it.discount || 0)

    return {
      productId: it.productId as string,
      itemName: String(product?.name || ""),
      quantity: it.quantity,
      price: it.price,
      discount: it.discount,
      taxRate: it.taxRate,
      amount,
      description: it.description,
    }
  })

  return { error: null, items }
}

export async function GET(request: NextRequest) {
  try {
    const s = await getSessionBranch()
    if (s.error || typeof s.branchId !== 'string') {
      return NextResponse.json({ success: false, message: s.error }, { status: s.status || 401 })
    }

    const branchId = s.branchId as string;
    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const status = url.searchParams.get("status")

    const where: any = {
      branchId,
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
        id: b.id as string,
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

    const builtItems = await buildBillItems(s.branchId, items)
    if (builtItems.error) {
      return NextResponse.json(
        { success: false, message: builtItems.error },
        { status: 400 },
      )
    }

    let finalBillId = typeof billId === "string" && billId.trim() ? billId.trim() : null
    if (!finalBillId) {
      const year = new Date().getFullYear()
      const prefix = `BILL-${year}-`
      const existing = await prisma.bill.findMany({
        where: { billId: { startsWith: prefix } },
        select: { billId: true },
        orderBy: { billId: "desc" },
        take: 1,
      })
      const nextNum = existing.length > 0
        ? parseInt(existing[0].billId.replace(prefix, ""), 10) + 1
        : 1
      finalBillId = `${prefix}${String(nextNum).padStart(3, "0")}`
    }

    const created = await prisma.bill.create({
      data: {
        billId: finalBillId,
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
        items: {
          create: builtItems.items,
        },
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
