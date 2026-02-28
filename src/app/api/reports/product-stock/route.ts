import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/reports/product-stock
 * 
 * Returns product stock report data from products:
 * - product list with quantity, category, status
 * - summary stats (total, in-stock, low-stock, out-of-stock)
 * 
 * Query params:
 *   categoryId: string (category filter)
 *   status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'all'
 *   search: string
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null
    if (!branchId) {
      return NextResponse.json({ success: false, message: "User has no assigned branch" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""

    // Build where clause
    const where: any = { branchId }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        unit: true,
        tax: true,
      },
      orderBy: { name: "asc" },
    })

    // Low stock threshold: 10 units
    const LOW_STOCK_THRESHOLD = 10

    // Map products to stock report format
    const productStocks = products.map(product => {
      const stockStatus = getStockStatus(product.quantity, LOW_STOCK_THRESHOLD)
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name ?? "Uncategorized",
        categoryId: product.categoryId,
        unit: product.unit?.name ?? "pcs",
        quantity: product.quantity,
        salePrice: product.salePrice,
        purchasePrice: product.purchasePrice,
        type: product.type,
        status: stockStatus,
      }
    })

    // Apply status filter after mapping
    const filteredStocks = status && status !== "all"
      ? productStocks.filter(p => p.status === status)
      : productStocks

    // Summary stats
    const summaryStats = {
      totalProducts: filteredStocks.length,
      inStock: filteredStocks.filter(p => p.status === "in-stock").length,
      lowStock: filteredStocks.filter(p => p.status === "low-stock").length,
      outOfStock: filteredStocks.filter(p => p.status === "out-of-stock").length,
      totalQuantity: filteredStocks.reduce((sum, p) => sum + p.quantity, 0),
    }

    // Categories for filter
    const categories = await prisma.category.findMany({
      where: { branchId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      data: {
        products: filteredStocks,
        summaryStats,
        categories,
      },
    })
  } catch (error) {
    console.error("Error fetching product stock:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch product stock" },
      { status: 500 }
    )
  }
}

function getStockStatus(quantity: number, lowThreshold: number): string {
  if (quantity <= 0) return "out-of-stock"
  if (quantity <= lowThreshold) return "low-stock"
  return "in-stock"
}
