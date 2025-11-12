"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useTranslations } from "next-intl"

export function CRMLatestContract() {
  const t = useTranslations('crmDashboard.latestContract')

  // Mock data - empty for now
  const contracts: any[] = []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('number')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('subject')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('client')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('project')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('contractType')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('contractValue')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('startDate')}
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {t('endDate')}
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="h-24 text-center">
                      <div className="text-muted-foreground">
                        <h6 className="text-sm font-medium">{t('noContract')}</h6>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contracts.map((contract, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/contract/${contract.id}`}>
                            {contract.number}
                          </Link>
                        </Button>
                      </td>
                      <td className="p-4 align-middle">{contract.subject}</td>
                      <td className="p-4 align-middle">{contract.client}</td>
                      <td className="p-4 align-middle">{contract.project}</td>
                      <td className="p-4 align-middle">{contract.type}</td>
                      <td className="p-4 align-middle">{contract.value}</td>
                      <td className="p-4 align-middle">{contract.startDate}</td>
                      <td className="p-4 align-middle">{contract.endDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
