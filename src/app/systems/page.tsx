"use client"

import React from 'react'
import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { SystemSettingsTab } from '../settings/components/SystemSettingsTab'

function SystemSettingsContent() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'

  // Redirect jika user bukan super admin
  React.useEffect(() => {
    if (isLoading) return // Tunggu sampai user data dimuat

    if (!isSuperAdmin) {
      router.replace('/')
      return
    }
  }, [isLoading, isSuperAdmin, router])

  // Tampilkan loading saat menunggu user data
  if (isLoading) {
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
              <Skeleton className="h-[400px] w-full" />
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Jangan render jika bukan super admin (akan di-redirect)
  if (!isSuperAdmin) {
    return null
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
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <SystemSettingsTab />
            </Suspense>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function SystemSettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SystemSettingsContent />
    </Suspense>
  )
}
