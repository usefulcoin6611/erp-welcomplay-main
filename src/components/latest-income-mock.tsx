"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar } from "lucide-react"

interface Income {
  id: string
  date: string
  source: string
  category: string
  amount: number
  status: 'received' | 'pending'
  description: string
}

const mockIncomes: Income[] = [
  {
    id: "1",
    date: "2024-01-15",
    source: "PT. ABC Corporation",
    category: "Penjualan",
    amount: 15000000,
    status: 'received',
    description: "Pembayaran Invoice #INV-001"
  },
  {
    id: "2",
    date: "2024-01-14",
    source: "CV. XYZ Trading",
    category: "Jasa",
    amount: 8500000,
    status: 'received',
    description: "Konsultasi Proyek Q1"
  },
  {
    id: "3",
    date: "2024-01-13",
    source: "Toko Makmur",
    category: "Penjualan",
    amount: 5200000,
    status: 'pending',
    description: "Penjualan Produk A"
  },
  {
    id: "4",
    date: "2024-01-12",
    source: "PT. Digital Solutions",
    category: "Jasa",
    amount: 12000000,
    status: 'received',
    description: "Maintenance Sistem"
  },
]

export function LatestIncomeMock() {
  const totalIncome = mockIncomes.reduce((sum, income) => sum + income.amount, 0)

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
          <CardTitle className="text-lg font-semibold">Pendapatan Terbaru</CardTitle>
          <TrendingUp className="h-5 w-5 text-green-500" />
        </div>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">Total Pendapatan</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockIncomes.map((income) => (
            <div
              key={income.id}
              className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{income.source}</p>
                  <Badge
                    variant={income.status === 'received' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {income.status === 'received' ? 'Diterima' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{income.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(income.date)}</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    {income.category}
                  </Badge>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-green-600">{formatCurrency(income.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
