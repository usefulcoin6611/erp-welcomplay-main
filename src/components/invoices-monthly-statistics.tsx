'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

export function InvoicesMonthlyStatistics() {
  const t = useTranslations('accountDashboard.recentInvoices')
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{t('monthly')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('statistics.total')}</p>
            <p className="text-xs text-muted-foreground">{t('statistics.totalGenerated')}</p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(225000000)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('statistics.total')}</p>
            <p className="text-xs text-muted-foreground">{t('statistics.totalPaid')}</p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(148000000)}</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('statistics.total')}</p>
            <p className="text-xs text-muted-foreground">{t('statistics.totalDue')}</p>
          </div>
          <div className="text-xl font-bold">{formatCurrency(77000000)}</div>
        </div>
      </CardContent>
    </Card>
  )
}
