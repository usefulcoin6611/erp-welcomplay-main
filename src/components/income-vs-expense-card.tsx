'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAccountDashboard } from '@/contexts/account-dashboard-context'
import { Skeleton } from '@/components/ui/skeleton'

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', minimumFractionDigits: 0 }).format(n)
}

export function IncomeVsExpenseCard() {
  const t = useTranslations('accountDashboard.incomeVsExpense')
  const { data, loading } = useAccountDashboard()
  const { incomeToday, expenseToday, incomeThisMonth, expenseThisMonth } = data.incomeVsExpense

  if (loading) {
    return (
      <Card className="border-gray-200 dark:border-gray-800 h-full">
        <CardHeader className="pb-0 pt-2 px-3">
          <CardTitle className="text-sm font-semibold">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 px-3 pb-2 pt-1.5">
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
          <Skeleton className="h-8 w-full rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800 h-full">
      <CardHeader className="pb-0 pt-2 px-3">
        <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 px-3 pb-2 pt-1.5">
        <div className="flex items-center justify-between p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-1.5">
            <div className="p-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
              <TrendingUp className="h-2.5 w-2.5 text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('incomeToday')}</span>
          </div>
          <div className="text-xs font-bold text-blue-500 dark:text-blue-400">Rp {formatRp(incomeToday)}</div>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded-full bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-center gap-1.5">
            <div className="p-0.5 bg-orange-100 dark:bg-orange-900/50 rounded">
              <TrendingDown className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('expenseToday')}</span>
          </div>
          <div className="text-xs font-bold text-orange-600 dark:text-orange-400">Rp {formatRp(expenseToday)}</div>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-1.5">
            <div className="p-0.5 bg-blue-100 dark:bg-blue-900/50 rounded">
              <TrendingUp className="h-2.5 w-2.5 text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('incomeThisMonth')}</span>
          </div>
          <div className="text-xs font-bold text-blue-500 dark:text-blue-400">Rp {formatRp(incomeThisMonth)}</div>
        </div>
        <div className="flex items-center justify-between p-1.5 rounded-full bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-center gap-1.5">
            <div className="p-0.5 bg-orange-100 dark:bg-orange-900/50 rounded">
              <TrendingDown className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('expenseThisMonth')}</span>
          </div>
          <div className="text-xs font-bold text-orange-600 dark:text-orange-400">Rp {formatRp(expenseThisMonth)}</div>
        </div>
      </CardContent>
    </Card>
  )
}
