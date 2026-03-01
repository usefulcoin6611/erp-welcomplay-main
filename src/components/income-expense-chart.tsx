"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useTranslations } from 'next-intl'
import { useAccountDashboard } from '@/contexts/account-dashboard-context'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  income: {
    label: "Income",
    color: "#3b82f6", // Blue-500
  },
  expense: {
    label: "Expense",
    color: "#f97316", // Orange-500
  },
} satisfies ChartConfig

export function IncomeExpenseChart() {
  const t = useTranslations('accountDashboard.incomeExpense')
  const { data, loading } = useAccountDashboard()
  const chartData = data.incomeExpenseChart.length ? data.incomeExpenseChart : [
    { month: "January", income: 0, expense: 0 },
    { month: "February", income: 0, expense: 0 },
    { month: "March", income: 0, expense: 0 },
    { month: "April", income: 0, expense: 0 },
    { month: "May", income: 0, expense: 0 },
    { month: "June", income: 0, expense: 0 },
    { month: "July", income: 0, expense: 0 },
    { month: "August", income: 0, expense: 0 },
    { month: "September", income: 0, expense: 0 },
    { month: "October", income: 0, expense: 0 },
    { month: "November", income: 0, expense: 0 },
    { month: "December", income: 0, expense: 0 },
  ]

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-1 pt-0">
          <Skeleton className="h-[140px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2 px-3 py-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('title')}</CardTitle>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">{t('currentYear')}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-1 pt-0">
        <ChartContainer config={chartConfig} className="h-[140px] w-full -ml-6">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              orientation="left"
              tickFormatter={(value) => {
                if (value >= 1000000000) {
                  return `${(value / 1000000000).toFixed(1)} M`
                }
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(0)} Jt`
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)} Rb`
                }
                return value.toString()
              }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value) => {
                  const numValue = Number(value)
                  return (
                    <span className="font-semibold">
                      Rp {numValue.toLocaleString('id-ID')}
                    </span>
                  )
                }}
              />} 
            />
            <ChartLegend />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
