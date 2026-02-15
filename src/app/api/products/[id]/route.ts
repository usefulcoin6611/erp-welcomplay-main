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
    category: p.category?.name ?? "",
    unit: p.unit?.name ?? "",
    tax: p.tax?.name ?? "",
    saleAccountId: p.saleAccountId ?? null,
    expenseAccountId: p.expenseAccountId ?? null,
    saleAccountName: p.saleAccount?.name ?? "",
    expenseAccountName: p.expenseAccount?.name ?? "",
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        tax: true,
        saleAccount: true,
        expenseAccount: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product tidak ditemukan" },
        { status: 404 },
      )
    }

    if (branchId && product.branchId && product.branchId !== branchId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke produk ini" },
        { status: 403 },
      )
    }

    return NextResponse.json({
      success: true,
      data: mapProduct(product),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
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

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null

    const body: any = await request.json().catch(() => null)

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product tidak ditemukan" },
        { status: 404 },
      )
    }

    if (branchId && product.branchId && product.branchId !== branchId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke produk ini" },
        { status: 403 },
      )
    }

    if (!body) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid" },
        { status: 400 },
      )
    }

    const keys = Object.keys(body)

    if (
      keys.length === 1 &&
      typeof body.quantity === "number" &&
      !Number.isNaN(body.quantity)
    ) {
      const updatedQuantity = await prisma.product.update({
        where: { id },
        data: {
          quantity: body.quantity,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: updatedQuantity.id,
          name: updatedQuantity.name,
          sku: updatedQuantity.sku,
          quantity: updatedQuantity.quantity,
        },
      })
    }

    if (
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
        : product.quantity

    let categoryId: string | null = product.categoryId
    let unitId: string | null = product.unitId
    let taxId: string | null = product.taxId

    if (body.categoryName && typeof body.categoryName === "string") {
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

    const updated = await prisma.product.update({
      where: { id },
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
        saleAccountId:
          typeof body.saleAccountId === "string" && body.saleAccountId
            ? body.saleAccountId
            : (product as any).saleAccountId,
        expenseAccountId:
          typeof body.expenseAccountId === "string" && body.expenseAccountId
            ? body.expenseAccountId
            : (product as any).expenseAccountId,
      },
      include: {
        category: true,
        unit: true,
        tax: true,
        saleAccount: true,
        expenseAccount: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: mapProduct(updated),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
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

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product tidak ditemukan" },
        { status: 404 },
      )
    }

    if (branchId && product.branchId && product.branchId !== branchId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke produk ini" },
        { status: 403 },
      )
    }

    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 },
    )
  }
}
