"use client"

import { useState, useMemo } from 'react'
import Link from "next/link"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EventCalendar } from "@/components/event-calendar"
import { IconCalendarEvent } from "@tabler/icons-react"

interface Task {
  id: number
  title: string
  start: string
  end: string
  projectName?: string
}

const tasks: Task[] = [
  {
    id: 1,
    title: "Setup Database Schema",
    start: "2025-12-01",
    end: "2025-12-10",
    projectName: "Implementasi ERP PT Maju Jaya",
  },
  {
    id: 2,
    title: "Migrasi Data Awal",
    start: "2025-12-05",
    end: "2025-12-20",
    projectName: "Implementasi ERP PT Maju Jaya",
  },
  {
    id: 3,
    title: "Desain Pipeline CRM",
    start: "2025-12-10",
    end: "2025-12-25",
    projectName: "CRM Upgrade CV Kreatif Digital",
  },
  {
    id: 4,
    title: "Implement Authentication",
    start: "2025-12-15",
    end: "2025-12-30",
    projectName: "Website Redesign PT Teknologi",
  },
  {
    id: 5,
    title: "Write API Documentation",
    start: "2025-12-20",
    end: "2026-01-05",
    projectName: "Mobile App Development",
  },
  {
    id: 6,
    title: "Fix Bug in Payment Module",
    start: "2025-12-18",
    end: "2025-12-28",
    projectName: "Implementasi ERP PT Maju Jaya",
  },
  {
    id: 7,
    title: "Optimize Database Queries",
    start: "2026-01-01",
    end: "2026-01-15",
    projectName: "Cloud Migration Project",
  },
  {
    id: 8,
    title: "Create Test Cases",
    start: "2025-12-25",
    end: "2026-01-10",
    projectName: "CRM Upgrade CV Kreatif Digital",
  },
]

// Convert tasks to calendar events format
const convertTasksToEvents = (tasks: Task[]) => {
  return tasks.map((task) => ({
    id: task.id.toString(),
    title: task.title,
    date: task.start,
    time: "00:00",
    type: "meeting" as const,
    description: task.projectName,
  }))
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TaskCalendarPage() {
  const [calendarType, setCalendarType] = useState<string>('local')
  const calendarEvents = useMemo(() => convertTasksToEvents(tasks), [])

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
            <div className="flex items-center justify-end">
              <div className="flex gap-2">
                <Select value={calendarType} onValueChange={setCalendarType}>
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

            <div className="grid gap-4 lg:grid-cols-12">
              {/* Calendar - 8 columns */}
              <Card className="lg:col-span-8">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventCalendar events={calendarEvents} />
                </CardContent>
              </Card>

              {/* Tasks Sidebar - 4 columns */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Tasks</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {tasks.length > 0 ? (
                    <ul className="space-y-3 m-0 p-0 list-none">
                      {tasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-semibold mb-1 truncate">
                              {task.title}
                            </h5>
                            <div className="flex items-center flex-wrap gap-1 text-xs text-muted-foreground">
                              <span>{formatDate(task.start)}</span>
                              <span>to</span>
                              <span>{formatDate(task.end)}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded bg-blue-500 flex items-center justify-center">
                              <IconCalendarEvent className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <h6 className="text-sm font-medium">No Data Found</h6>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

