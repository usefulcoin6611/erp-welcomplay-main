"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, ClipboardList, DollarSign } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useProjectDashboard } from "@/contexts/project-dashboard-context"

interface StatsCardProps {
  title: string
  total: string
  percentage: string
  icon: React.ReactNode
  link?: string
}

const StatCard = ({ title, total, percentage, icon, link }: Omit<StatsCardProps, 'bgColor' | 'textColor'>) => {
  const t = useTranslations('projectDashboard.stats')

  const cardContent = (
    <Card className="relative overflow-hidden border-0 shadow-none transition-all duration-200 h-full bg-white dark:bg-gray-900/50 group/card dark:hover:bg-gray-800/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover/card:bg-blue-600 group-hover/card:text-white group-hover/card:shadow-blue-500/30">
              {icon}
            </div>
            <div className="flex-1">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">{title}</h2>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{total}</h3>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-end">
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{percentage}%</span>
              <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">{t('completed')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (link) {
    return (
      <Link href={link} className="block h-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

export function ProjectStatsCards() {
  const t = useTranslations('projectDashboard.stats')
  const { data, loading } = useProjectDashboard()
  const { stats } = data

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-xl border-0 shadow-none" />
        ))}
      </div>
    )
  }

  const statItems = [
    {
      title: t('totalProjects'),
      total: String(stats.totalProjects),
      percentage: String(stats.projectCompletionPercent),
      icon: <FileText className="w-6 h-6" />,
      link: "/projects",
    },
    {
      title: t('totalTasks'),
      total: String(stats.totalTasks),
      percentage: String(stats.taskCompletionPercent),
      icon: <ClipboardList className="w-6 h-6" />,
      link: "/taskboard",
    },
    {
      title: t('totalExpense'),
      total: formatCurrency(stats.totalExpense),
      percentage: "0",
      icon: <DollarSign className="w-6 h-6" />,
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {statItems.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
