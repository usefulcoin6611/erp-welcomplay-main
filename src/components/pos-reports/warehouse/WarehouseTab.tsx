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

export function WarehouseTab() {
  const [mounted, setMounted] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDownload = () => {
    setIsDownloading(true)
    // Simulate PDF download
    setTimeout(() => {
      setIsDownloading(false)
    }, 2000)
  }

  // Mock data
  const warehouses = ['Jakarta', 'Bandung', 'Surabaya', 'Medan']
  const productData = [150, 90, 160, 80]
  const totalWarehouse = warehouses.length
  const totalProduct = productData.reduce((a, b) => a + b, 0)

  const chartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: {
        show: false
      },
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2,
      curve: 'smooth' as const
    },
    colors: ['#6fd944'],
    xaxis: {
      categories: warehouses,
      title: {
        text: 'Warehouse'
      }
    },
    yaxis: {
      title: {
        text: 'Product Count'
      }
    },
    grid: {
      strokeDashArray: 4
    },
    legend: {
      show: false
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} products`
      }
    }
  }

  const chartSeries = [
    {
      name: 'Product',
      data: productData
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Download */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Warehouse Report</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of product distribution across warehouse locations
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/30 dark:to-background">
          <CardContent className="pt-6">
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

        <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <Warehouse className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Warehouse
                </p>
                <h3 className="text-3xl font-bold mt-1">{totalWarehouse}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/50">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Product
                </p>
                <h3 className="text-3xl font-bold mt-1">{totalProduct}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">Warehouse Report</h3>
          <p className="text-sm text-muted-foreground">Product distribution by warehouse location</p>
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
    </div>
  )
}
