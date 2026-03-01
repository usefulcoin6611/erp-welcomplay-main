'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full" />
})

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

type GeneralData = {
  weeklyLabels: string[]
  weeklySeries: number[]
  sourcesCategories: string[]
  sourcesSeries: number[]
  monthlyCategories: string[]
  monthlySeries: number[]
}

export function DealGeneralReport() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()))
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<GeneralData | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: 'deal', month: selectedMonth, year: selectedYear })
      const res = await fetch(`/api/crm/reports?${params}`)
      const json = await res.json()
      if (json.success && json.data?.general) setData(json.data.general)
      else setData(null)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchData()
  }, [mounted, fetchData])

  const handleMonthChange = (value: string) => setSelectedMonth(value)
  const handleYearChange = (value: string) => setSelectedYear(value)

  const weeklyChartOptions: Record<string, unknown> = {
    chart: { type: 'pie', width: 350, height: 280, toolbar: { show: false } },
    labels: data?.weeklyLabels ?? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    colors: ['#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: true },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }]
  }

  const weeklyChartSeries = data?.weeklySeries ?? [0, 0, 0, 0, 0, 0, 0]

  const sourcesChartOptions: Record<string, unknown> = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false },
      dropShadow: { enabled: true, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2 }
    },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: { categories: data?.sourcesCategories?.length ? data.sourcesCategories : ['No data'], title: { text: 'Pipeline' } },
    colors: ['#10B981'],
    grid: { strokeDashArray: 4 },
    legend: { show: false }
  }

  const sourcesChartSeries = [{ name: 'Deals', data: data?.sourcesSeries?.length ? data.sourcesSeries : [0] }]

  const monthlyChartOptions: Record<string, unknown> = {
    chart: { type: 'bar', height: 280, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: { categories: data?.monthlyCategories ?? ['Week 1', 'Week 2', 'Week 3', 'Week 4'], title: { text: 'Deal Per Month' } },
    colors: ['#10B981'],
    fill: { opacity: 1 },
    grid: { strokeDashArray: 4 }
  }

  const monthlyChartSeries = [{ name: 'Deals', data: data?.monthlySeries ?? [0, 0, 0, 0] }]

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div className="space-y-5">
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">This Week Deals Conversions</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Deal closing trends for the current week</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {!mounted ? null : loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <Chart options={weeklyChartOptions} series={weeklyChartSeries} type="pie" height={320} />
          )}
        </CardContent>
      </Card>

      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Sources Conversion</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Deal distribution by pipeline</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {!mounted ? null : loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <Chart options={sourcesChartOptions} series={sourcesChartSeries} type="bar" height={320} />
          )}
        </CardContent>
      </Card>

      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="px-5 pt-5 pb-3 w-full">
          <div className="flex flex-row items-center justify-between gap-4 w-full flex-wrap">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">Monthly Performance</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Weekly breakdown of deal closures</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="h-9 w-28">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {!mounted ? null : loading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <Chart options={monthlyChartOptions} series={monthlyChartSeries} type="bar" height={320} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
