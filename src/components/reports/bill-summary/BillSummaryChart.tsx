'use client'

import { memo } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { TrendingUp } from 'lucide-react'
import type { MonthlyBillData } from './constants'

interface BillSummaryChartProps {
  data: MonthlyBillData[]
}

const chartConfig = {
  amount: {
    label: 'Bill Amount',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

function BillSummaryChartComponent({ data }: BillSummaryChartProps) {
  // Transform data to match chart requirements
  const chartData = data.map(item => ({
    month: item.month,
    amount: item.amount,
    fill: '#3b82f6' // blue-500
  }))

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Bill Summary</h3>
        <p className="text-xs text-muted-foreground">
          Showing bill amounts for the selected period
        </p>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => (value as string).slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${Math.round((value as number) / 1_000_000)}M`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="amount" fill="var(--color-amount)" radius={8} />
        </BarChart>
      </ChartContainer>
      <div className="text-xs flex items-center gap-2 text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        Showing bill amounts for the selected period
      </div>
    </div>
  )
}

export const BillSummaryChart = memo(BillSummaryChartComponent)
