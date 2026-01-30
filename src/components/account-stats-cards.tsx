'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, Truck, FileText, Receipt } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StatCard {
  titleKey: string
  value: string
  icon: LucideIcon
  href: string
}

export function AccountStatsCards() {
  const t = useTranslations('accountDashboard.stats')
  
  const stats: StatCard[] = [
    { titleKey: 'totalCustomers', value: '0', icon: Users, href: '/customer' },
    { titleKey: 'totalVendors', value: '0', icon: Truck, href: '/vendor' },
    { titleKey: 'totalInvoices', value: '0', icon: FileText, href: '/invoice' },
    { titleKey: 'totalBills', value: '0', icon: Receipt, href: '/bill' }
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <Card key={stat.titleKey} className="relative overflow-hidden border-0 shadow-none bg-white dark:bg-gray-900/80">
            <CardContent className="relative p-3">
              <div className="flex items-start justify-between">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <IconComponent className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</div>
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <a href={stat.href} className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
                    {t(stat.titleKey as any)}
                  </a>
                </h3>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
