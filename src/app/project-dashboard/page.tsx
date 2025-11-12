import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { ProjectStatsCards } from '@/components/project-stats-cards'
import { ProjectStatus } from '@/components/project-status'
import { TasksOverview } from '@/components/tasks-overview'
import { TopDueProjects } from '@/components/top-due-projects'
import { TimesheetLoggedHours } from '@/components/timesheet-logged-hours'
import { TopDueTasks } from '@/components/top-due-tasks'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function ProjectDashboardPage() {
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
            {/* Stats Cards */}
            <ProjectStatsCards />
            
            {/* Project Status and Tasks Overview */}
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <ProjectStatus />
              </div>
              <div className="lg:col-span-8">
                <TasksOverview />
              </div>
            </div>

            {/* Top Due Projects and Timesheet Logged Hours */}
            <div className="grid gap-6 lg:grid-cols-2">
              <TopDueProjects />
              <TimesheetLoggedHours />
            </div>

            {/* Top Due Tasks - Full Width */}
            <TopDueTasks />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
