"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Handshake, FileText } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  link?: string
  bgColor: string
  textColor: string
}

const StatCard = ({ title, value, icon, link, bgColor, textColor }: StatsCardProps) => {
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
        <div className="flex items-start justify-between mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-card shadow-sm`}>
            {icon}
          </div>
          <div className="text-right">
            <h3 className={`text-xl font-semibold ${textColor}`}>{value}</h3>
          </div>
        </div>
        
        <div>
          <h2 className={`text-base font-medium ${textColor}`}>{title}</h2>
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

export function CRMStatsCards() {
  const t = useTranslations('crmDashboard.stats')

  const stats = [
    {
      title: t('totalLead'),
      value: "0",
      icon: <Users className="w-6 h-6 text-pink-600" />,
      link: "/crm/leads",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: t('totalDeal'),
      value: "0",
      icon: <Handshake className="w-6 h-6 text-green-600" />,
      link: "/crm/deals",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: t('totalContract'),
      value: "0",
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      link: "/crm/contracts",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
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
