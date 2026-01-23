import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { AttendanceClock } from '@/components/attendance-clock'
import { EventCalendar } from '@/components/event-calendar'
import { StatsCards } from '@/components/stats-cards'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { AnnouncementList } from '@/components/announcement-list'
import MeetingSchedule from '@/components/meeting-schedule'
import React from 'react'

export default function EmployeeDashboardPage() {
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {/* Attendance Clock Section */}
            <div className="grid gap-4">
              <AttendanceClock />
            </div>
            
            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Calendar */}
              <div>
                <EventCalendar />
              </div>
              
              {/* Right Column - Stats */}
              <div className="space-y-4">
                <StatsCards />
              </div>
            </div>
            
            {/* Bottom Section - Announcement / Teams widget */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <AnnouncementList compact />
              </div>
              <div>
                <MeetingSchedule compact />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

