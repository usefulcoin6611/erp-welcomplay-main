"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
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
  id: string
  title: string
  start: string
  end: string
  projectId: string
  projectName: string
}

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
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    let ignore = false

    async function loadCalendarTasks() {
      try {
        const res = await fetch("/api/projects/calendar")
        if (!res.ok) {
          throw new Error("Gagal memuat data kalender")
        }
        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []
        if (!ignore) {
          setTasks(
            data.map((t: any) => ({
              id: String(t.id),
              title: String(t.title ?? ""),
              start: String(t.start ?? ""),
              end: String(t.end ?? ""),
              projectId: String(t.projectId ?? ""),
              projectName: String(t.projectName ?? ""),
            })),
          )
        }
      } catch {
        if (!ignore) {
          setTasks([])
        }
      }
    }

    loadCalendarTasks()

    return () => {
      ignore = true
    }
  }, [])

  const calendarEvents = useMemo(() => convertTasksToEvents(tasks), [tasks])

  return (
    <>
            {/* Title Page */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Kalender</CardTitle>
                  <CardDescription>
                    Lihat dan kelola jadwal tugas, event, dan kegiatan Anda dalam kalender. Pantau deadline dan acara penting dalam satu tampilan.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Calendar Type Selector */}
                  <Select value={calendarType} onValueChange={setCalendarType}>
                    <SelectTrigger className="w-[180px] h-7 shadow-none">
                      <SelectValue placeholder="Calendar Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Calendar</SelectItem>
                      <SelectItem value="google">Google Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

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
    </>
  )
}


