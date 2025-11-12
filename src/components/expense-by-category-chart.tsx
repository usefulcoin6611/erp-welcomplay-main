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

const chartData = [
  { category: "rentOrLease", amount: 50, fill: "var(--color-rentOrLease)" },
  { category: "travel", amount: 50, fill: "var(--color-travel)" },
]

const chartConfig = {
  amount: {
    label: "Amount",
  },
  rentOrLease: {
    label: "Rent or Lease",
    color: "#f59e0b", // Amber-500
  },
  travel: {
    label: "Travel",
    color: "#ec4899", // Pink-500
  },
} satisfies ChartConfig

export function ExpenseByCategoryChart() {
  const t = useTranslations('accountDashboard.expenseByCategory')
  
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
          {/* Donut Chart - Left side */}
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
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('rentOrLease')}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">50%</span>
              <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-amber-500"></div>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('travel')}</span>
              <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">50%</span>
              <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-pink-500"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
