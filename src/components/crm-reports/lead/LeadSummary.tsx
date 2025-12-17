'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import type { LeadSummaryType } from './constants'

interface LeadSummaryProps {
  summary: LeadSummaryType
  isLoading: boolean
}

export function LeadSummary({ summary, isLoading }: LeadSummaryProps) {
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
      title: 'Total Lead',
      value: summary.totalLeads,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Lead Qualified',
      value: summary.qualifiedLeads,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Lead Converted',
      value: summary.convertedLeads,
      icon: CheckCircle2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Lead Lost',
      value: summary.lostLeads,
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
