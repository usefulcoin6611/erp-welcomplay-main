"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"

export function CRMDealStatus() {
  const t = useTranslations('crmDashboard.dealStatus')

  // Mock data (expanded to match reference layout)
  const dealStatuses = [
    { stage: t('initialContact'), percentage: 26.83 },
    { stage: t('qualification'), percentage: 12.2 },
    { stage: t('meeting'), percentage: 14.63 },
    { stage: t('proposal'), percentage: 12.2 },
    { stage: t('close'), percentage: 2.44 },
    { stage: t('initialContact'), percentage: 4.88 },
    { stage: t('qualification'), percentage: 0 },
    { stage: t('meeting'), percentage: 0 },
    { stage: t('close'), percentage: 0 },
  ]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dealStatuses.map((status, index) => (
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
