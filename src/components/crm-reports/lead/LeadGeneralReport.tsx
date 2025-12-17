'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import dynamic from 'next/dynamic'

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full" />
})

export function LeadGeneralReport() {
  const [selectedMonth, setSelectedMonth] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value)
    // Here you would typically fetch new data based on selected month
  }

  // This Week Leads Conversions Chart
  const weeklyChartOptions: any = {
    chart: {
      type: 'line',
      height: 280,
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      }
    },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    xaxis: {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    colors: ['#3b82f6'],
    dataLabels: { enabled: false },
    grid: { strokeDashArray: 4 },
    legend: { show: false }
  }

  const weeklyChartSeries = [{
    name: 'Leads',
    data: [12, 19, 15, 25, 22, 18, 24]
  }]

  // Sources Conversion Chart
  const sourcesChartOptions: any = {
    chart: {
      type: 'donut',
      height: 280
    },
    labels: ['Website', 'Referral', 'Social Media', 'Email', 'Event', 'Direct'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true
    }
  }

  const sourcesChartSeries = [35, 25, 20, 10, 6, 4]

  // Monthly Chart
  const monthlyChartOptions: any = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '50%',
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    },
    colors: ['#6fd944'],
    fill: { opacity: 1 },
    grid: { strokeDashArray: 4 }
  }

  const monthlyChartSeries = [{
    name: 'Leads',
    data: [44, 55, 57, 56]
  }]

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ]

  return (
    <div className="space-y-6">
      {/* This Week Leads Conversions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">This Week Leads Conversions</h3>
          <p className="text-sm text-muted-foreground">Lead acquisition trends for the current week</p>
        </CardHeader>
        <CardContent className="pt-4">
          {mounted && (
            <Chart
              options={weeklyChartOptions}
              series={weeklyChartSeries}
              type="line"
              height={320}
            />
          )}
        </CardContent>
      </Card>

      {/* Sources Conversion */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold tracking-tight">Sources Conversion</h3>
          <p className="text-sm text-muted-foreground">Lead distribution by acquisition source</p>
        </CardHeader>
        <CardContent className="pt-4">
          {mounted && (
            <Chart
              options={sourcesChartOptions}
              series={sourcesChartSeries}
              type="donut"
              height={320}
            />
          )}
        </CardContent>
      </Card>

      {/* Monthly */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Monthly Performance</h3>
              <p className="text-sm text-muted-foreground">Weekly breakdown of lead generation</p>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {mounted && (
            <Chart
              options={monthlyChartOptions}
              series={monthlyChartSeries}
              type="bar"
              height={320}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
