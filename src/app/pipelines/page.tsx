"use client"

import React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import PipelineTab, { PipelineTabCreateButton } from './components/PipelineTab'
import LeadStagesTab, { LeadStagesTabCreateButton } from './components/LeadStagesTab'
import DealStagesTab, { DealStagesTabCreateButton } from './components/DealStagesTab'
import SourcesTab, { SourcesTabCreateButton } from './components/SourcesTab'
import LabelsTab, { LabelsTabCreateButton } from './components/LabelsTab'
import ContractTypeTab, { ContractTypeTabCreateButton } from './components/ContractTypeTab'

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

  const tabAction = {
    pipelines: <PipelineTabCreateButton />,
    'lead-stages': <LeadStagesTabCreateButton />,
    'deal-stages': <DealStagesTabCreateButton />,
    sources: <SourcesTabCreateButton />,
    labels: <LabelsTabCreateButton />,
    'contract-type': <ContractTypeTabCreateButton />,
  } as const
  const action = tabAction[activeTab as keyof typeof tabAction] ?? undefined

  return (
    <SmoothTab
      items={tabs}
      defaultTabId={activeTab}
      value={activeTab}
      activeColor="bg-white dark:bg-gray-700 shadow-xs"
      action={action}
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Suspense fallback={<Skeleton className="h-12 w-64 rounded-lg" />}>
              <CRMSystemSetupContent />
            </Suspense>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
