import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
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
import { IconArrowLeft, IconCalendar, IconClockHour4 } from "@tabler/icons-react"

const projects = [
  {
    id: 1,
    code: "PRJ-001",
    name: "Implementasi ERP PT Maju Jaya",
    client: "PT Maju Jaya",
    status: "In Progress",
    startDate: "2025-10-01",
    endDate: "2026-01-31",
    budget: 450_000_000,
    progress: 68,
    description:
      "Implementasi sistem ERP lengkap untuk mengelola keuangan, HRM, POS, dan CRM.",
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
  },
  {
    id: 2,
    code: "PRJ-002",
    name: "CRM Upgrade CV Kreatif Digital",
    client: "CV Kreatif Digital",
    status: "Planning",
    startDate: "2025-11-10",
    endDate: "2026-03-15",
    budget: 220_000_000,
    progress: 25,
    description:
      "Upgrade modul CRM dengan fitur pipeline, automation, dan laporan penjualan.",
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
  },
] as const

function getStatusClasses(status: string) {
  switch (status) {
    case "In Progress":
      return "bg-blue-100 text-blue-700 border-none"
    case "Planning":
      return "bg-yellow-100 text-yellow-700 border-none"
    case "Completed":
      return "bg-green-100 text-green-700 border-none"
    case "On Hold":
      return "bg-gray-100 text-gray-700 border-none"
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

interface ProjectDetailPageProps {
  params: { id: string }
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const id = Number(params.id)
  const project = projects.find((p) => p.id === id)

  if (!project) {
    notFound()
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shadow-none"
                >
                  <Link href="/projects/project/list">
                    <IconArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold leading-tight">
                    {project.name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{project.code}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{project.client}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="inline-flex items-center gap-1">
                      <IconCalendar className="h-3.5 w-3.5" />
                      {project.startDate} - {project.endDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusClasses(project.status)}>
                  {project.status}
                </Badge>
                <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                  Edit Project
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {project.tasks.done}/{project.tasks.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Task yang sudah selesai dari total task project.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 shadow-none"
                  >
                    <Link href="/projects/task">Lihat Taskboard</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Time Spent
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconClockHour4 className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">
                      {project.timesheetHours}h
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total jam timesheet yang tercatat untuk project ini.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 shadow-none"
                  >
                    <Link href="/projects/timesheet/list">
                      Lihat Timesheet
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Budget vs Expense
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Allocated
                      </div>
                      <div className="text-lg font-semibold">
                        Rp{" "}
                        {project.expense.allocated.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Used
                      </div>
                      <div className="text-lg font-semibold">
                        Rp {project.expense.used.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          (project.expense.used / project.expense.allocated) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {project.milestones.completed}/
                    {project.milestones.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ringkasan penyelesaian milestone utama project.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 shadow-none"
                  >
                    <Link href="/projects/milestone">
                      Kelola Milestone
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button className="justify-start h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                    Tambah Task
                  </Button>
                  <Button className="justify-start h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                    Tambah Timesheet
                  </Button>
                  <Button className="justify-start h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                    Lihat Laporan Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

