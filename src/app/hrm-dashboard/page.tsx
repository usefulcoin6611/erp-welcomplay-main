
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { AttendanceClock } from '@/components/attendance-clock'
import { EventCalendar } from '@/components/event-calendar'
import { StatsCards } from '@/components/stats-cards'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnnouncementList } from '@/components/announcement-list'
import MeetingSchedule from '@/components/meeting-schedule'
import { useAuth } from '@/contexts/auth-context'

export default function HrmDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const isEmployee = user?.type === 'employee'
  const isCompany = user?.type === 'company'
  const isSuperAdmin = user?.type === 'super admin'
  const isClient = user?.type === 'client'

  // Client tidak punya akses HRM (route guard redirect); fallback jika sampai di sini
  if (!isLoading && isClient) {
    router.replace('/crm-dashboard')
    return null
  }

  // Company & super admin: tampilan overview dengan stats cards (sesuai reference-erp)
  const showStatsCards = isCompany || isSuperAdmin

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* 2 kolom: Kiri = Event Calendar + Announcement List; Kanan = Overview + Meeting Schedule. items-start agar kolom tidak stretch = tidak ada space kosong. */}
            <div className="grid gap-4 lg:grid-cols-2 items-start">
              <div className="space-y-4 min-w-0">
                {isEmployee ? <AttendanceClock /> : null}
                <EventCalendar />
                <AnnouncementList compact />
              </div>
              <div className="space-y-4 min-w-0">
                {showStatsCards ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StatsCards />
                    </CardContent>
                  </Card>
                ) : null}
                <MeetingSchedule compact />
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}