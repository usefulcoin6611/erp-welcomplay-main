'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const cashflowData = [
  { month: "January", income: 8500000, expense: 6400000 },
  { month: "February", income: 9200000, expense: 6800000 },
  { month: "March", income: 7800000, expense: 7200000 },
  { month: "April", income: 10500000, expense: 5800000 },
  { month: "May", income: 8900000, expense: 6500000 },
  { month: "June", income: 11000000, expense: 7800000 },
]

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

export function CashflowChart() {
  const t = useTranslations('accountDashboard.cashflow')
  
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-1 px-3 py-2">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('title')}</CardTitle>
          <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30">{t('monthly')}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-2 py-1 pt-0">
        <ChartContainer config={chartConfig} className="h-40 w-full -ml-6">
          <LineChart
            accessibilityLayer
            data={cashflowData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel
                className="whitespace-nowrap"
                formatter={(value, name) => {
                  const numValue = Number(value)
                  const color = name === 'income' ? '#3b82f6' : '#ef4444'
                  return (
                    <span style={{ color }}>
                      Rp {numValue.toLocaleString('id-ID')}
                    </span>
                  )
                }}
              />}
            />
            <Line
              dataKey="income"
              type="linear"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expense"
              type="linear"
              stroke="var(--color-expense)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
