'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { Pie, PieChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAccountDashboard } from '@/contexts/account-dashboard-context'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  amount: {
    label: "Amount",
  },
  maintenance: {
    label: "Maintenance Sales",
    color: "#3b82f6", // Blue-500 (sama dengan income di bar chart)
  },
  product: {
    label: "Product Sales",
    color: "#f97316", // Orange-500 (sama dengan expense di bar chart)
  },
} satisfies ChartConfig

const defaultIncomeCategory = [
  { category: "maintenance", amount: 70, fill: "var(--color-maintenance)" },
  { category: "product", amount: 30, fill: "var(--color-product)" },
]

export function IncomeByCategoryChart() {
  const t = useTranslations('accountDashboard.incomeByCategory')
  const { data, loading } = useAccountDashboard()
  const chartData = data.incomeByCategory?.length ? data.incomeByCategory : defaultIncomeCategory
  const maintenancePct = chartData.find((d) => d.category === "maintenance")?.amount ?? 0
  const productPct = chartData.find((d) => d.category === "product")?.amount ?? 100

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2 px-3 py-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="px-2 pb-1 pt-0">
          <Skeleton className="w-[180px] h-[180px] rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2 px-3 py-2">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('title')}</CardTitle>
          <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">{t('year')}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-1 pt-0">
        <div className="flex items-center gap-2 py-1">
          <div className="flex-shrink-0 w-[180px] h-[180px]">
            <ChartContainer
              config={chartConfig}
              className="w-full h-full"
            >
              <PieChart width={180} height={180}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel className="whitespace-nowrap" />}
                />
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={85}
                  strokeWidth={0}
                />
              </PieChart>
            </ChartContainer>
          </div>
          
          {/* Legend - Right side */}
          <div className="flex flex-col gap-1.5 ml-auto">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('maintenanceSales')}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{maintenancePct}%</span>
              <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-blue-500"></div>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('productSales')}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{productPct}%</span>
              <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-orange-500"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
