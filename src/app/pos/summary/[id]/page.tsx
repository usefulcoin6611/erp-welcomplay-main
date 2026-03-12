'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Printer } from 'lucide-react'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type PosOrderItem = {
  id: string
  productId: string | null
  itemName: string
  sku: string
  quantity: number
  price: number
  discount: number
  taxRate: number
  subtotal: number
}

type PosOrder = {
  id: string
  posId: string
  customerId: string | null
  customerName: string
  warehouseId: string | null
  warehouseName: string
  branchId: string | null
  discount: number
  subtotal: number
  total: number
  status: string
  quotationId: string | null
  createdAt: string
  updatedAt: string
  items: PosOrderItem[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default function POSOrderDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [order, setOrder] = useState<PosOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/pos/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data)
        } else {
          setError(data.message ?? 'Order not found')
        }
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  return (
    <POSPageLayout
      title="POS Detail"
      breadcrumbLabel="POS Detail"
      actionButton={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="shadow-none h-7" asChild>
            <Link href="/pos/summary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          {order && (
            <Button size="sm" variant="blue" className="shadow-none h-7" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
          <CardContent className="py-16 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : order ? (
        <div className="space-y-4 print:space-y-2">
          {/* Order Info */}
          <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{order.posId}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  order.status === 'completed'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Customer</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Warehouse</span>
                    <span className="font-medium">{order.warehouseName || '-'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Subtotal</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Discount</span>
                    <span className="font-medium">{formatPrice(order.discount)}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Total</span>
                    <span className="font-bold text-blue-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
            <div className="px-4 py-3 border-b">
              <h5 className="text-base font-medium">Order Items</h5>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3 font-normal">#</TableHead>
                      <TableHead className="px-4 py-3 font-normal">Item</TableHead>
                      <TableHead className="px-4 py-3 font-normal">SKU</TableHead>
                      <TableHead className="px-4 py-3 font-normal text-right">Qty</TableHead>
                      <TableHead className="px-4 py-3 font-normal text-right">Price</TableHead>
                      <TableHead className="px-4 py-3 font-normal text-right">Discount</TableHead>
                      <TableHead className="px-4 py-3 font-normal text-right">Tax</TableHead>
                      <TableHead className="px-4 py-3 font-normal text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground text-sm">
                          No items
                        </TableCell>
                      </TableRow>
                    ) : (
                      order.items.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell className="px-4 py-3 text-sm text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="px-4 py-3 text-sm font-medium">{item.itemName}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-muted-foreground">{item.sku || '-'}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-right">{item.quantity}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-right">{formatPrice(item.price)}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-right">{item.discount > 0 ? `${item.discount}%` : '-'}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-right">{item.taxRate > 0 ? `${item.taxRate}%` : '-'}</TableCell>
                          <TableCell className="px-4 py-3 text-sm text-right font-medium">{formatPrice(item.subtotal)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="px-4 py-4 border-t">
                <div className="flex flex-col items-end gap-1 text-sm">
                  <div className="flex gap-8">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium w-32 text-right">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex gap-8">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium w-32 text-right">- {formatPrice(order.discount)}</span>
                  </div>
                  <div className="flex gap-8 border-t pt-1 mt-1">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-blue-600 w-32 text-right">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </POSPageLayout>
  )
}
