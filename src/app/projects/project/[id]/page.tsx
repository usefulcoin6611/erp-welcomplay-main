"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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
  IconArrowLeft,
  IconCalendar,
  IconClockHour4,
  IconUsers,
  IconListCheck,
  IconCurrencyDollar,
  IconReportMoney,
  IconClipboardList,
  IconBug,
  IconListDetails,
  IconClockRecord,
  IconReportAnalytics,
  IconShare3,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react"
import dynamic from "next/dynamic"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

type ProjectDetail = {
  id: string
  code: string
  name: string
  client: string
  status: string
  users: string[]
  completion: number
  description: string
  startDate: string
  endDate: string
  budget: number
  progress: number
  tasks: {
    total: number
    done: number
  }
  expense: {
    allocated: number
    used: number
  }
  timesheetHours: number
  milestones: {
    total: number
    completed: number
  }
  taskChart: (number | null)[]
  timesheetChart: (number | null)[]
  dayLeft: number
  openTask: number
  userAssigned: number
  activityLog?: {
    user: string
    type: string
    remark: string
    time: string
  }[]
  attachments?: {
    name: string
    size: string
  }[]
}

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
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let ignore = false

    async function loadProject() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`/api/projects/${encodeURIComponent(idParam)}`)

        if (!res.ok) {
          if (res.status === 404) {
            if (!ignore) {
              setProject(null)
            }
            setLoading(false)
            return
          }
          throw new Error("Gagal memuat detail project")
        }

        const json = await res.json()
        const data = json.data

        if (!ignore && data) {
          const base: ProjectDetail = {
            id: String(data.id),
            code: String(data.id),
            name: String(data.name),
            client: data.clientName ? String(data.clientName) : "",
            status: String(data.status),
            users: Array.isArray(data.users) ? data.users : [],
            completion: typeof data.completion === "number" ? data.completion : 0,
            description: data.description ?? "",
            startDate: data.startDate ?? "",
            endDate: data.endDate ?? "",
            budget: typeof data.budget === "number" ? data.budget : 0,
            progress: typeof data.completion === "number" ? data.completion : 0,
            tasks: {
              total: 0,
              done: 0,
            },
            expense: {
              allocated: typeof data.budget === "number" ? data.budget : 0,
              used: 0,
            },
            timesheetHours: 0,
            milestones: {
              total: 0,
              completed: 0,
            },
            taskChart: [0, 0, 0, 0, 0, 0, 0],
            timesheetChart: [0, 0, 0, 0, 0, 0, 0],
            dayLeft: 0,
            openTask: 0,
            userAssigned: Array.isArray(data.users) ? data.users.length : 0,
            activityLog: [],
            attachments: [],
          }

          setProject(base)
        }
      } catch (e: any) {
        if (!ignore) {
          setError(e.message || "Terjadi kesalahan saat memuat detail project")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    if (idParam) {
      loadProject()
    }

    return () => {
      ignore = true
    }
  }, [idParam])

  if (loading) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-muted-foreground">
        <p>Memuat detail project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-muted-foreground">
        <h1 className="text-lg font-semibold mb-2">Gagal memuat project</h1>
        <p className="mb-4">{error}</p>
        <Button asChild variant="outline" size="sm" className="shadow-none">
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-muted-foreground">
        <h1 className="text-lg font-semibold mb-2">Project Not Found</h1>
        <p className="mb-4">
          The project you're looking for doesn't exist.
        </p>
        <Button asChild variant="outline" size="sm" className="shadow-none">
          <Link href="/projects">Back to Projects</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4">
        <Card className={CARD_STYLE}>
          <CardHeader className="px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg font-semibold">
                  {project.name}
                </CardTitle>
                <Badge className={getStatusClasses(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <span>{project.code}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>{project.client}</span>
                {project.startDate && project.endDate && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="inline-flex items-center gap-1">
                      <IconCalendar className="h-3.5 w-3.5" />
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-gray-50 hover:bg-gray-100 border-gray-200"
                >
                  <Link href="/projects">
                    <IconArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/projects/task">
                    <IconClipboardList className="h-4 w-4 mr-1" />
                    Task
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/time-tracker">
                    <IconClockRecord className="h-4 w-4 mr-1" />
                    Tracker
                  </Link>
                </Button>
                <Button
                  variant="blue"
                  size="sm"
                  className="h-8 px-4 shadow-none"
                >
                  Edit Project
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/projects/setup">
                    <IconShare3 className="h-4 w-4 mr-1" />
                    Shared Settings
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/calendar">
                    <IconCalendar className="h-4 w-4 mr-1" />
                    Gantt Chart
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/accounting/purchases?tab=expense">
                    <IconCurrencyDollar className="h-4 w-4 mr-1" />
                    Expense
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/timesheet-list">
                    <IconClockHour4 className="h-4 w-4 mr-1" />
                    Timesheet
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/bugs-report">
                    <IconBug className="h-4 w-4 mr-1" />
                    Bug Report
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  <Link href="/project_report">
                    <IconReportAnalytics className="h-4 w-4 mr-1" />
                    Report
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 mt-4">
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
                      series={
                        [
                          {
                            name: "Tasks",
                            data: project.taskChart ?? [],
                          },
                        ] as any
                      }
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
                      series={
                        [
                          {
                            name: "Hours",
                            data: project.timesheetChart ?? [],
                          },
                        ] as any
                      }
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

            <div className="grid gap-4 md:grid-cols-2">
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium">Activity Log</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Activity log of this project
                  </p>
                </CardHeader>
                <CardContent className="max-h-72 overflow-y-auto space-y-2 pt-2">
                  {project.activityLog && project.activityLog.length > 0 ? (
                    project.activityLog.map((a, index) => (
                      <div key={index} className="border rounded-md px-3 py-2 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                            <AvatarFallback className="text-xs">
                              {a.user?.charAt(0) ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-medium truncate">{a.type}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {a.remark}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {a.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">
                      Belum ada aktivitas.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium">Attachments</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Attachment that uploaded in this project
                  </p>
                </CardHeader>
                <CardContent className="pt-2">
                  {project.attachments && project.attachments.length > 0 ? (
                    <ul className="space-y-2 max-h-72 overflow-y-auto">
                      {project.attachments.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-muted-foreground">
                              {file.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700"
                            >
                              <IconDownload className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <IconTrash className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">
                      Belum ada lampiran.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
    </div>
  )
}
