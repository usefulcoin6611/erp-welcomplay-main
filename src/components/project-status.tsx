"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import { useProjectDashboard } from "@/contexts/project-dashboard-context"

const statusLabelKey: Record<string, string> = {
  on_going: 'onGoing',
  on_hold: 'onHold',
  complete: 'complete',
  cancelled: 'cancelled',
}

export function ProjectStatus() {
  const t = useTranslations('projectDashboard.projectStatus')
  const { data, loading } = useProjectDashboard()

  const classMap: Record<string, { text: string; progress: string }> = {
    'info': { text: 'text-blue-600', progress: '[&>div]:bg-blue-600' },
    'warning': { text: 'text-yellow-600', progress: '[&>div]:bg-yellow-600' },
    'success': { text: 'text-green-600', progress: '[&>div]:bg-green-600' },
    'danger': { text: 'text-red-600', progress: '[&>div]:bg-red-600' },
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>{t('title')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusToColor: Record<string, keyof typeof classMap> = {
    on_going: 'info', on_hold: 'warning', complete: 'success', cancelled: 'danger',
  }
  const projectStatuses = data.projectStatuses.map((s) => ({
    ...s,
    label: t(statusLabelKey[s.status] ?? 'onGoing'),
    colors: classMap[statusToColor[s.status] ?? 'info'] ?? classMap.info,
  }))

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectStatuses.map((s, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <h3 className={`text-2xl font-bold ${s.colors.text}`}>{s.percentage}%</h3>
              <Progress value={s.percentage} className={`h-2 bg-muted/50 ${s.colors.progress}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
