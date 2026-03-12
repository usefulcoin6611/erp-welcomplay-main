import React from "react"
import Link from "next/link"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconArrowLeft } from '@tabler/icons-react'
import { type Contract } from '@/lib/contract-data'
import { ContractDetailClient } from './contract-detail-client'

type ContractDetail = Contract

async function fetchContractDetail(id: string): Promise<ContractDetail | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const baseUrl =
    appUrl && (appUrl.startsWith("http://") || appUrl.startsWith("https://"))
      ? appUrl
      : appUrl
        ? `https://${appUrl}`
        : "http://localhost:3000"

  const res = await fetch(`${baseUrl}/api/contracts/${id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return null
  }

  const json = await res.json()
  if (!json?.success || !json.data) {
    return null
  }

  return json.data as ContractDetail
}

interface ContractDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ContractDetailPage({
  params,
}: ContractDetailPageProps) {
  const { id } = await params
  const contract = await fetchContractDetail(id)

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
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Contract tidak ditemukan</p>
                <Button asChild variant="outline" size="sm" className="h-8 px-3 shadow-none bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200">
                  <Link href="/contract">
                    <IconArrowLeft className="mr-1 h-4 w-4" />
                    Back to Contract List
                  </Link>
                </Button>
              </div>
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <ContractDetailClient contract={contract} />
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
