'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full" />
})

export function DealStaffReport() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [chartData, setChartData] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState({ fromDate: '', toDate: '' })

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateDates = (): boolean => {
    const newErrors = { fromDate: '', toDate: '' }
    let isValid = true

    if (!fromDate) {
      newErrors.fromDate = 'Please select from date'
      isValid = false
    }

    if (!toDate) {
      newErrors.toDate = 'Please select to date'
      isValid = false
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      newErrors.toDate = 'To date must be after from date'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleGenerate = async () => {
    if (!validateDates()) return

    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Simulate generating staff report
    const staffChartOptions: any = {
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
          columnWidth: '60%',
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      xaxis: {
        categories: ['Budi Santoso', 'Dewi Lestari', 'Rina Mulyani', 'Agus Setiawan', 'Sari Wulandari']
      },
      colors: ['#10B981'],
      grid: { strokeDashArray: 4 },
      legend: { show: false }
    }

    const staffChartSeries = [{
      name: 'Deals',
      data: [28, 32, 38, 25, 30]
    }]

    setChartData({
      options: staffChartOptions,
      series: staffChartSeries
    })
    
    setIsGenerating(false)
  }

  return (
    <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
      <CardHeader className="px-5 pt-5 pb-3">
        <h3 className="text-base font-semibold text-foreground">Staff Report</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Performance comparison across sales team members</p>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="fromDate" className="text-sm font-medium">
                From Date <span className="text-red-500">*</span>
              </Label>
              {errors.fromDate && (
                <p id="fromDate-error" className="text-xs text-red-500">
                  {errors.fromDate}
                </p>
              )}
            </div>
            <DatePicker
              id="fromDate"
              value={fromDate}
              onValueChange={(v) => {
                setFromDate(v)
                setErrors(prev => ({ ...prev, fromDate: '' }))
              }}
              placeholder="Pick from date"
              hasError={!!errors.fromDate}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="toDate" className="text-sm font-medium">
                To Date <span className="text-red-500">*</span>
              </Label>
              {errors.toDate && (
                <p id="toDate-error" className="text-xs text-red-500">
                  {errors.toDate}
                </p>
              )}
            </div>
            <DatePicker
              id="toDate"
              value={toDate}
              onValueChange={(v) => {
                setToDate(v)
                setErrors(prev => ({ ...prev, toDate: '' }))
              }}
              placeholder="Pick to date"
              hasError={!!errors.toDate}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium opacity-0 select-none">Action</Label>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full h-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </div>

        {mounted && chartData && (
          <div className="mt-6 pt-6 border-t">
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="bar"
              height={320}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
