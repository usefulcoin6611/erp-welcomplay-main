'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from 'next-intl'
import { useAccountDashboard } from '@/contexts/account-dashboard-context'
import { Skeleton } from '@/components/ui/skeleton'

export function InvoicesStatistics() {
  const t = useTranslations('accountDashboard.recentInvoices')
  const [activeTab, setActiveTab] = useState('weekly')
  const { data, loading } = useAccountDashboard()
  const weeklyData = data.invoiceStats.weekly
  const monthlyData = data.invoiceStats.monthly

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const currentData = activeTab === 'weekly' ? weeklyData : monthlyData

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-8 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-8">
            <TabsTrigger value="weekly" className="text-xs">
              {t('weekly')}
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              {t('monthly')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('statistics.total')}</p>
            <p className="text-xs text-muted-foreground">{t('statistics.totalGenerated')}</p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(currentData.totalGenerated)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('statistics.total')}</p>
            <p className="text-xs text-muted-foreground">{t('statistics.totalPaid')}</p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(currentData.totalPaid)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('statistics.total')}</p>
            <p className="text-xs text-muted-foreground">{t('statistics.totalDue')}</p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(currentData.totalDue)}</div>
        </div>
      </CardContent>
    </Card>
  )
}
