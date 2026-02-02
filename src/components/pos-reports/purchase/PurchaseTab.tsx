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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { REPORT_CARD_CLASS, REPORT_TAB_TRIGGER_CLASS } from "../shared-styles"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const WAREHOUSES = [
  { value: "all", label: "All Warehouse" },
  { value: "jakarta", label: "Jakarta" },
  { value: "bandung", label: "Bandung" },
  { value: "surabaya", label: "Surabaya" },
]

const VENDORS = [
  { value: "all", label: "All Vendor" },
  { value: "vendor1", label: "PT. Maju Jaya" },
  { value: "vendor2", label: "CV. Sumber Makmur" },
  { value: "vendor3", label: "UD. Berkah Sentosa" },
]

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

type ReportTabContentProps = {
  isMonthly: boolean
  startDate: string
  endDate: string
  startMonth: string
  endMonth: string
  warehouse: string
  vendor: string
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
  chartOptions: object
  chartSeries: { name: string; data: number[] }[]
  mounted: boolean
}

function ReportTabContent({
  isMonthly,
  startDate,
  endDate,
  startMonth,
  endMonth,
  warehouse,
  vendor,
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
  chartOptions,
  chartSeries,
  mounted,
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
                  {WAREHOUSES.map((wh) => (
                    <SelectItem key={wh.value} value={wh.value}>{wh.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={vendor} onValueChange={setVendor}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDORS.map((v) => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={onApply} className="flex-1 h-10 bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                <Search className="h-4 w-4 mr-2" />
                Apply
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
                  <h3 className="text-lg font-semibold mt-1">{WAREHOUSES.find((w) => w.value === warehouse)?.label}</h3>
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
          {mounted ? (
            <Chart options={chartOptions} series={chartSeries} type="area" height={320} />
          ) : (
            <Skeleton className="h-[320px] w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function PurchaseTab() {
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("daily")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startMonth, setStartMonth] = useState("")
  const [endMonth, setEndMonth] = useState("")
  const [warehouse, setWarehouse] = useState("all")
  const [vendor, setVendor] = useState("all")

  useEffect(() => setMounted(true), [])

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => setIsDownloading(false), 2000)
  }

  const handleApply = () => {
    console.log({ startDate, endDate, startMonth, endMonth, warehouse, vendor })
  }

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    setStartMonth("")
    setEndMonth("")
    setWarehouse("all")
    setVendor("all")
  }

  const dailyData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 300) + 100)
  const monthlyData = MONTHS.map(() => Math.floor(Math.random() * 5000) + 2000)

  const dailyChartOptions = {
    ...baseChartOptions,
    xaxis: { categories: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`), title: { text: "Days" } },
    yaxis: { title: { text: "Amount" } },
  }
  const monthlyChartOptions = {
    ...baseChartOptions,
    xaxis: { categories: MONTHS, title: { text: "Months" } },
    yaxis: { title: { text: "Amount" } },
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className={REPORT_CARD_CLASS}>
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Purchase Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Daily and monthly purchase analysis with vendor tracking</p>
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

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
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
            vendor={vendor}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setStartMonth={setStartMonth}
            setEndMonth={setEndMonth}
            setWarehouse={setWarehouse}
            setVendor={setVendor}
            onApply={handleApply}
            onReset={handleReset}
            reportTitle="Daily Purchase Report"
            chartTitle="Daily Purchase"
            chartDescription="Purchase trends over the last 30 days"
            chartOptions={dailyChartOptions}
            chartSeries={[{ name: "Purchase", data: dailyData }]}
            mounted={mounted}
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
            vendor={vendor}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setStartMonth={setStartMonth}
            setEndMonth={setEndMonth}
            setWarehouse={setWarehouse}
            setVendor={setVendor}
            onApply={handleApply}
            onReset={handleReset}
            reportTitle="Monthly Purchase Report"
            chartTitle="Monthly Purchase"
            chartDescription="Purchase trends across 12 months"
            chartOptions={monthlyChartOptions}
            chartSeries={[{ name: "Purchase", data: monthlyData }]}
            mounted={mounted}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
