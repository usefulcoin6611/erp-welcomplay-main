"use client"

import React, { Suspense, useMemo, useRef } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

// Lazy-load tabs
const AccountTab = dynamic(() => import('@/components/accounting-bank').then(m => m.AccountTab), { ssr: false })
const TransferTab = dynamic(() => import('@/components/accounting-bank').then(m => m.TransferTab), { ssr: false })

const TabLoading = () => (
  <div className="space-y-4">
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-64 w-full" />
  </div>
)

export default function BankingPage() {
  const tabCache = useRef<{[key: string]: React.ReactNode}>({})

  const tabs = useMemo(() => [
    { id: 'account', title: 'Account', content: <AccountTab /> },
    { id: 'transfer', title: 'Transfer', content: <TransferTab /> },
  ], [])

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <h1 className="text-base font-medium">Banking</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <SmoothTab
              items={tabs.map(t => ({ ...t, content: (
                <Suspense fallback={<TabLoading />}>
                  {t.content}
                </Suspense>
              ) }))}
              defaultTabId="account"
              activeColor="bg-white dark:bg-gray-700 shadow-xs"
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
 