"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import PipelineTab from './components/PipelineTab'
import LeadStagesTab from './components/LeadStagesTab'
import DealStagesTab from './components/DealStagesTab'
import SourcesTab from './components/SourcesTab'
import LabelsTab from './components/LabelsTab'
import ContractTypeTab from './components/ContractTypeTab'

function CRMSystemSetupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeTab = searchParams.get('tab') || 'pipelines'

  const handleTabChange = (tabId: string) => {
    router.push(`/pipelines?tab=${tabId}`, { scroll: false })
  }

  const tabs = React.useMemo(() => [
    {
      id: 'pipelines',
      title: 'Pipeline',
      content: (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <PipelineTab />
        </Suspense>
      ),
    },
    {
      id: 'lead-stages',
      title: 'Lead Stages',
      content: (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <LeadStagesTab />
        </Suspense>
      ),
    },
    {
      id: 'deal-stages',
      title: 'Deal Stages',
      content: (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <DealStagesTab />
        </Suspense>
      ),
    },
    {
      id: 'sources',
      title: 'Sources',
      content: (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <SourcesTab />
        </Suspense>
      ),
    },
    {
      id: 'labels',
      title: 'Labels',
      content: (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <LabelsTab />
        </Suspense>
      ),
    },
    {
      id: 'contract-type',
      title: 'Contract Type',
      content: (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <ContractTypeTab />
        </Suspense>
      ),
    },
  ], [])

  return (
    <SmoothTab
      items={tabs}
      defaultTabId={activeTab}
      activeColor="bg-blue-50 dark:bg-blue-900"
      onChange={handleTabChange}
    />
  )
}

export default function CRMSystemSetupPage() {
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
              <div>
                <h1 className="text-3xl font-bold">CRM System Setup</h1>
              </div>
            </div>

            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <CRMSystemSetupContent />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
