"use client"

import { useState, useMemo, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Trash, CheckCircle, RotateCcw, Search, X, TrendingUp, Clock, RefreshCw, DollarSign } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Types
interface Order {
  id: string
  order_id: string
  user_name: string
  plan_name: string
  price: number
  payment_status: 'success' | 'Approved' | 'succeeded' | 'Pending' | 'failed'
  payment_type: string
  date: string
  coupon?: string
  receipt?: string
  is_refund: number
  userId?: string
  userEmail?: string
  userCurrentPlan?: string
  company_name?: string
}

interface OrderSummary {
  totalRevenue: number
  pendingCount: number
  successCount: number
  refundCount: number
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStatusBadge = (status: string) => {
  if (status === 'success' || status === 'Approved' || status === 'succeeded') {
    return <Badge className="bg-green-100 text-green-700 border-0">Success</Badge>
  } else if (status === 'Pending') {
    return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending</Badge>
  } else {
    return <Badge className="bg-red-100 text-red-700 border-0">Failed</Badge>
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'

  // Data state
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrderSummary>({
    totalRevenue: 0,
    pendingCount: 0,
    successCount: 0,
    refundCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and pagination states
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false)
  const [orderToUpdatePayment, setOrderToUpdatePayment] = useState<string | null>(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [orderToRefund, setOrderToRefund] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`/api/orders?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message || 'Failed to fetch orders')
      }
      const json = await res.json()
      if (json.success && json.data) {
        setOrders(json.data.orders || [])
        setSummary(json.data.summary || { totalRevenue: 0, pendingCount: 0, successCount: 0, refundCount: 0 })
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Client-side filtering (search already done server-side, but keep for instant feedback)
  const filteredData = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.trim().toLowerCase()
    return orders.filter(
      (order) =>
        order.order_id.toLowerCase().includes(q) ||
        order.user_name.toLowerCase().includes(q) ||
        (order.company_name && order.company_name.toLowerCase().includes(q)) ||
        order.plan_name.toLowerCase().includes(q) ||
        order.payment_type.toLowerCase().includes(q) ||
        (order.coupon && order.coupon.toLowerCase().includes(q))
    )
  }, [orders, search])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  // Handlers
  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderToDelete}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to delete order')
      toast.success('Order deleted successfully')
      setOrders(prev => prev.filter(o => o.id !== orderToDelete))
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete order')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePaymentStatusClick = (id: string) => {
    setOrderToUpdatePayment(id)
    setPaymentStatusDialogOpen(true)
  }

  const handleConfirmPaymentStatus = async () => {
    if (!orderToUpdatePayment) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderToUpdatePayment}/approve`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to approve payment')
      toast.success(json.message || 'Payment approved successfully')
      // Update order in state
      setOrders(prev => prev.map(o =>
        o.id === orderToUpdatePayment ? { ...o, payment_status: 'Approved' } : o
      ))
      setPaymentStatusDialogOpen(false)
      setOrderToUpdatePayment(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve payment')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRefundClick = (id: string) => {
    setOrderToRefund(id)
    setRefundDialogOpen(true)
  }

  const handleConfirmRefund = async () => {
    if (!orderToRefund) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderToRefund}/refund`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to process refund')
      toast.success(json.message || 'Refund processed successfully')
      // Update order in state
      setOrders(prev => prev.map(o =>
        o.id === orderToRefund ? { ...o, is_refund: 1 } : o
      ))
      setRefundDialogOpen(false)
      setOrderToRefund(null)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process refund')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    {loading ? (
                      <Skeleton className="h-6 w-24 mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-green-600">{formatPrice(summary.totalRevenue)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Successful Orders</p>
                    {loading ? (
                      <Skeleton className="h-6 w-12 mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-blue-600">{summary.successCount}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Pending Orders</p>
                    {loading ? (
                      <Skeleton className="h-6 w-12 mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-yellow-600">{summary.pendingCount}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none">
                <CardContent className="px-3 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                    <RefreshCw className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Refunded Orders</p>
                    {loading ? (
                      <Skeleton className="h-6 w-12 mt-1" />
                    ) : (
                      <p className="text-lg font-bold text-red-600">{summary.refundCount}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <CardContent className="p-0">
                {/* Title and Search - Top (right aligned) */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Orders</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                    />
                    {search.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => handleSearchChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="p-4 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                )}

                {/* Error State */}
                {!loading && error && (
                  <div className="p-8 text-center text-red-500 text-sm">
                    {error}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-3"
                      onClick={fetchOrders}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Table */}
                {!loading && !error && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Order Id</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Plan Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium">Payment Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium">Coupon</th>
                          <th className="px-4 py-3 text-left text-xs font-medium">Invoice</th>
                          {isSuperAdmin && (
                            <th className="px-4 py-3 text-center text-xs font-medium">Action</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.length > 0 ? (
                          paginatedData.map((order) => (
                            <tr key={order.id} className="border-t hover:bg-muted/50">
                              <td className="px-4 py-3 text-sm font-mono">{order.order_id}</td>
                              <td className="px-4 py-3 text-sm font-medium">{order.company_name}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{order.user_name}</td>
                              <td className="px-4 py-3">
                                <Badge className={getPlanBadgeColors(order.plan_name)}>{order.plan_name}</Badge>
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">
                                {order.price === 0 ? (
                                  <span className="text-green-600">Free</span>
                                ) : (
                                  formatPrice(order.price)
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {getStatusBadge(order.payment_status)}
                                {order.is_refund === 1 && (
                                  <Badge className="ml-1 bg-orange-100 text-orange-700 border-0 text-xs">Refunded</Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">{order.payment_type}</td>
                              <td className="px-4 py-3 text-sm">{formatDate(order.date)}</td>
                              <td className="px-4 py-3 text-sm text-center">
                                {order.coupon ? (
                                  <code className="px-2 py-1 bg-muted rounded text-xs font-mono">{order.coupon}</code>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {order.payment_type === 'Manually' ? (
                                  <p className="text-sm text-muted-foreground">
                                    Manually plan upgraded by Super Admin
                                  </p>
                                ) : order.receipt === 'free coupon' ? (
                                  <p className="text-sm text-muted-foreground">
                                    Used 100% discount coupon code.
                                  </p>
                                ) : order.receipt ? (
                                  <a
                                    href={order.receipt}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <FileText className="h-4 w-4" /> Receipt
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              {isSuperAdmin && (
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 justify-center">
                                    {/* Delete button */}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                      onClick={() => handleDeleteClick(order.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>

                                    {/* Approve Bank Transfer button */}
                                    {order.payment_type === 'Bank Transfer' &&
                                      order.payment_status === 'Pending' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                          onClick={() => handlePaymentStatusClick(order.id)}
                                          title="Approve payment"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      )}

                                    {/* Refund button */}
                                    {(order.payment_status === 'success' || order.payment_status === 'Approved') &&
                                      order.is_refund === 0 &&
                                      order.payment_type !== 'Manually' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                          onClick={() => handleRefundClick(order.id)}
                                          title="Process refund"
                                        >
                                          <RotateCcw className="h-4 w-4" />
                                        </Button>
                                      )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={isSuperAdmin ? 10 : 9}
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              No orders found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalRecords > 0 && (
                  <div className="px-4 py-3 border-t">
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
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this order? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOrderToDelete(null)} disabled={actionLoading}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Payment Status Confirmation Dialog */}
            <AlertDialog open={paymentStatusDialogOpen} onOpenChange={setPaymentStatusDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Payment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve this Bank Transfer payment? This will mark the order as paid and activate the user&apos;s plan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOrderToUpdatePayment(null)} disabled={actionLoading}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmPaymentStatus}
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Approving...' : 'Approve'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Refund Confirmation Dialog */}
            <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refund Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to refund this order? This action cannot be undone and will revert the user&apos;s plan to Free.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOrderToRefund(null)} disabled={actionLoading}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmRefund}
                    className="bg-yellow-500 hover:bg-yellow-600"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Refund'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
