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

  // This Week Leads Conversions – Pie chart (reference-erp)
  const weeklyChartOptions: any = {
    chart: {
      type: 'pie',
      width: 350,
      height: 280,
      toolbar: { show: false }
    },
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    colors: ['#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }]
  }

  const weeklyChartSeries = [12, 19, 15, 25, 22, 18, 24]

  // Sources Conversion – Bar chart (reference-erp)
  const sourcesChartOptions: any = {
    chart: {
      type: 'bar',
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
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%'
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: 'smooth' },
    xaxis: {
      categories: ['Website', 'Referral', 'Social Media', 'Email', 'Event', 'Direct'],
      title: { text: 'Source' }
    },
    colors: ['#3B82F6'],
    grid: { strokeDashArray: 4 },
    legend: { show: false }
  }

  const sourcesChartSeries = [{ name: 'Source', data: [35, 25, 20, 10, 6, 4] }]

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
    colors: ['#3B82F6'],
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
    <div className="space-y-5">
      {/* This Week Leads Conversions */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">This Week Leads Conversions</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Lead acquisition trends for the current week</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {mounted && (
            <Chart
              options={weeklyChartOptions}
              series={weeklyChartSeries}
              type="pie"
              height={320}
            />
          )}
        </CardContent>
      </Card>

      {/* Sources Conversion */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-foreground">Sources Conversion</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Lead distribution by acquisition source</p>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {mounted && (
            <Chart
              options={sourcesChartOptions}
              series={sourcesChartSeries}
              type="bar"
              height={320}
            />
          )}
        </CardContent>
      </Card>

      {/* Monthly */}
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
        <CardHeader className="px-5 pt-5 pb-3 w-full">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground">Monthly Performance</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Weekly breakdown of lead generation</p>
            </div>
            <div className="shrink-0 w-48">
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
        <CardContent className="px-5 pb-5 pt-0">
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
