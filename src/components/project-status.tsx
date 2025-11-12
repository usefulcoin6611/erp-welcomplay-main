"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"

export function ProjectStatus() {
  const t = useTranslations('projectDashboard.projectStatus')

  // Mock data - statuses dari referensi
  const projectStatuses = [
    { status: t('onGoing'), percentage: 45, total: 45, color: 'info' },
    { status: t('onHold'), percentage: 25, total: 25, color: 'warning' },
    { status: t('complete'), percentage: 20, total: 20, color: 'success' },
    { status: t('cancelled'), percentage: 10, total: 10, color: 'danger' },
  ]

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { text: string, progress: string }> = {
      'info': { text: 'text-blue-600', progress: '[&>div]:bg-blue-600' },
      'warning': { text: 'text-yellow-600', progress: '[&>div]:bg-yellow-600' },
      'success': { text: 'text-green-600', progress: '[&>div]:bg-green-600' },
      'danger': { text: 'text-red-600', progress: '[&>div]:bg-red-600' },
    }
    return colorMap[color] || colorMap['info']
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectStatuses.map((status, index) => {
            const colors = getColorClasses(status.color)
            return (
              <div key={index} className="space-y-2">
                <p className="text-sm text-muted-foreground">{status.status}</p>
                <h3 className={`text-2xl font-bold ${colors.text}`}>{status.total}%</h3>
                <Progress value={status.percentage} className={`h-2 bg-muted/50 ${colors.progress}`} />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
