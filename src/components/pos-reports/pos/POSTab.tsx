"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Loader2, Search, RotateCcw, FileText, Warehouse as WarehouseIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { REPORT_CARD_CLASS, REPORT_TAB_TRIGGER_CLASS } from "../shared-styles"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const baseChartOptions = {
  chart: {
    type: "area" as const,
    toolbar: { show: false },
    dropShadow: { enabled: true, color: "#000", top: 18, left: 7, blur: 10, opacity: 0.2 },
  },
  dataLabels: { enabled: false },
  stroke: { width: 2, curve: "smooth" as const },
  colors: ["#6fd944"],
  grid: { strokeDashArray: 4 },
  legend: { show: false },
  tooltip: { y: { formatter: (v: number) => `Rp ${v.toLocaleString("id-ID")}` } },
}

type Warehouse = { id: string; name: string }
type Customer = { id: string; name: string }
type ChartDataPoint = { date: string; amount: number }

type ReportTabContentProps = {
  isMonthly: boolean
  startDate: string
  endDate: string
  startMonth: string
  endMonth: string
  warehouse: string
  customer: string
  warehouses: Warehouse[]
  customers: Customer[]
  setStartDate: (v: string) => void
  setEndDate: (v: string) => void
  setStartMonth: (v: string) => void
  setEndMonth: (v: string) => void
  setWarehouse: (v: string) => void
  setCustomer: (v: string) => void
  onApply: () => void
  onReset: () => void
  reportTitle: string
  chartTitle: string
  chartDescription: string
  chartOptions: object
  chartSeries: { name: string; data: number[] }[]
  mounted: boolean
  loading: boolean
}

function ReportTabContent({
  isMonthly,
  startDate,
  endDate,
  startMonth,
  endMonth,
  warehouse,
  customer,
  warehouses,
  customers,
  setStartDate,
  setEndDate,
  setStartMonth,
  setEndMonth,
  setWarehouse,
  setCustomer,
  onApply,
  onReset,
  reportTitle,
  chartTitle,
  chartDescription,
  chartOptions,
  chartSeries,
  mounted,
  loading,
}: ReportTabContentProps) {
  return (
    <div className="space-y-6 mt-6">
      <Card className={REPORT_CARD_CLASS}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {isMonthly ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startMonth">Start Month</Label>
                  <Input id="startMonth" type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endMonth">End Month</Label>
                  <Input id="endMonth" type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="h-10" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouse</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
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
                  <SelectItem value="all">All Customer</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={onApply} disabled={loading} className="flex-1 h-10 bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Apply</>}
              </Button>
              <Button onClick={onReset} variant="destructive" className="h-10">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={REPORT_CARD_CLASS}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Report</p>
                <h3 className="text-lg font-semibold mt-1">{reportTitle}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        {warehouse !== "all" && (
          <Card className={REPORT_CARD_CLASS}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                  <WarehouseIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                  <h3 className="text-lg font-semibold mt-1">{warehouses.find((w) => w.id === warehouse)?.name ?? warehouse}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className={REPORT_CARD_CLASS}>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">{chartTitle}</h3>
          <p className="text-sm text-muted-foreground">{chartDescription}</p>
        </CardHeader>
        <CardContent className="pt-4">
          {mounted && !loading ? (
            <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
          ) : (
            <Skeleton className="h-[320px] w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function POSTab() {
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("daily")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startMonth, setStartMonth] = useState("")
  const [endMonth, setEndMonth] = useState("")
  const [warehouse, setWarehouse] = useState("all")
  const [customer, setCustomer] = useState("all")
  const [loading, setLoading] = useState(false)

  // Data from API
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [dailyChartData, setDailyChartData] = useState<ChartDataPoint[]>([])
  const [monthlyChartData, setMonthlyChartData] = useState<ChartDataPoint[]>([])

  useEffect(() => setMounted(true), [])

  // Load warehouses and customers for filters
  useEffect(() => {
    fetch("/api/pos/warehouses")
      .then((r) => r.json())
      .then((res) => { if (res.success) setWarehouses(res.data) })
      .catch(() => {})

    fetch("/api/customers")
      .then((r) => r.json())
      .then((res) => { if (res.success) setCustomers(res.data.map((c: any) => ({ id: c.id, name: c.name }))) })
      .catch(() => {})
  }, [])

  const fetchReportData = useCallback(async (type: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type })
      if (type === "daily") {
        if (startDate) params.set("startDate", startDate)
        if (endDate) params.set("endDate", endDate)
      } else {
        if (startMonth) params.set("startMonth", startMonth)
        if (endMonth) params.set("endMonth", endMonth)
      }
      if (warehouse !== "all") params.set("warehouseId", warehouse)
      if (customer !== "all") params.set("customerId", customer)

      const res = await fetch(`/api/pos/reports?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        if (type === "daily") {
          setDailyChartData(data.data.chartData)
        } else {
          setMonthlyChartData(data.data.chartData)
        }
      }
    } catch (error) {
      console.error("Error fetching POS report:", error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, startMonth, endMonth, warehouse, customer])

  // Load initial data
  useEffect(() => {
    fetchReportData("daily")
    fetchReportData("monthly")
  }, [])

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => setIsDownloading(false), 2000)
  }

  const handleApply = () => {
    fetchReportData(activeSubTab)
  }

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    setStartMonth("")
    setEndMonth("")
    setWarehouse("all")
    setCustomer("all")
  }

  // Build chart data from API response
  const dailyData = dailyChartData.map((d) => d.amount)
  const dailyCategories = dailyChartData.map((d) => d.date)
  const monthlyData = monthlyChartData.map((d) => d.amount)
  const monthlyCategories = monthlyChartData.map((d) => d.date)

  const dailyChartOptions = {
    ...baseChartOptions,
    xaxis: { categories: dailyCategories.length > 0 ? dailyCategories : Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`), title: { text: "Days" } },
    yaxis: { title: { text: "Amount (IDR)" } },
  }
  const monthlyChartOptions = {
    ...baseChartOptions,
    xaxis: { categories: monthlyCategories.length > 0 ? monthlyCategories : MONTHS, title: { text: "Months" } },
    yaxis: { title: { text: "Amount (IDR)" } },
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className={REPORT_CARD_CLASS}>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">POS Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Daily and monthly sales analysis with customer tracking</p>
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
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Downloading...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> Download PDF</>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download report as PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Tabs value={activeSubTab} onValueChange={(v) => { setActiveSubTab(v); fetchReportData(v) }}>
        <TabsList className="grid w-full max-w-md grid-cols-2 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          <TabsTrigger value="daily" className={REPORT_TAB_TRIGGER_CLASS}>Daily</TabsTrigger>
          <TabsTrigger value="monthly" className={REPORT_TAB_TRIGGER_CLASS}>Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <ReportTabContent
            isMonthly={false}
            startDate={startDate}
            endDate={endDate}
            startMonth={startMonth}
            endMonth={endMonth}
            warehouse={warehouse}
            customer={customer}
            warehouses={warehouses}
            customers={customers}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setStartMonth={setStartMonth}
            setEndMonth={setEndMonth}
            setWarehouse={setWarehouse}
            setCustomer={setCustomer}
            onApply={handleApply}
            onReset={handleReset}
            reportTitle="Daily POS Report"
            chartTitle="Daily POS"
            chartDescription="Sales trends over the selected date range"
            chartOptions={dailyChartOptions}
            chartSeries={[{ name: "POS", data: dailyData.length > 0 ? dailyData : [] }]}
            mounted={mounted}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="monthly">
          <ReportTabContent
            isMonthly={true}
            startDate={startDate}
            endDate={endDate}
            startMonth={startMonth}
            endMonth={endMonth}
            warehouse={warehouse}
            customer={customer}
            warehouses={warehouses}
            customers={customers}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setStartMonth={setStartMonth}
            setEndMonth={setEndMonth}
            setWarehouse={setWarehouse}
            setCustomer={setCustomer}
            onApply={handleApply}
            onReset={handleReset}
            reportTitle="Monthly POS Report"
            chartTitle="Monthly POS"
            chartDescription="Sales trends across selected months"
            chartOptions={monthlyChartOptions}
            chartSeries={[{ name: "POS", data: monthlyData.length > 0 ? monthlyData : [] }]}
            mounted={mounted}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
