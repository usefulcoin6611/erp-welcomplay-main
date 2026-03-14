import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { ProjectStatsCards } from '@/components/project-stats-cards'
import { ProjectStatus } from '@/components/project-status'
import { TasksOverview } from '@/components/tasks-overview'
import { TopDueProjects } from '@/components/top-due-projects'
import { TimesheetLoggedHours } from '@/components/timesheet-logged-hours'
import { TopDueTasks } from '@/components/top-due-tasks'
import { ProjectDashboardProvider } from '@/contexts/project-dashboard-context'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function ProjectDashboardPage() {
  return (
    <ProjectDashboardProvider>
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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-8 p-6 lg:p-8">
            {/* Stats Cards */}
            <ProjectStatsCards />
            
            {/* Project Status and Tasks Overview */}
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-12 xl:col-span-4">
                <ProjectStatus />
              </div>
              <div className="lg:col-span-12 xl:col-span-8">
                <TasksOverview />
              </div>
            </div>

            {/* Top Due Projects and Timesheet Logged Hours */}
            <div className="grid gap-8 lg:grid-cols-2">
              <TopDueProjects />
              <TimesheetLoggedHours />
            </div>

            {/* Top Due Tasks - Full Width */}
            <div className="w-full">
              <TopDueTasks />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    </ProjectDashboardProvider>
  )
}
