"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainContentWrapper } from "@/components/main-content-wrapper"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IconArrowLeft, IconCalendar, IconClockHour4, IconUsers, IconListCheck, IconCurrencyDollar, IconReportMoney, IconClipboardList } from "@tabler/icons-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Data mock sesuai dengan Project List
const projects = [
  {
    id: 1,
    code: "PRJ-001",
    name: "Implementasi ERP PT Maju Jaya",
    client: "PT Maju Jaya",
    status: "on_hold",
    users: ["Budi", "Sari", "Ahmad"],
    completion: 68,
    description: "Implementasi sistem ERP lengkap untuk mengelola keuangan, HRM, POS, dan CRM.",
    startDate: "2025-10-01",
    endDate: "2026-01-31",
    budget: 450_000_000,
    progress: 68,
    tasks: {
      total: 120,
      done: 82,
    },
    expense: {
      allocated: 450_000_000,
      used: 280_000_000,
    },
    timesheetHours: 430,
    milestones: {
      total: 8,
      completed: 5,
    },
    taskChart: [12, 15, 18, 20, 22, 25, 28],
    timesheetChart: [8, 10, 12, 15, 18, 20, 22],
    dayLeft: 92,
    openTask: 38,
    userAssigned: 3,
  },
  {
    id: 2,
    code: "PRJ-002",
    name: "CRM Upgrade CV Kreatif Digital",
    client: "CV Kreatif Digital",
    status: "not_started",
    users: ["Dewi", "Fauzi"],
    completion: 25,
    description: "Upgrade modul CRM dengan fitur pipeline, automation, dan laporan penjualan.",
    startDate: "2025-11-10",
    endDate: "2026-03-15",
    budget: 220_000_000,
    progress: 25,
    tasks: {
      total: 40,
      done: 10,
    },
    expense: {
      allocated: 220_000_000,
      used: 45_000_000,
    },
    timesheetHours: 96,
    milestones: {
      total: 5,
      completed: 1,
    },
    taskChart: [2, 3, 4, 5, 6, 7, 8],
    timesheetChart: [3, 4, 5, 6, 7, 8, 9],
    dayLeft: 125,
    openTask: 30,
    userAssigned: 2,
  },
  {
    id: 3,
    code: "PRJ-003",
    name: "Website Redesign PT Teknologi",
    client: "PT Teknologi",
    status: "on_hold",
    users: ["Budi", "Sari"],
    completion: 45,
    description: "Redesign website dengan UI/UX modern dan responsive design.",
    startDate: "2025-09-15",
    endDate: "2026-02-28",
    budget: 180_000_000,
    progress: 45,
    tasks: {
      total: 60,
      done: 27,
    },
    expense: {
      allocated: 180_000_000,
      used: 85_000_000,
    },
    timesheetHours: 210,
    milestones: {
      total: 6,
      completed: 3,
    },
    taskChart: [5, 6, 7, 8, 9, 10, 11],
    timesheetChart: [4, 5, 6, 7, 8, 9, 10],
    dayLeft: 165,
    openTask: 33,
    userAssigned: 2,
  },
  {
    id: 4,
    code: "PRJ-004",
    name: "Mobile App Development",
    client: "PT Mobile Solutions",
    status: "in_progress",
    users: ["Ahmad", "Dewi", "Fauzi", "Budi"],
    completion: 75,
    description: "Pengembangan aplikasi mobile untuk iOS dan Android.",
    startDate: "2025-08-01",
    endDate: "2026-05-31",
    budget: 350_000_000,
    progress: 75,
    tasks: {
      total: 150,
      done: 113,
    },
    expense: {
      allocated: 350_000_000,
      used: 240_000_000,
    },
    timesheetHours: 520,
    milestones: {
      total: 10,
      completed: 7,
    },
    taskChart: [20, 22, 24, 26, 28, 30, 32],
    timesheetChart: [15, 17, 19, 21, 23, 25, 27],
    dayLeft: 303,
    openTask: 37,
    userAssigned: 4,
  },
  {
    id: 5,
    code: "PRJ-005",
    name: "Cloud Migration Project",
    client: "PT Cloud Services",
    status: "finished",
    users: ["Sari", "Ahmad"],
    completion: 100,
    description: "Migrasi infrastruktur ke cloud dengan AWS.",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    budget: 500_000_000,
    progress: 100,
    tasks: {
      total: 80,
      done: 80,
    },
    expense: {
      allocated: 500_000_000,
      used: 480_000_000,
    },
    timesheetHours: 650,
    milestones: {
      total: 12,
      completed: 12,
    },
    taskChart: [10, 12, 14, 16, 18, 20, 22],
    timesheetChart: [8, 10, 12, 14, 16, 18, 20],
    dayLeft: 0,
    openTask: 0,
    userAssigned: 2,
  },
] as const

const statusMap: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700 border-none" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-700 border-none" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700 border-none" },
  cancel: { label: "Cancel", color: "bg-red-100 text-red-700 border-none" },
  finished: { label: "Finished", color: "bg-green-100 text-green-700 border-none" },
}

function getStatusClasses(status: string) {
  return statusMap[status]?.color || "bg-slate-100 text-slate-700 border-none"
}

function getStatusLabel(status: string) {
  return statusMap[status]?.label || status
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function ProjectDetailPage() {
  const params = useParams()
  const idParam = params?.id as string
  const id = Number(idParam)
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/projects">Back to Projects</Link>
          </Button>
        </div>
      </div>
    )
  }

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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {project.name}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{project.code}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{project.client}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusClasses(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                  Edit Project
                </Button>
                <Button asChild variant="outline" size="icon" className="h-8 w-8 shadow-none">
                  <Link href="/projects">
                    <IconArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Total Task Card */}
              <Card className="relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-20 opacity-20">
                  <svg width="135" height="80" viewBox="0 0 135 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M74.7692 35C27.8769 35 5.38462 65 0 80H135.692V0C134.923 11.6667 121.662 35 74.7692 35Z" fill="#FF3A6E" />
                  </svg>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-pink-500 flex items-center justify-center">
                      <IconListCheck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">Total Task</div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{project.tasks.total}</span>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Done Task</div>
                          <span className="text-2xl font-bold">{project.tasks.done}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Budget Card */}
              <Card className="relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-20 opacity-20">
                  <svg width="135" height="80" viewBox="0 0 135 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M74.7692 35C27.8769 35 5.38462 65 0 80H135.692V0C134.923 11.6667 121.662 35 74.7692 35Z" fill="#FF3A6E" />
                  </svg>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                      <IconCurrencyDollar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
                      <span className="text-2xl font-bold">
                        Rp {project.budget.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Expense Card */}
              <Card className="relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-20 opacity-20">
                  <svg width="135" height="80" viewBox="0 0 135 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M74.7692 35C27.8769 35 5.38462 65 0 80H135.692V0C134.923 11.6667 121.662 35 74.7692 35Z" fill="#FF3A6E" />
                  </svg>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                      <IconReportMoney className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1">Total Expense</div>
                      <span className="text-2xl font-bold">
                        Rp {project.expense.used.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-12">
              {/* Project Info Card */}
              <Card className="md:col-span-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded border-2 border-primary bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold">
                        {project.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold mb-1">{project.name}</h5>
                      <div className="progress-wrapper">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-muted-foreground">Completed:</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Card className="bg-blue-500 text-white">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-blue-100 mb-1">Start Date</div>
                          <div className="font-semibold">{formatDate(project.startDate)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-100 mb-1">End Date</div>
                          <div className="font-semibold">{formatDate(project.endDate)}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-100 mb-1">Client</div>
                        <div className="font-semibold">{project.client}</div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Task Chart Card */}
              <Card className="md:col-span-4">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <IconClipboardList className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Last 7 days task done</p>
                      <h4 className="text-xl font-bold">{project.taskChart[project.taskChart.length - 1]}</h4>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div id="task_chart" className="h-[60px] mb-4">
                    <Chart
                      options={{
                        chart: {
                          type: "area",
                          height: 60,
                          sparkline: { enabled: true },
                        },
                        colors: ["#ffa21d"],
                        dataLabels: { enabled: false },
                        stroke: { curve: "smooth", width: 2 },
                        tooltip: {
                          followCursor: false,
                          fixed: { enabled: false },
                          x: { show: false },
                          y: {
                            title: { formatter: () => "" },
                          },
                          marker: { show: false },
                        },
                      }}
                      series={[
                        {
                          name: "Tasks",
                          data: project.taskChart,
                        },
                      ]}
                      type="area"
                      height={60}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Day Left</span>
                      <span className="font-medium">{project.dayLeft}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min((project.dayLeft / 365) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Open Task</span>
                      <span className="font-medium">{project.openTask}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(project.openTask / project.tasks.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed Milestone</span>
                      <span className="font-medium">{project.milestones.completed}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(project.milestones.completed / project.milestones.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timesheet Chart Card */}
              <Card className="md:col-span-4">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <IconClockHour4 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Last 7 days hours spent</p>
                      <h4 className="text-xl font-bold">{project.timesheetChart[project.timesheetChart.length - 1]}h</h4>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div id="timesheet_chart" className="h-[60px] mb-4">
                    <Chart
                      options={{
                        chart: {
                          type: "area",
                          height: 60,
                          sparkline: { enabled: true },
                        },
                        colors: ["#ffa21d"],
                        dataLabels: { enabled: false },
                        stroke: { curve: "smooth", width: 2 },
                        tooltip: {
                          followCursor: false,
                          fixed: { enabled: false },
                          x: { show: false },
                          y: {
                            title: { formatter: () => "" },
                          },
                          marker: { show: false },
                        },
                      }}
                      series={[
                        {
                          name: "Hours",
                          data: project.timesheetChart,
                        },
                      ]}
                      type="area"
                      height={60}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total project time spent</span>
                      <span className="font-medium">{project.timesheetHours}h</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min((project.timesheetHours / 1000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Allocated hours on task</span>
                      <span className="font-medium">{project.timesheetHours * 1.2}h</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(((project.timesheetHours * 1.2) / 1500) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">User Assigned</span>
                      <span className="font-medium">{project.userAssigned}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${(project.userAssigned / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Members and Milestones */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Members Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-end mb-3">
                    <Button size="sm" className="h-7 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                      <IconUsers className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {project.users.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {user.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Milestones Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Milestones ({project.milestones.total})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-end mb-3">
                    <Button size="sm" className="h-7 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                      <IconListCheck className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: Math.min(project.milestones.total, 5) }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">Milestone {index + 1}</span>
                            <Badge className="bg-green-100 text-green-700 border-none text-xs">
                              Complete
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 10) + 1} Tasks
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <IconUsers className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
