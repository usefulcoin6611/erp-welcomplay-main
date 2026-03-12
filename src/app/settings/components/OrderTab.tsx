"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { Search, FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Skeleton } from '@/components/ui/skeleton'

interface Order {
  id: string
  order_id: string
  name: string
  plan_name: string
  price: number
  status: string
  payment_type: string
  date: string
  coupon?: string
  receipt?: string
  is_refund?: number
}

const getStatusColor = (status: string) => {
  if (status === 'success' || status === 'succeeded' || status === 'Approved') {
    return 'bg-green-100 text-green-700'
  }
  if (status === 'Pending') {
    return 'bg-yellow-100 text-yellow-700'
  }
  return 'bg-red-100 text-red-700'
}

const getStatusLabel = (status: string) => {
  if (status === 'succeeded') return 'Success'
  return status
}

export function OrderTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('page', String(currentPage))
      params.set('pageSize', String(pageSize))
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/settings/subscription-history?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.message ?? 'Failed to load subscription history')
        setOrders([])
        setTotalRecords(0)
        return
      }
      setOrders(Array.isArray(json.data?.orders) ? json.data.orders : [])
      setTotalRecords(Number(json.data?.totalRecords) ?? 0)
    } catch {
      setError('Failed to load subscription history')
      setOrders([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, search])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Debounced search: apply search term after user stops typing
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription History</CardTitle>
        <p className="text-sm text-muted-foreground">
          View your subscription and payment history
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Plan, or Payment type..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 border-0 focus-visible:border-0 focus-visible:ring-0 bg-gray-50 hover:bg-gray-100 shadow-none"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No subscription history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                        <TableCell>
                          <Badge className={getPlanBadgeColors(order.plan_name)}>
                            {order.plan_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(order.price)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.payment_type}</TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell className="text-center">{order.coupon ?? '-'}</TableCell>
                        <TableCell>
                          {order.receipt ? (
                            order.payment_type === 'Manually' ? (
                              <p className="text-xs text-muted-foreground">
                                Manually plan upgraded by Super Admin
                              </p>
                            ) : order.receipt === 'free coupon' || order.receipt.toLowerCase().includes('free') ? (
                              <p className="text-xs text-muted-foreground">
                                Used 100% discount coupon code.
                              </p>
                            ) : (
                              <a
                                href={order.receipt}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 text-sm"
                              >
                                <FileText className="h-4 w-4" /> Receipt
                              </a>
                            )
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalRecords > 0 && (
              <div className="mt-4">
                <SimplePagination
                  currentPage={currentPage}
                  totalCount={totalRecords}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={(size) => {
                    setPageSize(size)
                    setCurrentPage(1)
                  }}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
