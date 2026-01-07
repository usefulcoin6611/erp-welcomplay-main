"use client"

import React from "react"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconCalendar, IconFilter } from "@tabler/icons-react"

const tasks = [
  {
    id: 1,
    name: "Setup Chart of Accounts",
    project: "Implementasi ERP PT Maju Jaya",
    startDate: "2025-10-01",
    endDate: "2025-10-10",
    priority: "high",
  },
  {
    id: 2,
    name: "Migrasi Data Awal",
    project: "Implementasi ERP PT Maju Jaya",
    startDate: "2025-10-05",
    endDate: "2025-10-20",
    priority: "medium",
  },
  {
    id: 3,
    name: "Desain Pipeline CRM",
    project: "CRM Upgrade CV Kreatif Digital",
    startDate: "2025-11-01",
    endDate: "2025-11-15",
    priority: "low",
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

export default function TaskCalendarPage() {
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Task Calendar</h1>
              </div>
              <div className="flex gap-2">
                <Select defaultValue="local">
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Calendar Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Calendar</SelectItem>
                    <SelectItem value="google">Google Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[600px] rounded-md border border-dashed flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <IconCalendar className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Calendar view akan ditampilkan di sini
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Menggunakan FullCalendar atau library calendar lainnya
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3 border rounded-md space-y-1 hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{task.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.project}
                            </div>
                          </div>
                          <Badge className={getPriorityClasses(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.startDate} - {task.endDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
