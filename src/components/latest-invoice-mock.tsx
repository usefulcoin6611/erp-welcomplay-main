"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Clock } from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  customer: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  items: number
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    dueDate: "2024-02-15",
    customer: "PT. ABC Corporation",
    amount: 25000000,
    status: 'paid',
    items: 3
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    date: "2024-01-14",
    dueDate: "2024-02-14",
    customer: "CV. XYZ Trading",
    amount: 18500000,
    status: 'pending',
    items: 5
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    date: "2024-01-13",
    dueDate: "2024-01-20",
    customer: "Toko Makmur Jaya",
    amount: 12000000,
    status: 'overdue',
    items: 2
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    date: "2024-01-12",
    dueDate: "2024-02-12",
    customer: "PT. Digital Solutions",
    amount: 32000000,
    status: 'pending',
    items: 4
  },
]

export function LatestInvoiceMock() {
  const totalInvoice = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingCount = mockInvoices.filter(inv => inv.status === 'pending').length
  const overdueCount = mockInvoices.filter(inv => inv.status === 'overdue').length

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

  const getStatusBadge = (status: Invoice['status']) => {
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
          <CardTitle className="text-lg font-semibold">Faktur Terbaru</CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Faktur</p>
            <p className="text-lg font-bold">{formatCurrency(totalInvoice)}</p>
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
          {mockInvoices.map((invoice) => {
            const statusInfo = getStatusBadge(invoice.status)
            return (
              <div
                key={invoice.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <Badge
                      variant={statusInfo.variant}
                      className={`text-xs ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {invoice.customer}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(invoice.date)}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Jatuh tempo: {formatDate(invoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-lg">{formatCurrency(invoice.amount)}</p>
                  <p className="text-xs text-muted-foreground">{invoice.items} item</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
