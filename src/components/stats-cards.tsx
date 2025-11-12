"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  Building, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  GraduationCap,
  Award,
  BookOpen
} from "lucide-react"
import { useTranslations } from "next-intl"

interface StatItem {
  title: string
  value: number
  icon: React.ReactNode
  link?: string
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
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

export function StatsCards({
  staffStats = {
    totalStaff: 45,
    totalEmployee: 35,
    totalClient: 10
  },
  jobStats = {
    totalJobs: 24,
    activeJobs: 18,
    inactiveJobs: 6
  },
  trainingStats = {
    totalTrainer: 8,
    activeTraining: 5,
    doneTraining: 12
  }
}: StatsCardsProps) {
  const t = useTranslations('hrmDashboard.statsCards')

  const StatCard = ({ item }: { item: StatItem }) => {
    const getColorClasses = (color?: string) => {
      switch (color) {
        case 'blue':
        case 'green':
        case 'orange':
        case 'red':
        case 'purple':
          return 'bg-blue-50 text-blue-500'
        default:
          return 'bg-blue-50 text-blue-500'
      }
    }

    const cardContent = (
      <Card className="h-full hover:bg-gray-50 transition-all duration-200 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            {/* Top: Icon and Value side by side */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 flex-1 text-center">{item.value}</h3>
            </div>
            
            {/* Bottom: Description */}
            <p className="text-xs font-medium text-muted-foreground leading-tight break-words line-clamp-2">
              {item.title}
            </p>
          </div>
        </CardContent>
      </Card>
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
          icon: <Users className="w-5 h-5 text-blue-500" />,
          link: "/staff",
          color: "blue"
    },
    {
      title: t('staff.totalEmployee'), 
      value: staffStats.totalEmployee,
          icon: <UserCheck className="w-5 h-5 text-blue-500" />,
          link: "/employee",
          color: "green"
    },
    {
      title: t('staff.totalClient'),
      value: staffStats.totalClient,
          icon: <Building className="w-5 h-5 text-blue-500" />,
          link: "/clients",
          color: "purple"
    }
  ]

  const jobItems: StatItem[] = [
    {
      title: t('job.totalJobs'),
      value: jobStats.totalJobs,
          icon: <Briefcase className="w-5 h-5 text-blue-500" />,
          link: "/job",
          color: "blue"
    },
    {
      title: t('job.activeJobs'),
      value: jobStats.activeJobs,
          icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
          color: "green"
    },
    {
      title: t('job.inactiveJobs'),
      value: jobStats.inactiveJobs,
          icon: <XCircle className="w-5 h-5 text-blue-500" />,
          color: "red"
    }
  ]

  const trainingItems: StatItem[] = [
    {
      title: t('training.totalTrainer'),
      value: trainingStats.totalTrainer,
          icon: <GraduationCap className="w-5 h-5 text-blue-500" />,
          link: "/trainer",
          color: "blue"
    },
    {
      title: t('training.activeTraining'),
      value: trainingStats.activeTraining,
          icon: <BookOpen className="w-5 h-5 text-blue-500" />,
          color: "green"
    },
    {
      title: t('training.doneTraining'),
      value: trainingStats.doneTraining,
          icon: <Award className="w-5 h-5 text-blue-500" />,
          color: "orange"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Staff Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-500" />
          <h3 className="text-base font-medium text-gray-900">Staff</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {staffItems.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Job Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-blue-500" />
          <h3 className="text-base font-medium text-gray-900">Job</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {jobItems.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>
      </div>

      {/* Training Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="w-4 h-4 text-blue-500" />
          <h3 className="text-base font-medium text-gray-900">Training</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {trainingItems.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}