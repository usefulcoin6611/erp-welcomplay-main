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
} from '@tabler/icons-react'

const mockDeals = [
  {
    id: 'DEAL-001',
    name: 'Implementasi ERP PT Maju Jaya',
    client: 'PT Maju Jaya',
    pipeline: 'Default Pipeline',
    stage: 'Proposal Sent',
    price: 350_000_000,
    status: 'Open',
    createdAt: '2025-11-02',
    notes: 'Deal dari konversi lead LEAD-001.',
  },
  {
    id: 'DEAL-002',
    name: 'CRM Upgrade CV Kreatif Digital',
    client: 'CV Kreatif Digital',
    pipeline: 'Default Pipeline',
    stage: 'Negotiation',
    price: 180_000_000,
    status: 'Open',
    createdAt: '2025-11-05',
    notes: 'Butuh integrasi dengan helpdesk.',
  },
] as const

interface DealDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
  const { id } = await params
  const deal = mockDeals.find((d) => d.id === id) ?? mockDeals[0]

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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{deal.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {deal.client} · {deal.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  Edit Deal
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none"
                >
                  Mark as Won
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  <Link href="/deals">
                    <IconArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Link>
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
                    Rp {deal.price.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pipeline / Stage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {deal.pipeline}
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-none">
                    {deal.stage}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-100 text-green-700 border-none">
                    {deal.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Key Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {deal.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {deal.notes}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

