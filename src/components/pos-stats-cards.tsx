"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, DollarSign, ShoppingBag, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export type POSDashboardStats = {
  monthlyPOSAmount: number
  totalPOSAmount: number
  monthlyPurchaseAmount: number
  totalPurchaseAmount: number
}

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

export function POSStatsCards({ stats: statsProp }: { stats?: POSDashboardStats | null }) {
  const t = useTranslations('posDashboard.stats')
  const [stats, setStats] = useState<POSDashboardStats | null>(statsProp ?? null)
  const [loading, setLoading] = useState(!statsProp)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (statsProp != null) {
      setStats(statsProp)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch("/api/pos-dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json?.success && json?.data?.stats) {
          setStats(json.data.stats)
        } else {
          setError(json?.message ?? "Failed to load")
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [statsProp])

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden h-full animate-pulse">
            <CardContent className="p-3 flex items-center justify-center h-[88px]">
              <Loader2 className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error ?? "No data"}
      </div>
    )
  }

  const cards = [
    {
      title: t('monthlyPOS'),
      total: t('total'),
      value: formatCurrency(stats.monthlyPOSAmount),
      icon: <ShoppingCart className="w-6 h-6 text-pink-600" />,
      link: "/pos/report",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: t('totalPOSAmount'),
      total: t('total'),
      value: formatCurrency(stats.totalPOSAmount),
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      link: "/pos/report",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: t('monthlyPurchase'),
      total: t('total'),
      value: formatCurrency(stats.monthlyPurchaseAmount),
      icon: <ShoppingBag className="w-6 h-6 text-orange-600" />,
      link: "/pos/purchase",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: t('totalPurchaseAmount'),
      total: t('total'),
      value: formatCurrency(stats.totalPurchaseAmount),
      icon: <TrendingUp className="w-6 h-6 text-cyan-600" />,
      link: "/pos/purchase",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
