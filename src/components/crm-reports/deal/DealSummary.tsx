'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import type { DealSummaryType } from './constants'

interface DealSummaryProps {
  summary: DealSummaryType
  isLoading: boolean
}

export function DealSummary({ summary, isLoading }: DealSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Deal',
      value: summary.totalDeals,
      icon: DollarSign,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Nilai Total',
      value: summary.totalValue,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Deal Won',
      value: summary.wonDeals,
      icon: CheckCircle2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Deal Lost',
      value: summary.lostDeals,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
