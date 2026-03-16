import { NextRequest, NextResponse } from "next/server"
import type { Estimate as EstimateModel, Customer, EstimateItem as EstimateItemModel } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

type ProposalItem = {
  id: string
  item: string
  quantity: string
  price: string
  discount: string
  tax: string
  taxRate: string
  description: string
  amount: number
}

type Estimate = {
  id: string
  customer: string
  customerCode?: string
  category: string
  categoryId?: string
  issueDate: string
  status: number
  total: number
  description?: string
  items?: ProposalItem[]
}

// use shared prisma client from src/lib/prisma to avoid initialization issues

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const branchId = (session.user as any).branchId as string | null;
    if (!branchId) return NextResponse.json({ success: true, data: [] });

    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const status = url.searchParams.get("status")

    const where: any = { branchId }
    if (date) where.issueDate = new Date(date)
    if (status && status !== "") where.status = parseInt(status, 10)
    const dataDb = await prisma.estimate.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { issueDate: "desc" }
    })
    const categoryIds = Array.from(new Set(dataDb.map((e: any) => e.categoryId).filter(Boolean))) as string[]
    const categories = categoryIds.length > 0 ? await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    }) : []
    const categoryMap = new Map<string, string>(categories.map((c: any) => [c.id, c.name]))
    const data = dataDb.map((e: any) => ({
      id: e.estimateId,
      customer: e.customer.name,
      customerCode: e.customer.customerCode,
      category: e.categoryId ? (categoryMap.get(e.categoryId) || "") : "",
      categoryId: e.categoryId || "",
      issueDate: e.issueDate.toISOString().slice(0, 10),
      status: e.status,
      total: e.total,
      description: e.description || "",
      items: e.items.map((it: any) => ({
        id: it.id,
        item: it.itemName,
        quantity: String(it.quantity),
        price: String(it.price),
        discount: String(it.discount),
        tax: "",
        taxRate: String(it.taxRate),
        description: (it as any).description || "",
        amount: it.amount
      }))
    }))

    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ success: false, message: "Failed to fetch estimates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const branchId = (session.user as any).branchId as string | null;
    if (!branchId) return NextResponse.json({ success: false, message: "Aksi ditolak: User tidak memiliki branch" }, { status: 400 });

    const body = await request.json()
    const customer = await prisma.customer.findFirst({
      where: { id: body.customerId, branchId },
    })
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found or access denied" }, { status: 400 })
    }
    const count = await prisma.estimate.count({ where: { branchId } })
    const estimateId = `PR-2026-${String(count + 1).padStart(3, "0")}`
    const created = await prisma.estimate.create({
      data: {
        estimateId,
        branchId,
        customerId: customer.id,
        categoryId: body.categoryId ?? null,
        issueDate: new Date(body.issueDate),
        status: body.status ?? 0,
        total: body.total ?? 0,
        description: body.description ?? "",
        items: {
          create: (body.items ?? []).map((it: any) => ({
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
    return NextResponse.json({ success: true, data: { id: created.estimateId } })
  } catch (e) {
    return NextResponse.json({ success: false, message: "Failed to create estimate" }, { status: 500 })
  }
}
