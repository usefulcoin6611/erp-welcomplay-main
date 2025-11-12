"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Calendar } from "lucide-react"

interface Expense {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  status: 'paid' | 'pending'
  description: string
}

const mockExpenses: Expense[] = [
  {
    id: "1",
    date: "2024-01-15",
    vendor: "PT. Supplier Utama",
    category: "Pembelian",
    amount: 8500000,
    status: 'paid',
    description: "Pembelian Bahan Baku"
  },
  {
    id: "2",
    date: "2024-01-14",
    vendor: "CV. Jasa Service",
    category: "Operasional",
    amount: 3200000,
    status: 'paid',
    description: "Maintenance Peralatan"
  },
  {
    id: "3",
    date: "2024-01-13",
    vendor: "Toko Elektronik",
    category: "Aset",
    amount: 12000000,
    status: 'pending',
    description: "Pembelian Laptop Kantor"
  },
  {
    id: "4",
    date: "2024-01-12",
    vendor: "PT. PLN",
    category: "Utilitas",
    amount: 2500000,
    status: 'paid',
    description: "Tagihan Listrik Januari"
  },
]

export function LatestExpenseMock() {
  const totalExpense = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0)

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Pengeluaran Terbaru</CardTitle>
          <TrendingDown className="h-5 w-5 text-red-500" />
        </div>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{expense.vendor}</p>
                  <Badge
                    variant={expense.status === 'paid' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {expense.status === 'paid' ? 'Dibayar' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{expense.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(expense.date)}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {expense.category}
                  </Badge>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-red-600">{formatCurrency(expense.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
