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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconArrowLeft } from '@tabler/icons-react'

const mockPipelines = [
  {
    id: 1,
    name: 'Default Pipeline',
    deals: 12,
    value: 820_000_000,
    stages: ['New', 'Qualified', 'Proposal Sent', 'Won', 'Lost'],
  },
  {
    id: 2,
    name: 'Enterprise Deals',
    deals: 5,
    value: 1_250_000_000,
    stages: ['New', 'Demo Scheduled', 'Negotiation', 'Won', 'Lost'],
  },
] as const

interface PipelineDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PipelineDetailPage({
  params,
}: PipelineDetailPageProps) {
  const { id } = await params
  const numericId = Number(id)
  const pipeline =
    mockPipelines.find((p) => p.id === numericId) ?? mockPipelines[0]

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
                <h1 className="text-2xl font-bold">{pipeline.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {pipeline.deals} deals · Rp{' '}
                  {pipeline.value.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  Edit Pipeline
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  <Link href="/pipelines">
                    <IconArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Link>
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pipeline.stages.map((stage) => (
                      <TableRow key={stage}>
                        <TableCell>{stage}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 border-none">
                            Active
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

