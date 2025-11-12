"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"

export function CRMLeadStatus() {
  const t = useTranslations('crmDashboard.leadStatus')

  // Mock data (expanded to match reference layout)
  const leadStatuses = [
    { stage: t('draft'), percentage: 20 },
    { stage: t('sent'), percentage: 10 },
    { stage: t('open'), percentage: 20 },
    { stage: t('revised'), percentage: 10 },
    { stage: t('declined'), percentage: 10 },
    { stage: t('pending'), percentage: 10 },
    { stage: t('contacted'), percentage: 10 },
    { stage: t('qualified'), percentage: 10 },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leadStatuses.map((status, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm text-muted-foreground">{status.stage}</p>
              <h3 className="text-2xl font-bold text-green-600">{status.percentage}%</h3>
              <Progress value={status.percentage} className="h-2 bg-muted/50 [&>div]:bg-green-600" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
