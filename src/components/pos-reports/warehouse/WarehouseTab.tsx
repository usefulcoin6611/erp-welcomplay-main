"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { REPORT_CARD_CLASS } from "../shared-styles"
import { Warehouse, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type WarehouseData = {
  id: string
  name: string
  isActive: boolean
}

export function WarehouseTab() {
  const [mounted, setMounted] = useState(false)
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

  const totalWarehouse = warehouses.length
  const warehouseNames = warehouses.map((w) => w.name)
  // For chart: show equal distribution as placeholder (no per-warehouse stock tracking yet)
  const productData = warehouses.map(() => Math.round(totalProducts / Math.max(1, warehouses.length)))

  const chartData =
    warehouseNames.length > 0
      ? warehouseNames.map((name, i) => ({ name, products: productData[i] ?? 0 }))
      : [{ name: "No Warehouses", products: 0 }]

  const chartConfig = {
    products: {
      label: "Product Count",
      color: "#6fd944",
    },
  } satisfies ChartConfig

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={REPORT_CARD_CLASS}>
          <CardContent className="p-4 px-6">
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

        <Card className={REPORT_CARD_CLASS}>
          <CardContent className="p-4 px-6">
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

        <Card className={REPORT_CARD_CLASS}>
          <CardContent className="p-4 px-6">
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

      <Card className={REPORT_CARD_CLASS}>
        <CardHeader className="px-6 pb-2">
          <CardTitle className="text-base font-semibold">Product distribution</CardTitle>
          <CardDescription>By warehouse location</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-6">
          {mounted && !loading ? (
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => `${v} products`} />} />
                <Bar dataKey="products" fill="var(--color-products)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
            <Skeleton className="h-[320px] w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
