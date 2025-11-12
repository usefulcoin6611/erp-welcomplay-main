'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'
import { Target, TrendingUp } from 'lucide-react'

interface Goal {
  id: number
  name: string
  type: 'bill' | 'invoice' | 'payment' | 'revenue'
  duration: {
    start: string
    end: string
  }
  current: number
  target: number
  progress: number
}

const mockGoals: Goal[] = [
  {
    id: 1,
    name: 'Q4 Revenue Target',
    type: 'revenue',
    duration: { start: '01 Oct, 2025', end: '31 Dec, 2025' },
    current: 750000000,
    target: 1000000000,
    progress: 75,
  },
  {
    id: 2,
    name: 'Invoice Collection Goal',
    type: 'invoice',
    duration: { start: '01 Nov, 2025', end: '30 Nov, 2025' },
    current: 320000000,
    target: 400000000,
    progress: 80,
  },
  {
    id: 3,
    name: 'Bill Payment Target',
    type: 'bill',
    duration: { start: '01 Nov, 2025', end: '15 Nov, 2025' },
    current: 180000000,
    target: 250000000,
    progress: 72,
  },
]

export function GoalSection() {
  const t = useTranslations('accountDashboard.goal')

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getTypeColor = (type: string) => {
    const colors = {
      revenue: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      invoice: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
      bill: 'bg-pink-100 text-pink-700 hover:bg-pink-100',
      payment: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
    }
    return colors[type as keyof typeof colors] || colors.revenue
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-blue-500'
    if (progress >= 50) return 'bg-blue-400'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="py-2">
      <CardHeader className="px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-purple-100">
            <Target className="w-[18px] h-[18px] text-purple-600" />
          </div>
          <CardTitle className="text-sm">{t('title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-3 py-2">
        <div className="space-y-4">
          {mockGoals.map((goal, index) => (
            <div key={goal.id}>
              {index > 0 && <div className="border-t -mx-3 mb-4"></div>}
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{goal.name}</h4>
                      <Badge variant="secondary" className={getTypeColor(goal.type)}>
                        {t(`types.${goal.type}`)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {goal.duration.start} - {goal.duration.end}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold">{goal.progress}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getProgressColor(goal.progress)}`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t('current')}: <span className="font-semibold text-foreground">{formatRupiah(goal.current)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {t('target')}: <span className="font-semibold text-foreground">{formatRupiah(goal.target)}</span>
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-md px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('achieved')}</p>
                    <p className="text-xs font-semibold">{formatRupiah(goal.current)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('remaining')}</p>
                    <p className="text-xs font-semibold">{formatRupiah(goal.target - goal.current)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-md px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{t('target')}</p>
                    <p className="text-xs font-semibold">{formatRupiah(goal.target)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
