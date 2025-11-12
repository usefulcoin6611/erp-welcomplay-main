'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

export function StorageLimitCard() {
  const t = useTranslations('accountDashboard.storageLimit')
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-sm">{t('title')}</CardTitle>
          <span className="text-xs text-muted-foreground">0MB / 3000MB</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-7">
          {/* Semi-circle gauge chart */}
          <div className="relative w-40 h-20 mb-2">
            <svg width="160" height="80" viewBox="0 0 160 80" className="overflow-visible">
              {/* Background arc (gray) */}
              <path
                d="M 10 70 A 70 70 0 0 1 150 70"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Foreground arc (green) - 50% */}
              <path
                d="M 10 70 A 70 70 0 0 1 80 0"
                fill="none"
                stroke="#22c55e"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <div className="text-2xl font-bold">50%</div>
              <div className="text-xs text-green-500 font-medium">{t('used')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
