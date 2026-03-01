"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

export type POSDashboardChartPoint = {
  date: string
  POS: number
  Purchase: number
}

export function POSVsPurchaseChart({ chartData: chartDataProp }: { chartData?: POSDashboardChartPoint[] | null }) {
  const t = useTranslations('posDashboard.chart')
  const [chartData, setChartData] = useState<POSDashboardChartPoint[]>(chartDataProp ?? [])
  const [loading, setLoading] = useState(!chartDataProp)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (chartDataProp != null) {
      setChartData(chartDataProp)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/pos-dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json?.success && Array.isArray(json?.data?.chartData)) {
          setChartData(json.data.chartData)
        } else {
          setError(json?.message ?? "Failed to load")
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [chartDataProp])

  const formatCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(Number(entry.value))}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <p className="text-sm font-medium text-muted-foreground text-right">{t('subtitle')}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF3A6E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF3A6E" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorPOS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6FD943" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6FD943" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              label={{ 
                value: t('amount'), 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#64748b', fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="Purchase" 
              stroke="#FF3A6E" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPurchase)" 
            />
            <Area 
              type="monotone" 
              dataKey="POS" 
              stroke="#6FD943" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPOS)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Custom Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#FF3A6E]"></div>
            <span className="text-sm text-muted-foreground">{t('purchase')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[#6FD943]"></div>
            <span className="text-sm text-muted-foreground">{t('pos')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
