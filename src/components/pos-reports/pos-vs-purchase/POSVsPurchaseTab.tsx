"use client"

import { useState, useEffect, useCallback } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { REPORT_CARD_CLASS } from "../shared-styles"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, RotateCcw, FileText, Clock, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type MonthlyData = {
  month: string
  pos: number
  purchase: number
  profit: number
}

function formatCurrency(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`
}

export function POSVsPurchaseTab() {
  const [mounted, setMounted] = useState(false)
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [loading, setLoading] = useState(false)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = useCallback(async (year: string) => {
    setLoading(true)
    try {
      const startMonth = `${year}-01`
      const endMonth = `${year}-12`

      const [posRes, purchaseRes] = await Promise.all([
        fetch(`/api/pos/reports?type=monthly&startMonth=${startMonth}&endMonth=${endMonth}`),
        fetch(`/api/pos/reports?report=purchase&type=monthly&startMonth=${startMonth}&endMonth=${endMonth}`),
      ])
      const posData = await posRes.json()
      const purchaseDataJson = await purchaseRes.json()

      const posMonthlyMap: Record<string, number> = {}
      if (posData.success && posData.data?.chartData) {
        posData.data.chartData.forEach((d: { date: string; amount: number }) => {
          const monthKey = d.date.slice(5, 7)
          posMonthlyMap[monthKey] = (posMonthlyMap[monthKey] || 0) + d.amount
        })
      }

      const purchaseMonthlyMap: Record<string, number> = {}
      if (purchaseDataJson.success && purchaseDataJson.data?.chartData) {
        purchaseDataJson.data.chartData.forEach((d: { date: string; amount: number }) => {
          const monthKey = d.date.slice(5, 7)
          purchaseMonthlyMap[monthKey] = (purchaseMonthlyMap[monthKey] || 0) + d.amount
        })
      }

      const data: MonthlyData[] = MONTHS.map((month, idx) => {
        const monthKey = String(idx + 1).padStart(2, "0")
        const pos = posMonthlyMap[monthKey] || 0
        const purchase = purchaseMonthlyMap[monthKey] || 0
        return {
          month,
          pos: Math.round(pos * 100) / 100,
          purchase: Math.round(purchase * 100) / 100,
          profit: Math.round((pos - purchase) * 100) / 100,
        }
      })

      setMonthlyData(data)
    } catch (error) {
      console.error("Error fetching POS vs Purchase data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(selectedYear)
  }, [fetchData, selectedYear])

  const handleApply = () => {
    fetchData(selectedYear)
  }

  const handleReset = () => {
    const currentYear = String(new Date().getFullYear())
    setSelectedYear(currentYear)
  }

  // Generate year options (current year and 4 previous years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

  const chartData = monthlyData
  const posData = monthlyData.map((d) => d.pos)
  const purchaseData = monthlyData.map((d) => d.purchase)
  const profitData = monthlyData.map((d) => d.profit)

  const profitChartConfig = {
    profit: {
      label: "Profit",
      color: "#ffa21d",
    },
  } satisfies ChartConfig

  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className={REPORT_CARD_CLASS}>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <div className="space-y-2 min-w-[140px]">
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex gap-2 shrink-0">
              <Button onClick={handleApply} disabled={loading} className="h-10 min-w-[90px] shadow-none bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Apply</>}
              </Button>
              <Button onClick={handleReset} variant="outline" className="h-10 shrink-0 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={REPORT_CARD_CLASS}>
          <CardContent className="p-4 px-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Report</p>
                <h3 className="text-lg font-semibold mt-1">POS VS Purchase</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={REPORT_CARD_CLASS}>
          <CardContent className="p-4 px-6 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Clock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <h3 className="text-lg font-semibold mt-1">Jan {selectedYear} to Dec {selectedYear}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={REPORT_CARD_CLASS}>
        <CardHeader className="px-6 pb-2">
          <CardTitle className="text-base font-semibold">Monthly Profit Analysis</CardTitle>
          <CardDescription>Profit = POS Revenue - Purchase Cost</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6">
          {mounted && !loading ? (
            <ChartContainer config={profitChartConfig} className="h-[320px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffa21d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ffa21d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `Rp ${Number(v).toLocaleString("id-ID", { minimumFractionDigits: 0 })}`} />} />
                <Area type="monotone" dataKey="profit" stroke="#ffa21d" strokeWidth={2} fill="url(#profitFill)" />
              </AreaChart>
            </ChartContainer>
          ) : (
            <Skeleton className="h-[320px] w-full" />
          )}
        </CardContent>
      </Card>

      <Card className={REPORT_CARD_CLASS}>
        <CardHeader className="px-6 pb-2">
          <CardTitle className="text-base font-semibold">Detailed Breakdown</CardTitle>
          <CardDescription>Monthly comparison of POS, Purchase, and Profit</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6">
          {loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Type</TableHead>
                    {MONTHS.map((month) => (
                      <TableHead key={month} className="text-center min-w-[80px]">{month}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">POS</TableCell>
                    {posData.map((value, i) => (
                      <TableCell key={i} className="text-center text-xs">{formatCurrency(value)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Purchase</TableCell>
                    {purchaseData.map((value, i) => (
                      <TableCell key={i} className="text-center text-xs">{formatCurrency(value)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={13} className="text-sm text-muted-foreground">
                      Profit = POS - Purchase
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell>Profit</TableCell>
                    {profitData.map((value, i) => (
                      <TableCell
                        key={i}
                        className={`text-center text-xs ${value > 0 ? 'text-green-600 dark:text-green-400' : value < 0 ? 'text-red-600 dark:text-red-400' : ''}`}
                      >
                        {formatCurrency(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
