"use client"

import { useState, useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Trash, CheckCircle, RotateCcw, Search, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { SimplePagination } from '@/components/ui/simple-pagination'
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
}

// Mock data - Harga dalam rupiah (sesuai dengan harga plan)
const mockOrders: Order[] = [
  {
    id: '1',
    order_id: 'ORD-001',
    user_name: 'Acme Corporation',
    plan_name: 'Gold',
    price: 750000,
    payment_status: 'success',
    payment_type: 'STRIPE',
    date: '2024-01-15',
    coupon: 'SUMMER50',
    receipt: 'https://example.com/receipt1.pdf',
    is_refund: 0,
  },
  {
    id: '2',
    order_id: 'ORD-002',
    user_name: 'Tech Solutions Inc',
    plan_name: 'Platinum',
    price: 1500000,
    payment_status: 'Pending',
    payment_type: 'Bank Transfer',
    date: '2024-01-14',
    receipt: '/uploads/order/receipt2.pdf',
    is_refund: 0,
  },
  {
    id: '3',
    order_id: 'ORD-003',
    user_name: 'Global Enterprises',
    plan_name: 'Silver',
    price: 250000,
    payment_status: 'Approved',
    payment_type: 'Manually',
    date: '2024-01-13',
    is_refund: 0,
  },
  {
    id: '4',
    order_id: 'ORD-004',
    user_name: 'Startup Company',
    plan_name: 'Gold',
    price: 0,
    payment_status: 'success',
    payment_type: 'STRIPE',
    date: '2024-01-12',
    coupon: 'WELCOME10',
    receipt: 'free coupon',
    is_refund: 0,
  },
]

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
    return <Badge className="bg-green-100 text-green-700">Success</Badge>
  } else if (status === 'Pending') {
    return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
  } else {
    return <Badge className="bg-red-100 text-red-700">Failed</Badge>
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'

  // Search and pagination states
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [paymentStatusDialogOpen, setPaymentStatusDialogOpen] = useState(false)
  const [orderToUpdatePayment, setOrderToUpdatePayment] = useState<string | null>(null)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [orderToRefund, setOrderToRefund] = useState<string | null>(null)

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return mockOrders
    
    const q = search.trim().toLowerCase()
    return mockOrders.filter(
      (order) =>
        order.order_id.toLowerCase().includes(q) ||
        order.user_name.toLowerCase().includes(q) ||
        order.plan_name.toLowerCase().includes(q) ||
        order.payment_type.toLowerCase().includes(q) ||
        (order.coupon && order.coupon.toLowerCase().includes(q))
    )
  }, [search])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Pagination calculations
  const totalRecords = filteredData.length

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      console.log('Delete order:', orderToDelete)
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const handlePaymentStatusClick = (id: string) => {
    setOrderToUpdatePayment(id)
    setPaymentStatusDialogOpen(true)
  }

  const handleConfirmPaymentStatus = () => {
    if (orderToUpdatePayment) {
      console.log('Update payment status for order:', orderToUpdatePayment)
      setPaymentStatusDialogOpen(false)
      setOrderToUpdatePayment(null)
    }
  }

  const handleRefundClick = (id: string) => {
    setOrderToRefund(id)
    setRefundDialogOpen(true)
  }

  const handleConfirmRefund = () => {
    if (orderToRefund) {
      console.log('Refund order:', orderToRefund)
      setRefundDialogOpen(false)
      setOrderToRefund(null)
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-medium">Orders</h1>
                <p className="text-sm text-muted-foreground">
                  Manage subscription orders and payments
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <Card className="shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors"
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
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium">Order Id</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Plan Name</th>
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
                          <td className="px-4 py-3">{order.order_id}</td>
                          <td className="px-4 py-3">{order.user_name}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-blue-100 text-blue-700">{order.plan_name}</Badge>
                          </td>
                          <td className="px-4 py-3">{formatPrice(order.price)}</td>
                          <td className="px-4 py-3">{getStatusBadge(order.payment_status)}</td>
                          <td className="px-4 py-3 text-sm">{order.payment_type}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(order.date)}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            {order.coupon ? (
                              <code className="px-2 py-1 bg-muted rounded text-xs">{order.coupon}</code>
                            ) : (
                              '-'
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
                              '-'
                            )}
                          </td>
                          {isSuperAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  onClick={() => handleDeleteClick(order.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                                {order.payment_type === 'Bank Transfer' &&
                                  order.payment_status === 'Pending' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                      onClick={() => handlePaymentStatusClick(order.id)}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                {order.payment_status === 'success' &&
                                  order.is_refund === 0 &&
                                  order.payment_type !== 'Manually' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                      onClick={() => handleRefundClick(order.id)}
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

                {/* Pagination */}
                {totalRecords > 0 && (
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
                  <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
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
                    Are you sure you want to approve this payment? This will mark the order as paid.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOrderToUpdatePayment(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmPaymentStatus}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Approve
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
                    Are you sure you want to refund this order? This action cannot be undone and will process a refund to the customer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOrderToRefund(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmRefund}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Refund
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

