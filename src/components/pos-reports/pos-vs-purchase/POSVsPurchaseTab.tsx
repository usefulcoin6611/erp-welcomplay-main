"use client"

import { useState, useEffect } from "react"
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

export function POSVsPurchaseTab() {
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedYear, setSelectedYear] = useState("2025")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
    }, 2000)
  }

  const handleApply = () => {
    console.log('Apply filters:', { year: selectedYear })
  }

  const handleReset = () => {
    setSelectedYear("2025")
  }

  // Mock data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const posData = months.map(() => Math.floor(Math.random() * 4000) + 3000)
  const purchaseData = months.map((_, i) => Math.floor(posData[i] * 0.6) + Math.floor(Math.random() * 500))
  const profitData = posData.map((pos, i) => pos - purchaseData[i])

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
    stroke: {
      width: 2,
      curve: 'smooth' as const
    },
    colors: ['#ffa21d'],
    xaxis: {
      categories: months,
      title: { text: 'Months' }
    },
    yaxis: {
      title: { text: 'Profit' }
    },
    grid: { strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => `Rp ${value.toLocaleString('id-ID')}`
      }
    }
  }

  const chartSeries = [
    {
      name: 'Profit',
      data: profitData
    }
  ]

  const years = [
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' }
  ]

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">POS VS Purchase Report</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Profitability analysis comparing sales revenue against purchase costs
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download report as PDF</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Filters */}
      <Card>
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
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApply} className="flex-1 h-10">
                <Search className="h-4 w-4 mr-2" />
                Apply
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
        <Card>
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

        <Card>
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
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">Monthly Profit Analysis</h3>
          <p className="text-sm text-muted-foreground">Profit = POS - Purchase</p>
        </CardHeader>
        <CardContent className="pt-4">
          {mounted ? (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={320}
            />
          ) : (
            <Skeleton className="h-[320px] w-full" />
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">Detailed Breakdown</h3>
          <p className="text-sm text-muted-foreground">Monthly comparison of POS, Purchase, and Profit</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Type</TableHead>
                  {months.map((month) => (
                    <TableHead key={month} className="text-center">
                      {month}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">POS</TableCell>
                  {posData.map((value, i) => (
                    <TableCell key={i} className="text-center">
                      {formatCurrency(value)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Purchase</TableCell>
                  {purchaseData.map((value, i) => (
                    <TableCell key={i} className="text-center">
                      {formatCurrency(value)}
                    </TableCell>
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
                      className={`text-center ${value > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {formatCurrency(value)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
