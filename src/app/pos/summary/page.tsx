'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, X, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimplePagination } from '@/components/ui/simple-pagination'

type PosOrder = {
  id: string
  posId: string
  customerName: string
  warehouseName: string
  total: number
  discount: number
  subtotal: number
  status: string
  createdAt: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

/**
 * POS Summary: list transaksi POS.
 * Data diambil dari API /api/pos/orders.
 * Pagination mengikuti pola /pos/quotation (client-side filtering + SimplePagination).
 */
export default function POSSummaryPage() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [orders, setOrders] = useState<PosOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all orders (large limit) for client-side filtering + pagination
      const res = await fetch('/api/pos/orders?limit=500')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Client-side filtering (same pattern as /pos/quotation)
  const filteredData = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.trim().toLowerCase()
    return orders.filter(
      (r) =>
        r.posId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.warehouseName ?? '').toLowerCase().includes(q)
    )
  }, [search, orders])

  // Client-side pagination (same pattern as /pos/quotation)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  return (
    <POSPageLayout
      title="POS Summary"
      breadcrumbLabel="POS"
    >
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2">
          <h5 className="text-base font-medium">POS List</h5>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search POS..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
              className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
            />
            {search.length > 0 && (
              <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => { setSearch(''); setCurrentPage(1) }}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-normal">POS ID</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Date</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Customer</TableHead>
                  <TableHead className="px-4 py-3 font-normal">Warehouse</TableHead>
                  <TableHead className="px-4 py-3 font-normal text-right">Amount</TableHead>
                  <TableHead className="px-4 py-3 font-normal w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                      No Data Found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-4 py-3 text-sm font-medium">{row.posId}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{formatDate(row.createdAt)}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{row.customerName}</TableCell>
                      <TableCell className="px-4 py-3 text-sm">{row.warehouseName || '-'}</TableCell>
                      <TableCell className="px-4 py-3 text-sm text-right font-medium">{formatPrice(row.total)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                          asChild
                        >
                          <Link href={`/pos/summary/${row.posId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination - same pattern as /pos/quotation */}
          {filteredData.length > 0 && (
            <div className="px-4 py-3 border-t">
              <SimplePagination
                totalCount={filteredData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </POSPageLayout>
  )
}
