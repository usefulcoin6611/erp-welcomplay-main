'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useAccountDashboard } from '@/contexts/account-dashboard-context'
import { Skeleton } from '@/components/ui/skeleton'

export function AccountBalanceTable() {
  const t = useTranslations('accountDashboard.accountBalance')
  const { data, loading } = useAccountDashboard()
  const accounts = data.bankAccounts

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-1 px-3 py-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="pt-0 px-3 py-2">
          <Skeleton className="h-24 w-full rounded-md" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-1 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
              <rect width="20" height="14" x="2" y="5" rx="2"/>
              <line x1="2" x2="22" y1="10" y2="10"/>
            </svg>
          </div>
          <CardTitle className="text-base font-medium">{t('title')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 py-2">
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-7 px-2 text-left align-middle font-medium text-muted-foreground text-[11px]">
                    {t('bank')}
                  </th>
                  <th className="h-7 px-2 text-left align-middle font-medium text-muted-foreground text-[11px]">
                    {t('holderName')}
                  </th>
                  <th className="h-7 px-2 text-right align-middle font-medium text-muted-foreground text-[11px]">
                    {t('balance')}
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="py-2 px-2 align-middle font-medium text-xs">
                      {account.bank}
                    </td>
                    <td className="py-2 px-2 align-middle text-xs text-muted-foreground">
                      {account.holderName}
                    </td>
                    <td className="py-2 px-2 align-middle text-right font-semibold text-xs">
                      {formatCurrency(account.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-right">
          <p className="text-xs text-muted-foreground leading-tight">Total Saldo</p>
          <p className="text-base font-semibold">{formatCurrency(totalBalance)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
