"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Receipt, Calendar, Clock } from "lucide-react"

interface Bill {
  id: string
  billNumber: string
  date: string
  dueDate: string
  vendor: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  items: number
}

const mockBills: Bill[] = [
  {
    id: "1",
    billNumber: "BILL-2024-001",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    vendor: "PT. Supplier Utama",
    amount: 18000000,
    status: 'paid',
    items: 4
  },
  {
    id: "2",
    billNumber: "BILL-2024-002",
    date: "2024-01-14",
    dueDate: "2024-02-14",
    vendor: "CV. Jasa Service",
    amount: 8500000,
    status: 'pending',
    items: 2
  },
  {
    id: "3",
    billNumber: "BILL-2024-003",
    date: "2024-01-10",
    dueDate: "2024-01-25",
    vendor: "Toko Elektronik",
    amount: 25000000,
    status: 'overdue',
    items: 3
  },
  {
    id: "4",
    billNumber: "BILL-2024-004",
    date: "2024-01-12",
    dueDate: "2024-02-12",
    vendor: "PT. Telekomunikasi",
    amount: 5500000,
    status: 'pending',
    items: 1
  },
]

export function LatestBillMock() {
  const totalBill = mockBills.reduce((sum, bill) => sum + bill.amount, 0)
  const pendingCount = mockBills.filter(bill => bill.status === 'pending').length
  const overdueCount = mockBills.filter(bill => bill.status === 'overdue').length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  const getStatusBadge = (status: Bill['status']) => {
    const variants = {
      paid: { variant: 'default' as const, label: 'Dibayar', className: 'bg-green-500' },
      pending: { variant: 'secondary' as const, label: 'Pending', className: '' },
      overdue: { variant: 'destructive' as const, label: 'Terlambat', className: '' },
    }
    return variants[status]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Tagihan Terbaru</CardTitle>
          <Receipt className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Tagihan</p>
            <p className="text-lg font-bold">{formatCurrency(totalBill)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-orange-600">{pendingCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Terlambat</p>
            <p className="text-lg font-bold text-red-600">{overdueCount}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockBills.map((bill) => {
            const statusInfo = getStatusBadge(bill.status)
            return (
              <div
                key={bill.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{bill.billNumber}</p>
                    <Badge
                      variant={statusInfo.variant}
                      className={`text-xs ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {bill.vendor}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(bill.date)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Jatuh tempo: {formatDate(bill.dueDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-lg">{formatCurrency(bill.amount)}</p>
                  <p className="text-xs text-muted-foreground">{bill.items} item</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
