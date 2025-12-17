"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Loader2, Search, RotateCcw, FileText, Warehouse as WarehouseIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

export function POSTab() {
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("daily")
  
  // Filters
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [warehouse, setWarehouse] = useState("all")
  const [customer, setCustomer] = useState("all")

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
    // Apply filters
    console.log({ startDate, endDate, warehouse, customer })
  }

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    setWarehouse("all")
    setCustomer("all")
  }

  // Mock data for daily
  const generateDailyData = () => {
    const days = []
    for (let i = 0; i < 30; i++) {
      days.push(Math.floor(Math.random() * 400) + 150)
    }
    return days
  }

  const dailyChartOptions = {
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
    colors: ['#6fd944'],
    xaxis: {
      categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      title: { text: 'Days' }
    },
    yaxis: {
      title: { text: 'Amount' }
    },
    grid: { strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (value: number) => `Rp ${value.toLocaleString('id-ID')}`
      }
    }
  }

  const dailyChartSeries = [
    {
      name: 'POS',
      data: generateDailyData()
    }
  ]

  // Mock data for monthly
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyData = months.map(() => Math.floor(Math.random() * 6000) + 3000)

  const monthlyChartOptions = {
    ...dailyChartOptions,
    xaxis: {
      categories: months,
      title: { text: 'Months' }
    }
  }

  const monthlyChartSeries = [
    {
      name: 'POS',
      data: monthlyData
    }
  ]

  const warehouses = [
    { value: 'all', label: 'All Warehouse' },
    { value: 'jakarta', label: 'Jakarta' },
    { value: 'bandung', label: 'Bandung' },
    { value: 'surabaya', label: 'Surabaya' }
  ]

  const customers = [
    { value: 'all', label: 'All Customer' },
    { value: 'customer1', label: 'PT. Global Tech' },
    { value: 'customer2', label: 'CV. Prima Sejahtera' },
    { value: 'customer3', label: 'UD. Mitra Usaha' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">POS Report</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Daily and monthly sales analysis with customer tracking
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

      {/* Daily/Monthly Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6 mt-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select value={warehouse} onValueChange={setWarehouse}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.value} value={wh.value}>
                          {wh.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={customer} onValueChange={setCustomer}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
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
            <Card className="">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Report</p>
                    <h3 className="text-lg font-semibold mt-1">Daily POS Report</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            {warehouse !== 'all' && (
              <Card className="">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                      <WarehouseIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                      <h3 className="text-lg font-semibold mt-1">
                        {warehouses.find(w => w.value === warehouse)?.label}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chart */}
          <Card className="">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold tracking-tight">Daily POS</h3>
              <p className="text-sm text-muted-foreground">Sales trends over the last 30 days</p>
            </CardHeader>
            <CardContent className="pt-4">
              {mounted ? (
                <Chart
                  options={dailyChartOptions}
                  series={dailyChartSeries}
                  type="area"
                  height={320}
                />
              ) : (
                <Skeleton className="h-[320px] w-full" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6 mt-6">
          {/* Filters for Monthly */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="startMonth">Start Month</Label>
                  <Input
                    id="startMonth"
                    type="month"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endMonth">End Month</Label>
                  <Input
                    id="endMonth"
                    type="month"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select value={warehouse} onValueChange={setWarehouse}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.value} value={wh.value}>
                          {wh.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={customer} onValueChange={setCustomer}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
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
            <Card className="">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Report</p>
                    <h3 className="text-lg font-semibold mt-1">Monthly POS Report</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            {warehouse !== 'all' && (
              <Card className="">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                      <WarehouseIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                      <h3 className="text-lg font-semibold mt-1">
                        {warehouses.find(w => w.value === warehouse)?.label}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chart */}
          <Card className="">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold tracking-tight">Monthly POS</h3>
              <p className="text-sm text-muted-foreground">Sales trends across 12 months</p>
            </CardHeader>
            <CardContent className="pt-4">
              {mounted ? (
                <Chart
                  options={monthlyChartOptions}
                  series={monthlyChartSeries}
                  type="area"
                  height={320}
                />
              ) : (
                <Skeleton className="h-[320px] w-full" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
