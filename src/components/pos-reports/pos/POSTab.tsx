"use client"

import { useState, useEffect, useCallback } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RotateCcw, FileText, Warehouse as WarehouseIcon, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { REPORT_CARD_CLASS } from "../shared-styles"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const posChartConfig = {
  amount: {
    label: "Amount",
    color: "#6fd944",
  },
} satisfies ChartConfig

type Warehouse = { id: string; name: string }
type Customer = { id: string; name: string }
type ChartDataPoint = { date: string; amount: number }

type ReportTabContentProps = {
  period: "daily" | "monthly"
  onPeriodChange: (v: "daily" | "monthly") => void
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
  chartData: ChartDataPoint[]
  mounted: boolean
  loading: boolean
}

function ReportTabContent({
  period,
  onPeriodChange,
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
  chartData,
  mounted,
  loading,
}: ReportTabContentProps) {
  return (
    <div className="space-y-6 mt-6">
      <Card className={REPORT_CARD_CLASS}>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <div className="space-y-2 min-w-[140px]">
              <Label htmlFor="period">Period</Label>
              <Select value={period} onValueChange={(v) => onPeriodChange(v as "daily" | "monthly")}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isMonthly ? (
              <>
                <div className="space-y-2 min-w-[140px]">
                  <Label htmlFor="startMonth">Start Month</Label>
                  <Input id="startMonth" type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="h-10 w-full" />
                </div>
                <div className="space-y-2 min-w-[140px]">
                  <Label htmlFor="endMonth">End Month</Label>
                  <Input id="endMonth" type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="h-10 w-full" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2 min-w-[140px]">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 w-full" />
                </div>
                <div className="space-y-2 min-w-[140px]">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 w-full" />
                </div>
              </>
            )}
            <div className="space-y-2 min-w-[140px]">
              <Label htmlFor="warehouse">Warehouse</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="h-10 w-full">
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
            <div className="space-y-2 min-w-[140px]">
              <Label htmlFor="customer">Customer</Label>
              <Select value={customer} onValueChange={setCustomer}>
                <SelectTrigger className="h-10 w-full">
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
            <div className="ml-auto flex gap-2 shrink-0">
              <Button onClick={onApply} disabled={loading} className="h-10 min-w-[90px] shadow-none bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4 mr-2" />Apply</>}
              </Button>
              <Button onClick={onReset} variant="outline" className="h-10 shrink-0 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900">
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
            <ChartContainer config={posChartConfig} className="h-[320px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="posFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6fd944" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6fd944" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => (String(v).length > 4 ? String(v).slice(0, 3) : v)} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `Rp ${Number(v).toLocaleString("id-ID", { minimumFractionDigits: 0 })}`} />} />
                <Area type="monotone" dataKey="amount" stroke="#6fd944" strokeWidth={2} fill="url(#posFill)" />
              </AreaChart>
            </ChartContainer>
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
  const [activeSubTab, setActiveSubTab] = useState<"daily" | "monthly">("daily")
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

  const handlePeriodChange = (v: "daily" | "monthly") => {
    setActiveSubTab(v)
    fetchReportData(v)
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <ReportTabContent
        period={activeSubTab}
        onPeriodChange={handlePeriodChange}
        isMonthly={activeSubTab === "monthly"}
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
        reportTitle={activeSubTab === "daily" ? "Daily POS Report" : "Monthly POS Report"}
        chartTitle={activeSubTab === "daily" ? "Daily POS" : "Monthly POS"}
        chartDescription={activeSubTab === "daily" ? "Sales trends over the selected date range" : "Sales trends across selected months"}
        chartData={activeSubTab === "daily" ? (dailyChartData.length > 0 ? dailyChartData : []) : (monthlyChartData.length > 0 ? monthlyChartData : [])}
        mounted={mounted}
        loading={loading}
      />
    </div>
  )
}
