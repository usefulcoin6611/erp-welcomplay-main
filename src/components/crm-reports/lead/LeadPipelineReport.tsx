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

export function LeadPipelineReport() {
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
      categories: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation']
    },
    yaxis: {
      title: {
        text: undefined
      }
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + ' leads'
        }
      }
    },
    fill: {
      opacity: 1
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40
    }
  }

  const pipelineChartSeries = [
    {
      name: 'Won',
      data: [44, 55, 41, 37, 22]
    },
    {
      name: 'Lost',
      data: [13, 23, 20, 8, 13]
    },
    {
      name: 'In Progress',
      data: [11, 17, 15, 15, 21]
    },
    {
      name: 'Pending',
      data: [9, 7, 5, 8, 6]
    }
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold tracking-tight">Pipeline Report</h3>
        <p className="text-sm text-muted-foreground">Lead status distribution across pipeline stages</p>
      </CardHeader>
      <CardContent className="pt-4">
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
