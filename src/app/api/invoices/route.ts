import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { type Invoice as InvoiceModel, type Customer, type InvoiceItem as InvoiceItemModel } from "@prisma/client"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

type InvoiceItemInput = {
  item: string
  quantity: string
  price: string
  discount: string
  taxRate: string
  amount?: number
  description?: string
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const status = url.searchParams.get("status")
    const customerId = url.searchParams.get("customerId")

    const where: any = {}
    if (date) where.issueDate = new Date(date)
    if (status && status !== "") where.status = parseInt(status, 10)
    if (customerId && customerId !== "all") where.customerId = customerId

    const dataDb = await prisma.invoice.findMany({
      where: {
        ...where,
        customer: {
          branch: {
            ownerId: companyId,
          },
        },
      },
      include: { customer: true, items: true },
      orderBy: { issueDate: "desc" }
    })

    const data = dataDb.map((e: any) => ({
      id: e.invoiceId,
      issueDate: e.issueDate.toISOString().slice(0, 10),
      dueDate: e.dueDate.toISOString().slice(0, 10),
      dueAmount: e.dueAmount,
      status: e.status,
      customerId: e.customerId,
      categoryId: e.categoryId || "",
      description: e.description || "",
      items: e.items.map((it: any) => ({
        id: it.id,
        item: it.itemName,
        quantity: String(it.quantity),
        price: String(it.price),
        discount: String(it.discount),
        taxRate: String(it.taxRate),
        description: it.description || "",
        amount: it.amount
      }))
    }))
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ success: false, message: "Failed to fetch invoices" }, { status: 500 })
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

    const body = await request.json()
    const customer = await prisma.customer.findUnique({ where: { id: body.customerId } })
    if (!customer) return NextResponse.json({ success: false, message: "Customer not found" }, { status: 400 })
    const count = await prisma.invoice.count()
    const invoiceId = `INV-2026-${String(count + 1).padStart(3, "0")}`
    const created = await prisma.invoice.create({
      data: {
        invoiceId,
        customerId: customer.id,
        branchId: customer.branchId,
        categoryId: body.categoryId ?? null,
        issueDate: new Date(body.issueDate),
        dueDate: new Date(body.dueDate),
        status: body.status ?? 0,
        dueAmount: body.dueAmount ?? 0,
        description: body.description ?? "",
        items: {
          create: (body.items ?? []).map((it: InvoiceItemInput) => ({
            itemName: it.item,
            quantity: parseFloat(it.quantity) || 0,
            price: parseFloat(it.price) || 0,
            discount: parseFloat(it.discount) || 0,
            taxRate: parseFloat(it.taxRate) || 0,
            amount: it.amount ?? 0,
            description: it.description ?? "",
          })),
        },
      },
      include: { customer: true, items: true }
    })
    return NextResponse.json({ success: true, data: { id: created.invoiceId } })
  } catch (e) {
    return NextResponse.json({ success: false, message: "Failed to create invoice" }, { status: 500 })
  }
}
