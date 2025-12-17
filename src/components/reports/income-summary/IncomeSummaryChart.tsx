'use client'

import { memo, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface IncomeSummaryChartProps {
  data: number[]
  labels: string[]
}

function IncomeSummaryChartComponent({ data, labels }: IncomeSummaryChartProps) {
  const chartData = useMemo(() => {
    return labels.map((label, index) => ({
      month: label,
      income: data[index] || 0,
    }))
  }, [data, labels])

  const chartConfig = {
    income: {
      label: 'Income',
      color: '#6fd944',
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6fd944" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6fd944" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          tickFormatter={(value) => {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(0)}M`
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}K`
            }
            return value.toString()
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => {
                return new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value as number)
              }}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#6fd944"
          strokeWidth={2}
          fill="url(#colorIncome)"
          fillOpacity={1}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export const IncomeSummaryChart = memo(IncomeSummaryChartComponent)
