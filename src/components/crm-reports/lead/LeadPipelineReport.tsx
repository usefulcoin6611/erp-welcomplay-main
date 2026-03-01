'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full" />
})

type PipelineData = { categories: string[]; series: { name: string; data: number[] }[] }

export function LeadPipelineReport() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PipelineData | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/reports?type=lead')
      const json = await res.json()
      if (json.success && json.data?.pipeline) setData(json.data.pipeline)
      else setData(null)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchData()
  }, [mounted, fetchData])

  const pipelineChartOptions: Record<string, unknown> = {
    chart: { type: 'bar', height: 280, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    stroke: { width: 1, colors: ['#fff'] },
    xaxis: { categories: data?.categories?.length ? data.categories : ['No stages'] },
    yaxis: { title: { text: undefined } },
    tooltip: { y: { formatter: (val: number) => `${val} leads` } },
    fill: { opacity: 1 },
    colors: ['#3B82F6'],
    legend: { position: 'top', horizontalAlign: 'left', offsetX: 40 }
  }

  const pipelineChartSeries = data?.series?.length ? data.series : [{ name: 'Leads', data: [0] }]

  return (
    <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
      <CardHeader className="px-5 pt-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Pipeline Report</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Lead distribution across pipeline stages</p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {!mounted ? null : loading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <Chart options={pipelineChartOptions} series={pipelineChartSeries} type="bar" height={320} />
        )}
      </CardContent>
    </Card>
  )
}
