"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Users,
  UserCheck,
  Building,
  Briefcase,
  CheckCircle,
  XCircle,
  GraduationCap,
  Award,
  BookOpen,
} from "lucide-react"
import { useTranslations } from "next-intl"

interface StatItem {
  title: string
  value: number
  icon: React.ReactNode
  link?: string
  color?: "blue" | "green" | "orange" | "red" | "purple"
  bgColor?: string
}

interface StatsCardsProps {
  staffStats?: {
    totalStaff: number
    totalEmployee: number
    totalClient: number
  }
  jobStats?: {
    totalJobs: number
    activeJobs: number
    inactiveJobs: number
  }
  trainingStats?: {
    totalTrainer: number
    activeTraining: number
    doneTraining: number
  }
}

const defaultStaffStats = { totalStaff: 0, totalEmployee: 0, totalClient: 0 }
const defaultJobStats = { totalJobs: 0, activeJobs: 0, inactiveJobs: 0 }
const defaultTrainingStats = { totalTrainer: 0, activeTraining: 0, doneTraining: 0 }

export function StatsCards(props: StatsCardsProps) {
  const t = useTranslations("hrmDashboard.statsCards")
  const [staffStats, setStaffStats] = useState(props.staffStats ?? defaultStaffStats)
  const [jobStats, setJobStats] = useState(props.jobStats ?? defaultJobStats)
  const [trainingStats, setTrainingStats] = useState(
    props.trainingStats ?? defaultTrainingStats
  )
  const [loading, setLoading] = useState(!props.staffStats && !props.jobStats && !props.trainingStats)

  useEffect(() => {
    if (props.staffStats !== undefined && props.jobStats !== undefined && props.trainingStats !== undefined) {
      setStaffStats(props.staffStats)
      setJobStats(props.jobStats)
      setTrainingStats(props.trainingStats)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch("/api/hrm-dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json?.success || !json?.data) return
        const d = json.data
        setStaffStats(d.staffStats ?? defaultStaffStats)
        setJobStats(d.jobStats ?? defaultJobStats)
        setTrainingStats(d.trainingStats ?? defaultTrainingStats)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [props.staffStats, props.jobStats, props.trainingStats])

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-20 rounded-lg bg-muted/60" />
        <div className="h-20 rounded-lg bg-muted/60" />
        <div className="h-20 rounded-lg bg-muted/60" />
      </div>
    )
  }

  const getBgAndIconClasses = (color?: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-50', iconBg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-900' }
      case 'green':
        return { bg: 'bg-green-50', iconBg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-900' }
      case 'orange':
        return { bg: 'bg-amber-50', iconBg: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-900' }
      case 'red':
        return { bg: 'bg-red-50', iconBg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-900' }
      case 'purple':
        return { bg: 'bg-violet-50', iconBg: 'bg-violet-100', icon: 'text-violet-600', text: 'text-violet-900' }
      default:
        return { bg: 'bg-slate-50', iconBg: 'bg-slate-100', icon: 'text-slate-600', text: 'text-slate-900' }
    }
  }

  const StatCard = ({ item }: { item: StatItem }) => {
    const colors = getBgAndIconClasses(item.color)
    const cardContent = (
      <div className={`h-full rounded-lg ${colors.bg} p-4 transition-colors hover:opacity-95`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center [&_svg]:text-current ${colors.iconBg} ${colors.icon}`}>
              {item.icon}
            </div>
            <h3 className={`text-xl font-semibold flex-1 text-center ${colors.text}`}>{item.value}</h3>
          </div>
          <p className="text-xs font-medium text-muted-foreground leading-tight break-words line-clamp-2">
            {item.title}
          </p>
        </div>
      </div>
    )

    if (item.link) {
      return (
        <Link href={item.link} className="block group">
          {cardContent}
        </Link>
      )
    }

    return cardContent
  }

  const staffItems: StatItem[] = [
    {
      title: t('staff.totalStaff'),
      value: staffStats.totalStaff,
      icon: <Users className="w-5 h-5" />,
      link: "/staff",
      color: "blue"
    },
    {
      title: t('staff.totalEmployee'),
      value: staffStats.totalEmployee,
      icon: <UserCheck className="w-5 h-5" />,
      link: "/employee",
      color: "green"
    },
    {
      title: t('staff.totalClient'),
      value: staffStats.totalClient,
      icon: <Building className="w-5 h-5" />,
      link: "/clients",
      color: "purple"
    }
  ]

  const jobItems: StatItem[] = [
    {
      title: t('job.totalJobs'),
      value: jobStats.totalJobs,
      icon: <Briefcase className="w-5 h-5" />,
      link: "/job",
      color: "blue"
    },
    {
      title: t('job.activeJobs'),
      value: jobStats.activeJobs,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green"
    },
    {
      title: t('job.inactiveJobs'),
      value: jobStats.inactiveJobs,
      icon: <XCircle className="w-5 h-5" />,
      color: "red"
    }
  ]

  const trainingItems: StatItem[] = [
    {
      title: t('training.totalTrainer'),
      value: trainingStats.totalTrainer,
      icon: <GraduationCap className="w-5 h-5" />,
      link: "/trainer",
      color: "blue"
    },
    {
      title: t('training.activeTraining'),
      value: trainingStats.activeTraining,
      icon: <BookOpen className="w-5 h-5" />,
      color: "green"
    },
    {
      title: t('training.doneTraining'),
      value: trainingStats.doneTraining,
      icon: <Award className="w-5 h-5" />,
      color: "orange"
    }
  ]

  return (
    <div className="space-y-5">
      {/* Staff Section - tanpa pewarnaan wrapper, hanya card di dalam */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Staff</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {staffItems.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Job Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Job</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {jobItems.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Training Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Training</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {trainingItems.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}