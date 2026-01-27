
'use client'

import React from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { AttendanceClock } from '@/components/attendance-clock'
import { EventCalendar } from '@/components/event-calendar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { AnnouncementList } from '@/components/announcement-list'
import MeetingSchedule from '@/components/meeting-schedule'
import { useAuth } from '@/contexts/auth-context'

export default function HrmDashboardPage() {
  const { user } = useAuth()
  const isEmployee = user?.type === 'employee'

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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
            {/* Main 2-column layout: Mark Attendance + Event (left), Announcement + Meeting (right) */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Left: Mark Attendance + Event calendar (same width as Event card) */}
              <div className="space-y-4">
                {isEmployee ? <AttendanceClock /> : null}
                <EventCalendar />
              </div>

              {/* Right: Announcement list + Meeting list */}
              <div className="space-y-4">
                <AnnouncementList compact />
                <MeetingSchedule compact />
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  );
}