"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useTranslations } from "next-intl"

// Sample data - last 10 days
const generateChartData = () => {
  const days = []
  const today = new Date(2025, 9, 31) // October 31, 2025
  
  for (let i = 9; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Generate values between 100-300
    const purchaseValue = Math.floor(Math.random() * 180) + 80
    const posValue = purchaseValue + Math.floor(Math.random() * 60) + 20
    
    days.push({
      date: dateStr,
      Purchase: purchaseValue,
      POS: posValue,
    })
  }
  
  return days
}

export function POSVsPurchaseChart() {
  const t = useTranslations('posDashboard.chart')
  const data = generateChartData()

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t('title')}</CardTitle>
          <p className="text-sm font-medium text-muted-foreground">{t('subtitle')}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart 
            data={data} 
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
