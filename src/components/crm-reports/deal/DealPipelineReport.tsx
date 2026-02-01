'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full" />
})

export function DealPipelineReport() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const pipelineChartOptions: any = {
    chart: {
      type: 'bar',
      height: 280,
      stacked: true,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closing']
    },
    yaxis: {
      title: {
        text: undefined
      }
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + ' deals'
        }
      }
    },
    fill: {
      opacity: 1
    },
    colors: ['#7BB8A8', '#B89B8B', '#B8A87B', '#A89BB8'],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40
    }
  }

  const pipelineChartSeries = [
    {
      name: 'Won',
      data: [32, 40, 35, 38, 28]
    },
    {
      name: 'Lost',
      data: [10, 15, 18, 12, 14]
    },
    {
      name: 'In Progress',
      data: [15, 18, 20, 16, 22]
    },
    {
      name: 'Pending',
      data: [8, 10, 7, 9, 6]
    }
  ]

  return (
    <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
      <CardHeader className="px-5 pt-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Pipeline Report</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Deal status distribution across pipeline stages</p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {mounted && (
          <Chart
            options={pipelineChartOptions}
            series={pipelineChartSeries}
            type="bar"
            height={320}
          />
        )}
      </CardContent>
    </Card>
  )
}
