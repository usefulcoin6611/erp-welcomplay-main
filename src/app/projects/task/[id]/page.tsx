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
import { IconArrowLeft, IconCalendar, IconFlag3 } from "@tabler/icons-react"

const tasks = [
  {
    id: 1,
    projectId: 1,
    project: "Implementasi ERP PT Maju Jaya",
    name: "Setup Chart of Accounts",
    stage: "To Do",
    priority: "high",
    estimatedHrs: 24,
    startDate: "2025-10-01",
    endDate: "2025-10-10",
    description:
      "Menyusun struktur Chart of Accounts dan mapping akun awal sesuai kebutuhan perusahaan.",
  },
  {
    id: 2,
    projectId: 1,
    project: "Implementasi ERP PT Maju Jaya",
    name: "Migrasi Data Awal",
    stage: "In Progress",
    priority: "medium",
    estimatedHrs: 40,
    startDate: "2025-10-05",
    endDate: "2025-10-20",
    description:
      "Migrasi saldo awal, daftar pelanggan, vendor, dan produk ke sistem ERP.",
  },
] as const

function getPriorityClasses(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-none"
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-none"
    case "low":
      return "bg-green-100 text-green-700 border-none"
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

interface TaskDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id: idParam } = await params
  const id = Number(idParam)
  const task = tasks.find((t) => t.id === id)

  if (!task) {
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
                  <Link href="/projects/task">
                    <IconArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold leading-tight">
                    {task.name}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>Task #{task.id}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Link
                      href={`/projects/project/${task.projectId}`}
                      className="hover:underline"
                    >
                      {task.project}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityClasses(task.priority)}>
                  {task.priority}
                </Badge>
                <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                  Edit Task
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Task Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 text-sm">
                      <div className="text-xs text-muted-foreground">
                        Stage
                      </div>
                      <div className="font-medium">{task.stage}</div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-xs text-muted-foreground">
                        Estimated Hours
                      </div>
                      <div className="font-medium">{task.estimatedHrs}h</div>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 text-sm">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconCalendar className="h-3.5 w-3.5" />
                        Start Date
                      </div>
                      <div className="font-medium">{task.startDate}</div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconCalendar className="h-3.5 w-3.5" />
                        End Date
                      </div>
                      <div className="font-medium">{task.endDate}</div>
                    </div>
                  </div>
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
                    Tandai Selesai
                  </Button>
                  <Button className="justify-start h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                    Tambah Komentar
                  </Button>
                  <Button className="justify-start h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                    Lihat Timesheet Task
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

