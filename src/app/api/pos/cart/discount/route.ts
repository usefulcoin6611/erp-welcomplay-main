import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

type CartItemInput = {
  productId: string
  itemName: string
  quantity: number
  price: number
  discount?: number
  taxRate?: number
}

/**
 * POST /api/pos/cart/discount
 * Calculate cart total with discount applied.
 * Mirrors reference-erp cartdiscount endpoint.
 *
 * Body: { items: CartItemInput[], discount: number }
 * Returns: { subtotal, discount, total, formattedTotal }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 })

    const items: CartItemInput[] = Array.isArray(body.items) ? body.items : []
    const discount = typeof body.discount === "number" ? Math.max(0, body.discount) : 0

    let subtotal = 0
    const calculatedItems = items.map((item) => {
      const qty = Math.max(0, Number(item.quantity) || 0)
      const price = Math.max(0, Number(item.price) || 0)
      const itemDiscount = Math.max(0, Number(item.discount) || 0)
      const taxRate = Math.max(0, Number(item.taxRate) || 0)
      const itemSubtotal = qty * price * (1 - itemDiscount / 100) * (1 + taxRate / 100)
      subtotal += itemSubtotal
      return {
        ...item,
        subtotal: Math.round(itemSubtotal * 100) / 100,
      }
    })

    const total = Math.max(0, subtotal - discount)

    return NextResponse.json({
      success: true,
      data: {
        items: calculatedItems,
        subtotal: Math.round(subtotal * 100) / 100,
        discount,
        total: Math.round(total * 100) / 100,
        formattedTotal: new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(total),
      },
    })
  } catch (error) {
    console.error("Error calculating cart discount:", error)
    return NextResponse.json({ success: false, message: "Failed to calculate discount" }, { status: 500 })
  }
}
