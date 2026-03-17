import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

function mapProduct(p: any) {
  return {
    id: p.id as string,
    name: p.name as string,
    sku: p.sku as string,
    salePrice: Number(p.salePrice) || 0,
    purchasePrice: Number(p.purchasePrice) || 0,
    quantity: Number(p.quantity) || 0,
    type: p.type as string,
    categoryId: p.categoryId ?? null,
    category: p.category?.name ?? "",
    unit: p.unit?.name ?? "",
    tax: p.tax?.name ?? "",
    saleAccountId: p.saleAccountId ?? null,
    expenseAccountId: p.expenseAccountId ?? null,
    saleAccountName: p.saleAccount?.name ?? "",
    expenseAccountName: p.expenseAccount?.name ?? "",
  }
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where: any = {
      branch: {
        ownerId: companyId,
      },
    }
    if (type) {
      where.type = type
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        unit: true,
        tax: true,
        saleAccount: true,
        expenseAccount: true,
      },
      orderBy: { name: "asc" },
    })

    const data = products.map(mapProduct)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
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

    const branchId = (session.user as any).branchId as string | null

    const body = await request.json().catch(() => null)

    if (
      !body ||
      typeof body.name !== "string" ||
      typeof body.sku !== "string" ||
      typeof body.salePrice !== "number" ||
      typeof body.purchasePrice !== "number" ||
      typeof body.type !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Data produk tidak valid" },
        { status: 400 },
      )
    }

    const quantity =
      typeof body.quantity === "number" && !Number.isNaN(body.quantity)
        ? body.quantity
        : 0

    let categoryId: string | null = null
    let unitId: string | null = null
    let taxId: string | null = null

    if (body.categoryId && typeof body.categoryId === "string") {
      categoryId = body.categoryId
    } else if (body.categoryName && typeof body.categoryName === "string") {
      const category = await prisma.category.findFirst({
        where: { name: body.categoryName },
      })
      categoryId = category?.id ?? null
    }

    if (body.unitName && typeof body.unitName === "string") {
      const unit = await prisma.unit.findFirst({
        where: { name: body.unitName },
      })
      unitId = unit?.id ?? null
    }

    if (body.taxName && typeof body.taxName === "string") {
      const tax = await prisma.tax.findFirst({
        where: { name: body.taxName },
      })
      taxId = tax?.id ?? null
    }

    const created = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        salePrice: body.salePrice,
        purchasePrice: body.purchasePrice,
        quantity,
        type: body.type,
        categoryId,
        unitId,
        taxId,
        branchId,
        saleAccountId:
          typeof body.saleAccountId === "string" && body.saleAccountId
            ? body.saleAccountId
            : null,
        expenseAccountId:
          typeof body.expenseAccountId === "string" && body.expenseAccountId
            ? body.expenseAccountId
            : null,
      },
      include: {
        category: true,
        unit: true,
        tax: true,
        saleAccount: true,
        expenseAccount: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: mapProduct(created),
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 },
    )
  }
}
