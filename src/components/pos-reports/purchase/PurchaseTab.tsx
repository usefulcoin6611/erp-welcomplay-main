"use client"

import { useState, useEffect, useCallback } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RotateCcw, FileText, Warehouse as WarehouseIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { REPORT_CARD_CLASS } from "../shared-styles"

type Warehouse = { id: string; name: string }
type Vendor = { id: string; name: string }

function getDefaultDateRange() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const firstDay = `${y}-${m}-01`
  const today = `${y}-${m}-${d}`
  return { startDate: firstDay, endDate: today, startMonth: `${y}-${m}`, endMonth: `${y}-${m}` }
}

const purchaseChartConfig = {
  amount: {
    label: "Amount",
    color: "#6fd944",
  },
} satisfies ChartConfig

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
  vendor: string
  warehouses: Warehouse[]
  vendors: Vendor[]
  setStartDate: (v: string) => void
  setEndDate: (v: string) => void
  setStartMonth: (v: string) => void
  setEndMonth: (v: string) => void
  setWarehouse: (v: string) => void
  setVendor: (v: string) => void
  onApply: () => void
  onReset: () => void
  reportTitle: string
  chartTitle: string
  chartDescription: string
  chartData: ChartDataPoint[]
  mounted: boolean
  loading?: boolean
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
  vendor,
  warehouses,
  vendors,
  setStartDate,
  setEndDate,
  setStartMonth,
  setEndMonth,
  setWarehouse,
  setVendor,
  onApply,
  onReset,
  reportTitle,
  chartTitle,
  chartDescription,
  chartData,
  mounted,
  loading = false,
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
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendor</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex gap-2 shrink-0">
              <Button onClick={onApply} className="h-10 min-w-[90px] shadow-none bg-blue-500 hover:bg-blue-600 text-white">
                <Search className="h-4 w-4 mr-2" />
                Apply
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
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            <ChartContainer config={purchaseChartConfig} className="h-[320px] w-full">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="purchaseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6fd944" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6fd944" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => String(v).length > 4 ? String(v).slice(0, 3) : v} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => `Rp ${Number(v).toLocaleString("id-ID", { minimumFractionDigits: 0 })}`} />} />
                <Area type="monotone" dataKey="amount" stroke="#6fd944" strokeWidth={2} fill="url(#purchaseFill)" />
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

export function PurchaseTab() {
  const defaults = getDefaultDateRange()
  const [mounted, setMounted] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<"daily" | "monthly">("daily")
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate, setEndDate] = useState(defaults.endDate)
  const [startMonth, setStartMonth] = useState(defaults.startMonth)
  const [endMonth, setEndMonth] = useState(defaults.endMonth)
  const [warehouse, setWarehouse] = useState("all")
  const [vendor, setVendor] = useState("all")
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [dailyChartData, setDailyChartData] = useState<ChartDataPoint[]>([])
  const [monthlyChartData, setMonthlyChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    fetch("/api/pos/warehouses")
      .then((r) => r.json())
      .then((res) => { if (res.success) setWarehouses(res.data ?? []) })
      .catch(() => {})

    fetch("/api/vendors")
      .then((r) => r.json())
      .then((res) => { if (res.success) setVendors((res.data ?? []).map((v: { id: string; name: string }) => ({ id: v.id, name: v.name }))) })
      .catch(() => {})
  }, [])

  const fetchReportData = useCallback(async (type: "daily" | "monthly") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ report: "purchase", type })
      if (type === "daily") {
        if (startDate) params.set("startDate", startDate)
        if (endDate) params.set("endDate", endDate)
      } else {
        if (startMonth) params.set("startMonth", startMonth)
        if (endMonth) params.set("endMonth", endMonth)
      }
      if (vendor && vendor !== "all") params.set("vendorId", vendor)
      const res = await fetch(`/api/pos/reports?${params.toString()}`)
      const data = await res.json()
      if (data?.success && data?.data?.chartData) {
        if (type === "daily") setDailyChartData(data.data.chartData)
        else setMonthlyChartData(data.data.chartData)
      }
    } catch (e) {
      console.error("Purchase report fetch error:", e)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, startMonth, endMonth, vendor])

  useEffect(() => {
    fetchReportData("daily")
    fetchReportData("monthly")
  }, [fetchReportData])

  const handleApply = () => {
    fetchReportData(activeSubTab)
  }

  const handlePeriodChange = (v: "daily" | "monthly") => {
    setActiveSubTab(v)
    fetchReportData(v)
  }

  const handleReset = () => {
    const d = getDefaultDateRange()
    setStartDate(d.startDate)
    setEndDate(d.endDate)
    setStartMonth(d.startMonth)
    setEndMonth(d.endMonth)
    setWarehouse("all")
    setVendor("all")
  }

  const chartData = activeSubTab === "daily" ? dailyChartData : monthlyChartData

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
        vendor={vendor}
        warehouses={warehouses}
        vendors={vendors}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setStartMonth={setStartMonth}
        setEndMonth={setEndMonth}
        setWarehouse={setWarehouse}
        setVendor={setVendor}
        onApply={handleApply}
        onReset={handleReset}
        reportTitle={activeSubTab === "daily" ? "Daily Purchase Report" : "Monthly Purchase Report"}
        chartTitle={activeSubTab === "daily" ? "Daily Purchase" : "Monthly Purchase"}
        chartDescription={activeSubTab === "daily" ? "Purchase trends over the selected date range" : "Purchase trends across selected months"}
        chartData={chartData}
        mounted={mounted}
        loading={loading}
      />
    </div>
  )
}
