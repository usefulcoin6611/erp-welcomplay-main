"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, DollarSign, ShoppingBag, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface StatsCardProps {
  title: string
  total: string
  value: string
  icon: React.ReactNode
  link?: string
  bgColor: string
  textColor: string
}

const StatCard = ({ title, total, value, icon, link, bgColor, textColor }: StatsCardProps) => {
  const cardContent = (
    <Card className={`overflow-hidden hover:bg-opacity-80 transition-all duration-200 h-full ${bgColor}`}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-card`}>
            {icon}
          </div>
          <div className="text-right">
            <p className={`text-[10px] font-medium ${textColor} mb-0.5`}>{total} :</p>
            <h3 className={`text-base font-semibold ${textColor}`}>{value}</h3>
          </div>
        </div>
        
        <div>
          <h2 className={`text-xs font-medium ${textColor}`}>{title}</h2>
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

export function POSStatsCards() {
  const t = useTranslations('posDashboard.stats')

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`
  }

  const stats = [
    {
      title: t('monthlyPOS'),
      total: t('total'),
      value: formatCurrency(12267750),
      icon: <ShoppingCart className="w-6 h-6 text-pink-600" />,
      link: "/pos/report",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: t('totalPOSAmount'),
      total: t('total'),
      value: formatCurrency(12267750),
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      link: "/pos/report",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: t('monthlyPurchase'),
      total: t('total'),
      value: formatCurrency(12267750),
      icon: <ShoppingBag className="w-6 h-6 text-orange-600" />,
      link: "/purchase",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: t('totalPurchaseAmount'),
      total: t('total'),
      value: formatCurrency(12267750),
      icon: <TrendingUp className="w-6 h-6 text-cyan-600" />,
      link: "/purchase",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
