"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Loader2, Warehouse, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

type WarehouseData = {
  id: string
  name: string
  isActive: boolean
}

export function WarehouseTab() {
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch("/api/pos/warehouses?active=false").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([warehouseRes, productRes]) => {
        if (warehouseRes.success) setWarehouses(warehouseRes.data)
        if (productRes.success) setTotalProducts(productRes.data.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
    }, 2000)
  }

  const totalWarehouse = warehouses.length
  const warehouseNames = warehouses.map((w) => w.name)
  // For chart: show equal distribution as placeholder (no per-warehouse stock tracking yet)
  const productData = warehouses.map(() => Math.round(totalProducts / Math.max(1, warehouses.length)))

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' as const },
    colors: ['#6fd944'],
    xaxis: {
      categories: warehouseNames.length > 0 ? warehouseNames : ['No Warehouses'],
      title: { text: 'Warehouse' },
    },
    yaxis: { title: { text: 'Product Count' } },
    grid: { strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { y: { formatter: (value: number) => `${value} products` } },
  }

  const chartSeries = [{ name: 'Product', data: productData.length > 0 ? productData : [0] }]

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header with Download */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Warehouse Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Overview of product distribution across warehouse locations
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
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900/50">
                <Warehouse className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Warehouse Report
                </p>
                <h3 className="text-2xl font-bold mt-1">Overview</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <Warehouse className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Warehouse
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold mt-1">{totalWarehouse}</h3>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Product
                </p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <h3 className="text-3xl font-bold mt-1">{totalProducts}</h3>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Warehouse Report</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Product distribution by warehouse location</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {mounted && !loading ? (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={320}
            />
          ) : (
            <Skeleton className="h-[320px] w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
