"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, ClipboardList, DollarSign } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface StatsCardProps {
  title: string
  total: string
  percentage: string
  icon: React.ReactNode
  link?: string
  bgColor: string
  textColor: string
}

const StatCard = ({ title, total, percentage, icon, link, bgColor, textColor }: StatsCardProps) => {
  const t = useTranslations('projectDashboard.stats')
  
  const cardContent = (
    <Card className={`relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-200 h-full ${bgColor}`}>
      {/* Background Wave SVG */}
      <svg 
        className="absolute bottom-0 right-0 w-full h-[80px]" 
        viewBox="0 0 135 80" 
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M74.7692 35C27.8769 35 5.38462 65 0 80H135.692V0C134.923 11.6667 121.662 35 74.7692 35Z" 
          fill="currentColor"
          className={textColor === 'text-pink-600' ? 'text-pink-400' : textColor === 'text-green-600' ? 'text-green-400' : 'text-orange-400'}
          opacity="0.4"
        />
      </svg>
      
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-card shadow-sm`}>
              {icon}
            </div>
            <div className="flex-1">
              <h2 className={`text-base font-medium ${textColor} mb-2`}>{title}</h2>
              <h3 className={`text-xl font-semibold ${textColor}`}>{total}</h3>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${textColor}`}>{percentage}%</span>
              <p className={`text-xs ${textColor} mb-0`}>{t('completed')}</p>
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

export function ProjectStatsCards() {
  const t = useTranslations('projectDashboard.stats')

  const stats = [
    {
      title: t('totalProjects'),
      total: "0",
      percentage: "0",
  icon: <FileText className="w-6 h-6 text-cyan-500" />,
      link: "/projects",
  bgColor: "bg-cyan-50",
  textColor: "text-cyan-600"
    },
    {
      title: t('totalTasks'),
      total: "0",
      percentage: "0",
  icon: <ClipboardList className="w-6 h-6 text-cyan-500" />,
      link: "/tasks",
  bgColor: "bg-cyan-50",
  textColor: "text-cyan-600"
    },
    {
      title: t('totalExpense'),
      total: "Rp 0",
      percentage: "0",
  icon: <DollarSign className="w-6 h-6 text-cyan-500" />,
  bgColor: "bg-cyan-50",
  textColor: "text-cyan-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
