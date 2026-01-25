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
import { IconArrowLeft, IconBug, IconCalendar } from "@tabler/icons-react"

const bugs = [
  {
    id: 101,
    project: "Implementasi ERP PT Maju Jaya",
    title: "Error saat posting jurnal",
    description:
      "Saat melakukan posting jurnal penutup, sistem mengembalikan error validasi dan jurnal tidak tercatat.",
    priority: "high",
    status: "Open",
    startDate: "2025-10-05",
    dueDate: "2025-10-08",
  },
  {
    id: 102,
    project: "CRM Upgrade CV Kreatif Digital",
    title: "Pipeline tidak muncul di dashboard",
    description:
      "Widget pipeline di dashboard CRM tidak menampilkan data stage yang sudah dibuat.",
    priority: "medium",
    status: "In Progress",
    startDate: "2025-11-02",
    dueDate: "2025-11-06",
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

function getStatusClasses(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-700 border-none"
    case "In Progress":
      return "bg-yellow-100 text-yellow-700 border-none"
    case "Closed":
      return "bg-green-100 text-green-700 border-none"
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

interface BugDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BugDetailPage({ params }: BugDetailPageProps) {
  const { id: idParam } = await params
  const id = Number(idParam)
  const bug = bugs.find((b) => b.id === id)

  if (!bug) {
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
                  <Link href="/projects/bug/list">
                    <IconArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold leading-tight flex items-center gap-2">
                    <IconBug className="h-5 w-5 text-red-500" />
                    {bug.title}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>BUG-{bug.id}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{bug.project}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityClasses(bug.priority)}>
                  {bug.priority}
                </Badge>
                <Badge className={getStatusClasses(bug.status)}>
                  {bug.status}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Bug Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {bug.description}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1 text-sm">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconCalendar className="h-3.5 w-3.5" />
                        Start Date
                      </div>
                      <div className="font-medium">{bug.startDate}</div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconCalendar className="h-3.5 w-3.5" />
                        Due Date
                      </div>
                      <div className="font-medium">{bug.dueDate}</div>
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
                    Update Status
                  </Button>
                  <Button className="justify-start h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                    Tambah Komentar
                  </Button>
                  <Button className="justify-start h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none">
                    Lihat Lampiran
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

