'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useAccountDashboard } from '@/contexts/account-dashboard-context'
import { Skeleton } from '@/components/ui/skeleton'

export function StorageLimitCard() {
  const t = useTranslations('accountDashboard.storageLimit')
  const { data, loading } = useAccountDashboard()
  const { usedMB, limitMB } = data.storage

  const hasLimit = limitMB != null && limitMB >= 0
  const percent = hasLimit && limitMB > 0 ? Math.min(100, Math.round((usedMB / limitMB) * 100)) : 0
  const displayLimit = hasLimit ? limitMB : null
  const angle = (1 - percent / 100) * Math.PI
  const arcEndX = 80 + 70 * Math.cos(angle)
  const arcEndY = 70 - 70 * Math.sin(angle)

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full rounded-md" />
        </CardContent>
      </Card>
    )
  }

  if (!hasLimit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4 text-center">{t('notConfigured')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-sm">{t('title')}</CardTitle>
          <span className="text-xs text-muted-foreground">{usedMB}MB / {displayLimit}MB</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-7">
          <div className="relative w-40 h-20 mb-2">
            <svg width="160" height="80" viewBox="0 0 160 80" className="overflow-visible">
              <path
                d="M 10 70 A 70 70 0 0 1 150 70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d={`M 10 70 A 70 70 0 0 1 ${arcEndX} ${arcEndY}`}
                fill="none"
                stroke={percent >= 90 ? '#ef4444' : percent >= 70 ? '#f59e0b' : '#22c55e'}
                strokeWidth="16"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <div className="text-2xl font-bold">{percent}%</div>
              <div className="text-xs text-muted-foreground font-medium">{t('used')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
