'use client'

import { memo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface IncomeVsExpenseChartProps {
  data: {
    month: string
    profit: number
  }[]
  period: string
}

const chartConfig = {
  profit: {
    label: 'Profit',
    color: '#ffa21d',
  },
}

function IncomeVsExpenseChartComponent({ data, period }: IncomeVsExpenseChartProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Profit Trend</CardTitle>
        <CardDescription>
          {period === 'monthly' && 'Monthly profit comparison for the selected year'}
          {period === 'quarterly' && 'Quarterly profit comparison for the selected year'}
          {period === 'half-yearly' && 'Half-yearly profit comparison for the selected year'}
          {period === 'yearly' && 'Yearly profit comparison'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffa21d" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FF3A6E" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#ffa21d"
              strokeWidth={2}
              fill="url(#profitGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export const IncomeVsExpenseChart = memo(IncomeVsExpenseChartComponent)
