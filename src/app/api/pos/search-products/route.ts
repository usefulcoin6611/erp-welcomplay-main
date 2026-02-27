import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/pos/search-products
 * Search products for POS interface.
 *
 * Query params:
 *   - search: string (search by name)
 *   - sku: string (search by SKU / barcode scanner)
 *   - cat_id: string (filter by category id)
 *   - war_id: string (filter by warehouse id - currently not used for stock filtering, reserved for future)
 *   - type: "name" | "sku" (search type, default "name")
 *   - limit: number (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = (session.user as any).branchId as string | null
    const url = new URL(request.url)

    const search = url.searchParams.get("search") ?? ""
    const sku = url.searchParams.get("sku") ?? ""
    const catId = url.searchParams.get("cat_id") ?? ""
    const type = url.searchParams.get("type") ?? "name" // "name" or "sku"
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10), 200)

    const where: any = {}
    if (branchId) where.branchId = branchId

    // Category filter
    if (catId && catId !== "0" && catId !== "all") {
      where.categoryId = catId
    }

    // Search filter
    if (type === "sku" && sku) {
      where.sku = { contains: sku, mode: "insensitive" }
    } else if (type === "sku" && search) {
      where.sku = { contains: search, mode: "insensitive" }
    } else if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        tax: { select: { id: true, name: true, rate: true } },
        unit: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
      take: limit,
    })

    type ProductRow = typeof products[number]
    const data = products.map((p: ProductRow) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      salePrice: Number(p.salePrice) || 0,
      purchasePrice: Number(p.purchasePrice) || 0,
      quantity: Number(p.quantity) || 0,
      type: p.type,
      categoryId: p.categoryId ?? null,
      categoryName: p.category?.name ?? "",
      taxRate: Number(p.tax?.rate) || 0,
      taxName: p.tax?.name ?? "",
      unitName: p.unit?.name ?? "",
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error searching products:", error)
    return NextResponse.json({ success: false, message: "Failed to search products" }, { status: 500 })
  }
}
