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
  IconMail,
  IconPhone,
  IconUser,
} from '@tabler/icons-react'

const mockLeads = [
  {
    id: 'LEAD-001',
    name: 'PT Maju Jaya',
    subject: 'Implementasi ERP',
    email: 'contact@majujara.id',
    phone: '+62 21 555 1234',
    pipeline: 'Default Pipeline',
    stage: 'New',
    owner: 'Budi',
    createdAt: '2025-11-01',
    notes: 'Lead masuk dari website landing page ERP.',
  },
  {
    id: 'LEAD-002',
    name: 'CV Kreatif Digital',
    subject: 'Upgrade CRM',
    email: 'halo@kreatifdigital.co.id',
    phone: '+62 812 3456 7890',
    pipeline: 'Default Pipeline',
    stage: 'Qualified',
    owner: 'Sari',
    createdAt: '2025-11-03',
    notes: 'Tertarik modul CRM & Ticketing.',
  },
] as const

interface LeadDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params
  const lead = mockLeads.find((l) => l.id === id) ?? mockLeads[0]

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
        <div className="flex flex-1 flex-col bg-gray-50">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{lead.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {lead.subject} · {lead.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  Edit Lead
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none"
                >
                  Convert to Deal
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  <Link href="/leads">
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
                    Lead Owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.owner}</span>
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
                    {lead.pipeline}
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-none">
                    {lead.stage}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Created At
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.createdAt}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {lead.notes}
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

