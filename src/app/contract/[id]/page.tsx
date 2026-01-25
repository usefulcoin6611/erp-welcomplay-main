import React from "react"
import Link from "next/link"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  IconArrowLeft,
  IconCalendar,
  IconDownload,
} from '@tabler/icons-react'

const mockContracts = [
  {
    id: 'CTR-2025-001',
    subject: 'Implementasi ERP PT Maju Jaya',
    client: 'PT Maju Jaya',
    type: 'Implementation',
    value: 350_000_000,
    startDate: '2025-11-01',
    endDate: '2026-01-31',
    status: 'Active',
    description: 'Kontrak implementasi ERP full module selama 3 bulan.',
  },
  {
    id: 'CTR-2025-002',
    subject: 'Maintenance CRM CV Kreatif Digital',
    client: 'CV Kreatif Digital',
    type: 'Support',
    value: 120_000_000,
    startDate: '2025-11-10',
    endDate: '2026-11-09',
    status: 'Pending',
    description: 'Maintenance dan support tahunan untuk modul CRM.',
  },
] as const

function getStatusBadge(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 border-none'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Expired':
      return 'bg-gray-100 text-gray-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

interface ContractDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const { id } = await params
  const contract =
    mockContracts.find((c) => c.id === id) ?? mockContracts[0]

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  <Link href="/contract">
                    <IconArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">
                    {contract.subject}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {contract.client} · {contract.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  Edit Contract
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {contract.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span>Start: {contract.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="h-4 w-4" />
                    <span>End: {contract.endDate}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    className={getStatusBadge(contract.status)}
                  >
                    {contract.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {contract.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

