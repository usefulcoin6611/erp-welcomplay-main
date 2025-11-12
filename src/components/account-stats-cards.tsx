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
          <Card key={stat.titleKey} className="relative overflow-hidden border border-gray-200 dark:border-gray-800 shadow-none hover:shadow-sm transition-shadow duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
              <div className="absolute top-2 right-2 w-10 h-10 opacity-5 dark:opacity-10">
                <div className="w-full h-full bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-12 h-12 opacity-5 dark:opacity-10">
                <div className="w-full h-full bg-gray-400 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
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
