"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"

interface CRMLeadStatusProps {
  leadByStage?: { stage: string; count: number; percentage: number }[]
  loading?: boolean
}

export function CRMLeadStatus({ leadByStage = [], loading = false }: CRMLeadStatusProps) {
  const t = useTranslations("crmDashboard.leadStatus")
  const hasData = leadByStage.length > 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : !hasData ? (
          <p className="text-sm text-muted-foreground py-4">{t("noData")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadByStage.map((status, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm text-muted-foreground">{status.stage}</p>
                <h3 className="text-2xl font-bold text-green-600">{status.percentage}%</h3>
                <Progress value={status.percentage} className="h-2 bg-muted/50 [&>div]:bg-green-600" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
