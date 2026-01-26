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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconArrowLeft, IconCalendar, IconDownload } from "@tabler/icons-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Data mock sesuai dengan Project Report List
const projects = [
  {
    id: 1,
    name: "Implementasi ERP PT Maju Jaya",
    startDate: "2025-10-01",
    endDate: "2026-01-31",
    users: ["Budi", "Sari", "Ahmad"],
    completion: 68,
    status: "on_hold",
    totalMembers: 3,
    tasks: {
      total: 120,
      done: 82,
      priority: {
        high: 15,
        medium: 45,
        low: 60,
      },
      status: {
        todo: 20,
        in_progress: 18,
        done: 82,
      },
    },
    hours: {
      estimated: 500,
      logged: 430,
    },
    milestones: [
      {
        name: "Phase 1: Planning",
        progress: 100,
        cost: 50_000_000,
        status: "complete",
        startDate: "2025-10-01",
        endDate: "2025-10-15",
      },
      {
        name: "Phase 2: Development",
        progress: 75,
        cost: 150_000_000,
        status: "incomplete",
        startDate: "2025-10-16",
        endDate: "2026-01-15",
      },
      {
        name: "Phase 3: Testing",
        progress: 0,
        cost: 50_000_000,
        status: "incomplete",
        startDate: "2026-01-16",
        endDate: "2026-01-31",
      },
    ],
    userStats: [
      {
        name: "Budi",
        assignedTasks: 40,
        doneTasks: 28,
        loggedHours: 150,
      },
      {
        name: "Sari",
        assignedTasks: 35,
        doneTasks: 25,
        loggedHours: 140,
      },
      {
        name: "Ahmad",
        assignedTasks: 45,
        doneTasks: 29,
        loggedHours: 140,
      },
    ],
    taskList: [
      {
        id: 1,
        name: "Setup Database",
        milestone: "Phase 1: Planning",
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        assignedTo: ["Budi"],
        loggedHours: 40,
        priority: "high",
        stage: "Done",
      },
      {
        id: 2,
        name: "Design UI/UX",
        milestone: "Phase 1: Planning",
        startDate: "2025-10-06",
        endDate: "2025-10-15",
        assignedTo: ["Sari"],
        loggedHours: 60,
        priority: "medium",
        stage: "Done",
      },
      {
        id: 3,
        name: "Develop Core Module",
        milestone: "Phase 2: Development",
        startDate: "2025-10-16",
        endDate: "2025-12-15",
        assignedTo: ["Ahmad", "Budi"],
        loggedHours: 200,
        priority: "high",
        stage: "In Progress",
      },
    ],
  },
  {
    id: 2,
    name: "CRM Upgrade CV Kreatif Digital",
    startDate: "2025-11-10",
    endDate: "2026-03-15",
    users: ["Dewi", "Fauzi"],
    completion: 25,
    status: "not_started",
    totalMembers: 2,
    tasks: {
      total: 40,
      done: 10,
      priority: {
        high: 5,
        medium: 15,
        low: 20,
      },
      status: {
        todo: 15,
        in_progress: 15,
        done: 10,
      },
    },
    hours: {
      estimated: 200,
      logged: 96,
    },
    milestones: [
      {
        name: "Planning Phase",
        progress: 50,
        cost: 30_000_000,
        status: "incomplete",
        startDate: "2025-11-10",
        endDate: "2025-12-10",
      },
    ],
    userStats: [
      {
        name: "Dewi",
        assignedTasks: 20,
        doneTasks: 5,
        loggedHours: 48,
      },
      {
        name: "Fauzi",
        assignedTasks: 20,
        doneTasks: 5,
        loggedHours: 48,
      },
    ],
    taskList: [
      {
        id: 1,
        name: "Requirements Analysis",
        milestone: "Planning Phase",
        startDate: "2025-11-10",
        endDate: "2025-11-20",
        assignedTo: ["Dewi"],
        loggedHours: 30,
        priority: "high",
        stage: "In Progress",
      },
    ],
  },
  {
    id: 3,
    name: "Website Redesign PT Teknologi",
    startDate: "2025-09-15",
    endDate: "2026-02-28",
    users: ["Budi", "Sari", "Ahmad", "Dewi"],
    completion: 45,
    status: "on_hold",
    totalMembers: 4,
    tasks: {
      total: 60,
      done: 27,
      priority: {
        high: 8,
        medium: 22,
        low: 30,
      },
      status: {
        todo: 18,
        in_progress: 15,
        done: 27,
      },
    },
    hours: {
      estimated: 300,
      logged: 210,
    },
    milestones: [
      {
        name: "Design Phase",
        progress: 80,
        cost: 40_000_000,
        status: "incomplete",
        startDate: "2025-09-15",
        endDate: "2025-10-30",
      },
    ],
    userStats: [
      {
        name: "Budi",
        assignedTasks: 15,
        doneTasks: 7,
        loggedHours: 50,
      },
      {
        name: "Sari",
        assignedTasks: 15,
        doneTasks: 7,
        loggedHours: 55,
      },
      {
        name: "Ahmad",
        assignedTasks: 15,
        doneTasks: 7,
        loggedHours: 52,
      },
      {
        name: "Dewi",
        assignedTasks: 15,
        doneTasks: 6,
        loggedHours: 53,
      },
    ],
    taskList: [],
  },
  {
    id: 4,
    name: "Mobile App Development",
    startDate: "2025-08-01",
    endDate: "2026-05-31",
    users: ["Ahmad", "Dewi", "Fauzi"],
    completion: 75,
    status: "in_progress",
    totalMembers: 3,
    tasks: {
      total: 150,
      done: 113,
      priority: {
        high: 20,
        medium: 60,
        low: 70,
      },
      status: {
        todo: 12,
        in_progress: 25,
        done: 113,
      },
    },
    hours: {
      estimated: 600,
      logged: 520,
    },
    milestones: [
      {
        name: "iOS Development",
        progress: 90,
        cost: 120_000_000,
        status: "incomplete",
        startDate: "2025-08-01",
        endDate: "2026-02-28",
      },
      {
        name: "Android Development",
        progress: 60,
        cost: 100_000_000,
        status: "incomplete",
        startDate: "2025-10-01",
        endDate: "2026-04-30",
      },
    ],
    userStats: [
      {
        name: "Ahmad",
        assignedTasks: 50,
        doneTasks: 38,
        loggedHours: 180,
      },
      {
        name: "Dewi",
        assignedTasks: 50,
        doneTasks: 38,
        loggedHours: 170,
      },
      {
        name: "Fauzi",
        assignedTasks: 50,
        doneTasks: 37,
        loggedHours: 170,
      },
    ],
    taskList: [],
  },
  {
    id: 5,
    name: "Cloud Migration Project",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    users: ["Sari", "Ahmad"],
    completion: 100,
    status: "finished",
    totalMembers: 2,
    tasks: {
      total: 80,
      done: 80,
      priority: {
        high: 10,
        medium: 30,
        low: 40,
      },
      status: {
        todo: 0,
        in_progress: 0,
        done: 80,
      },
    },
    hours: {
      estimated: 700,
      logged: 650,
    },
    milestones: [
      {
        name: "Migration Phase 1",
        progress: 100,
        cost: 150_000_000,
        status: "complete",
        startDate: "2025-01-01",
        endDate: "2025-04-30",
      },
      {
        name: "Migration Phase 2",
        progress: 100,
        cost: 150_000_000,
        status: "complete",
        startDate: "2025-05-01",
        endDate: "2025-08-31",
      },
      {
        name: "Migration Phase 3",
        progress: 100,
        cost: 200_000_000,
        status: "complete",
        startDate: "2025-09-01",
        endDate: "2025-12-31",
      },
    ],
    userStats: [
      {
        name: "Sari",
        assignedTasks: 40,
        doneTasks: 40,
        loggedHours: 325,
      },
      {
        name: "Ahmad",
        assignedTasks: 40,
        doneTasks: 40,
        loggedHours: 325,
      },
    ],
    taskList: [],
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

export default function ProjectReportDetailPage() {
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
            <Link href="/project_report">Back to Project Reports</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Chart data
  const milestoneProgress = project.milestones.reduce(
    (acc, m) => acc + m.progress,
    0
  ) / (project.milestones.length || 1)

  const taskPriorityData = [
    project.tasks.priority.high,
    project.tasks.priority.medium,
    project.tasks.priority.low,
  ]
  const taskPriorityLabels = ["High", "Medium", "Low"]

  const taskStatusData = [
    project.tasks.status.todo,
    project.tasks.status.in_progress,
    project.tasks.status.done,
  ]
  const taskStatusLabels = ["Todo", "In Progress", "Done"]

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
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shadow-none"
                >
                  <Link href="/project_report">
                    <IconArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold leading-tight">
                    {project.name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <IconCalendar className="h-3.5 w-3.5" />
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusClasses(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                  <IconDownload className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Overview and Milestone Progress */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Overview Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overview</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Project Name
                        </div>
                        <div className="text-sm font-normal">{project.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Project Status
                        </div>
                        <Badge className={getStatusClasses(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Start Date
                        </div>
                        <div className="text-sm font-normal">
                          {formatDate(project.startDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          End Date
                        </div>
                        <div className="text-sm font-normal">
                          {formatDate(project.endDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Total Members
                        </div>
                        <div className="text-sm font-normal">
                          {project.totalMembers}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg
                          className="transform -rotate-90 w-32 h-32"
                          viewBox="0 0 36 36"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray={`${project.completion}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {project.completion}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestone Progress Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Milestone Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                  <div id="milestone-chart" className="flex items-center justify-center min-h-[300px] py-4">
                    <Chart
                      options={{
                        chart: {
                          height: 300,
                          type: "radialBar",
                          offsetY: -20,
                        },
                        plotOptions: {
                          radialBar: {
                            startAngle: -90,
                            endAngle: 90,
                            track: {
                              background: "#e7e7e7",
                              strokeWidth: "97%",
                              margin: 5,
                            },
                            dataLabels: {
                              name: {
                                show: true,
                                fontSize: "14px",
                                fontWeight: 500,
                                offsetY: -10,
                              },
                              value: {
                                show: true,
                                fontSize: "20px",
                                fontWeight: 700,
                                offsetY: -50,
                                formatter: function (val: number) {
                                  return val + "%"
                                },
                              },
                            },
                          },
                        },
                        colors: ["#51459d"],
                        labels: ["Progress"],
                        grid: {
                          padding: {
                            top: -10,
                          },
                        },
                      }}
                      series={[Math.round(milestoneProgress)]}
                      type="radialBar"
                      height={300}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Task Priority */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Task Priority</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                  <div id="chart_priority" className="h-[210px]">
                    <Chart
                      options={{
                        chart: {
                          height: 210,
                          type: "bar",
                        },
                        colors: ["#6fd943", "#ff3a6e", "#3ec9d6"],
                        plotOptions: {
                          bar: {
                            columnWidth: "50%",
                            distributed: true,
                          },
                        },
                        dataLabels: {
                          enabled: false,
                        },
                        legend: {
                          show: true,
                        },
                        xaxis: {
                          categories: taskPriorityLabels,
                        },
                      }}
                      series={[
                        {
                          data: taskPriorityData,
                        },
                      ]}
                      type="bar"
                      height={210}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Task Status */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Task Status</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                  <div id="chart" className="h-[210px]">
                    <Chart
                      options={{
                        chart: {
                          width: 380,
                          type: "pie",
                        },
                        colors: ["#6fd943", "#ff3a6e", "#3ec9d6"],
                        labels: taskStatusLabels,
                        responsive: [
                          {
                            breakpoint: 350,
                            options: {
                              chart: {
                                width: 100,
                              },
                              legend: {
                                position: "bottom",
                              },
                            },
                          },
                        ],
                      }}
                      series={taskStatusData}
                      type="pie"
                      height={210}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hours Estimation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hours Estimation</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-0 pb-4">
                  <div id="chart-hours" className="h-[210px]">
                    <Chart
                      options={{
                        chart: {
                          height: 210,
                          type: "bar",
                        },
                        colors: ["#963aff", "#ffa21d"],
                        plotOptions: {
                          bar: {
                            horizontal: true,
                            columnWidth: "30%",
                            distributed: true,
                          },
                        },
                        dataLabels: {
                          enabled: false,
                        },
                        legend: {
                          show: true,
                        },
                        xaxis: {
                          categories: ["Estimated Hours", "Logged Hours"],
                        },
                      }}
                      series={[
                        {
                          data: [project.hours.estimated, project.hours.logged],
                        },
                      ]}
                      type="bar"
                      height={210}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users and Milestones */}
            <div className="grid gap-4 md:grid-cols-5">
              {/* Users Table */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3 font-medium">Name</TableHead>
                          <TableHead className="px-4 py-3 font-medium">
                            Assigned Tasks
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium">Done Tasks</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Logged Hours</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.userStats.map((user, index) => (
                          <TableRow key={index}>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-normal">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {user.assignedTasks}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {user.doneTasks}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {user.loggedHours}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones Table */}
              <Card className="md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Milestones</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3 font-medium">Name</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Progress</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Cost</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Status</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Start Date</TableHead>
                          <TableHead className="px-4 py-3 font-medium">End Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.milestones.map((milestone, index) => (
                          <TableRow key={index}>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {milestone.name}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                  <div
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${milestone.progress}%` }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {milestone.progress}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              Rp {milestone.cost.toLocaleString("id-ID")}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                className={
                                  milestone.status === "complete"
                                    ? "bg-green-100 text-green-700 border-none"
                                    : "bg-yellow-100 text-yellow-700 border-none"
                                }
                              >
                                {milestone.status === "complete"
                                  ? "Complete"
                                  : "Incomplete"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {formatDate(milestone.startDate)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {formatDate(milestone.endDate)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tasks Table */}
            {project.taskList.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3 font-medium">Task Name</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Milestone</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Start Date</TableHead>
                          <TableHead className="px-4 py-3 font-medium">End Date</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Assigned to</TableHead>
                          <TableHead className="px-4 py-3 font-medium">
                            Total Logged Hours
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium">Priority</TableHead>
                          <TableHead className="px-4 py-3 font-medium">Stage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.taskList.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell className="px-4 py-3">
                              <Link
                                href="#"
                                className="text-sm font-normal text-primary hover:underline"
                              >
                                {task.name}
                              </Link>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {task.milestone}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {formatDate(task.startDate)}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {formatDate(task.endDate)}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex -space-x-2">
                                {task.assignedTo.slice(0, 3).map((user, idx) => (
                                  <Avatar key={idx} className="h-6 w-6 border-2 border-white">
                                    <AvatarFallback className="text-xs">
                                      {user.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {task.loggedHours}
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge
                                className={
                                  task.priority === "high"
                                    ? "bg-red-100 text-red-700 border-none"
                                    : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-700 border-none"
                                    : "bg-blue-100 text-blue-700 border-none"
                                }
                              >
                                {task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-sm font-normal">
                              {task.stage}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
