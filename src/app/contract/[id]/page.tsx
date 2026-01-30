import React from "react"
import Link from "next/link"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
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
  IconPencil,
} from '@tabler/icons-react'
import {
  getContractById,
  getContractStatusBadgeClass,
  getContractStatusDisplay,
} from '@/lib/contract-data'

interface ContractDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const { id } = await params
  const contract = getContractById(id)

  if (!contract) {
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
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Contract tidak ditemukan</p>
                <Button asChild variant="outline" size="sm" className="h-8 px-3 shadow-none bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200">
                  <Link href="/contract">
                    <IconArrowLeft className="mr-1 h-4 w-4" />
                    Back to Contract List
                  </Link>
                </Button>
              </div>
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Contract tidak ditemukan.</p>
                  <Button asChild variant="outline" size="sm" className="mt-4 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">
                    <Link href="/contract">Kembali ke Daftar Contract</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const statusDisplay = getContractStatusDisplay(contract.status)
  const statusBadgeClass = getContractStatusBadgeClass(contract.status)

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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  {contract.subject}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {contract.contractNumber} · {contract.client}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                >
                  <IconPencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                >
                  <IconDownload className="mr-1.5 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                >
                  <Link href="/contract">
                    <IconArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-sm font-medium">
                    Contract Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <div className="text-xl font-bold">
                    Rp {contract.value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-sm font-medium">
                    Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Start: {contract.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="h-4 w-4 shrink-0" />
                    <span>End: {contract.endDate}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-sm font-medium">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <Badge className={statusBadgeClass}>
                    {statusDisplay}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-sm font-medium">
                    Informasi Contract
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{contract.client}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Project</span>
                    <span className="font-medium">{contract.project === '-' ? '-' : contract.project}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Contract Type</span>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                      {contract.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-sm font-medium">
                    Contract Number
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-sm font-medium">{contract.contractNumber}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">ID: {contract.id}</p>
                </CardContent>
              </Card>
            </div>

            {contract.description && (
              <Card>
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-sm font-medium">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {contract.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
