"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Loader2, Search, RotateCcw, FileText, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

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
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [loading, setLoading] = useState(false)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = useCallback(async (year: string) => {
    setLoading(true)
    try {
      // Fetch POS data for the year
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      const posRes = await fetch(`/api/pos/reports?type=monthly&startDate=${startDate}&endDate=${endDate}`)
      const posData = await posRes.json()

      // Build monthly data from POS orders
      const posMonthlyMap: Record<string, number> = {}
      if (posData.success && posData.data?.chartData) {
        posData.data.chartData.forEach((d: { date: string; amount: number }) => {
          const month = d.date.slice(5, 7) // Extract month from YYYY-MM
          posMonthlyMap[month] = (posMonthlyMap[month] || 0) + d.amount
        })
      }

      // Build monthly data array
      const data: MonthlyData[] = MONTHS.map((month, idx) => {
        const monthKey = String(idx + 1).padStart(2, '0')
        const pos = posMonthlyMap[monthKey] || 0
        // Purchase data would come from bills - for now use 0 as placeholder
        const purchase = 0
        return {
          month,
          pos: Math.round(pos * 100) / 100,
          purchase,
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

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => setIsDownloading(false), 2000)
  }

  const handleApply = () => {
    fetchData(selectedYear)
  }

  const handleReset = () => {
    const currentYear = String(new Date().getFullYear())
    setSelectedYear(currentYear)
  }

  const posData = monthlyData.map((d) => d.pos)
  const purchaseData = monthlyData.map((d) => d.purchase)
  const profitData = monthlyData.map((d) => d.profit)

  // Generate year options (current year and 4 previous years)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

  const chartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' as const },
    colors: ['#ffa21d'],
    xaxis: {
      categories: MONTHS,
      title: { text: 'Months' }
    },
    yaxis: {
      title: { text: 'Profit (IDR)' }
    },
    grid: { strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      y: { formatter: (value: number) => `Rp ${value.toLocaleString('id-ID')}` }
    }
  }

  const chartSeries = [{ name: 'Profit', data: profitData.length > 0 ? profitData : [] }]

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">POS VS Purchase Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Profitability analysis comparing sales revenue against purchase costs
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="shadow-none bg-blue-500 hover:bg-blue-600 text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Downloading...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" />Download PDF</>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download report as PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-3"></div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApply} disabled={loading} className="flex-1 h-10 bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Apply</>}
              </Button>
              <Button onClick={handleReset} variant="destructive" className="h-10">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Report</p>
                <h3 className="text-lg font-semibold mt-1">POS VS Purchase</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <h3 className="text-lg font-semibold mt-1">Jan {selectedYear} to Dec {selectedYear}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">Monthly Profit Analysis</h3>
          <p className="text-sm text-muted-foreground">Profit = POS Revenue - Purchase Cost</p>
        </CardHeader>
        <CardContent className="pt-4">
          {mounted && !loading ? (
            <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
          ) : (
            <Skeleton className="h-[320px] w-full" />
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">Detailed Breakdown</h3>
          <p className="text-sm text-muted-foreground">Monthly comparison of POS, Purchase, and Profit</p>
        </CardHeader>
        <CardContent className="pt-4">
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
