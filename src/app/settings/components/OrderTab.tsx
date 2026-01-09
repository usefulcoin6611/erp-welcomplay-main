"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface Order {
  id: string
  order_id: string
  name: string
  plan_name: string
  price: number
  status: 'success' | 'Pending' | 'failed' | 'succeeded' | 'Approved'
  payment_type: string
  date: string
  coupon?: string
  receipt?: string
}

const mockOrders: Order[] = [
  {
    id: '1',
    order_id: 'ORD-001',
    name: 'PT Maju Jaya',
    plan_name: 'Gold',
    price: 49,
    status: 'success',
    payment_type: 'STRIPE',
    date: '2024-01-15',
    coupon: 'SUMMER10',
    receipt: 'https://example.com/receipt.pdf',
  },
  {
    id: '2',
    order_id: 'ORD-002',
    name: 'CV Kreatif Digital',
    plan_name: 'Silver',
    price: 99,
    status: 'Pending',
    payment_type: 'Bank Transfer',
    date: '2024-01-16',
    receipt: 'receipt.pdf',
  },
  {
    id: '3',
    order_id: 'ORD-003',
    name: 'PT Teknologi',
    plan_name: 'Platinum',
    price: 199,
    status: 'succeeded',
    payment_type: 'PayPal',
    date: '2024-01-17',
  },
  {
    id: '4',
    order_id: 'ORD-004',
    name: 'PT Maju Bersama',
    plan_name: 'Free Plan',
    price: 0,
    status: 'success',
    payment_type: 'Manually',
    date: '2024-01-18',
  },
  {
    id: '5',
    order_id: 'ORD-005',
    name: 'CV Digital Indonesia',
    plan_name: 'Gold',
    price: 49,
    status: 'Pending',
    payment_type: 'Bank Transfer',
    date: '2024-01-19',
  },
]

const getStatusColor = (status: string) => {
  if (status === 'success' || status === 'succeeded' || status === 'Approved') {
    return 'bg-primary text-white'
  } else if (status === 'Pending') {
    return 'bg-warning text-white'
  } else {
    return 'bg-destructive text-white'
  }
}

const getStatusLabel = (status: string) => {
  if (status === 'succeeded') {
    return 'Success'
  }
  return status
}

export function OrderTab() {
  const [orders] = useState<Order[]>(mockOrders)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return orders

    const q = search.trim().toLowerCase()
    return orders.filter(
      (order) =>
        order.order_id.toLowerCase().includes(q) ||
        order.name.toLowerCase().includes(q) ||
        order.plan_name.toLowerCase().includes(q)
    )
  }, [orders, search])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price)
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage subscription orders and payments
        </p>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Name, or Plan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.order_id}</TableCell>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.plan_name}</TableCell>
                    <TableCell>${formatPrice(order.price)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.payment_type}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell className="text-center">{order.coupon || '-'}</TableCell>
                    <TableCell>
                      {order.receipt ? (
                        order.payment_type === 'Manually' ? (
                          <p className="text-xs text-muted-foreground">
                            Manually plan upgraded by Super Admin
                          </p>
                        ) : order.receipt === 'free coupon' ? (
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

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="mt-4">
            <SimplePagination
              currentPage={currentPage}
              totalCount={filteredData.length}
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
  )
}

