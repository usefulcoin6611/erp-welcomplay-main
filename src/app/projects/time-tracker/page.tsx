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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { IconPlus, IconSearch, IconPhoto, IconTrash } from "@tabler/icons-react"

const timeTrackers = [
  {
    id: 1,
    title: "Setup Chart of Accounts",
    task: "Setup Chart of Accounts",
    project: "Implementasi ERP PT Maju Jaya",
    startTime: "09:00:00",
    endTime: "13:30:00",
    totalTime: "04:30:00",
  },
  {
    id: 2,
    title: "Migrasi Data Awal",
    task: "Migrasi Data Awal",
    project: "Implementasi ERP PT Maju Jaya",
    startTime: "08:00:00",
    endTime: "14:00:00",
    totalTime: "06:00:00",
  },
  {
    id: 3,
    title: "Desain Pipeline CRM",
    task: "Desain Pipeline CRM",
    project: "CRM Upgrade CV Kreatif Digital",
    startTime: "10:00:00",
    endTime: "16:30:00",
    totalTime: "06:30:00",
  },
] as const

export default function TimeTrackerPage() {
  const totalTrackers = timeTrackers.length

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
                <h1 className="text-3xl font-bold">Time Tracker</h1>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Time Tracker List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Total Time</TableHead>
                        <TableHead className="w-[120px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeTrackers.map((tracker) => (
                        <TableRow key={tracker.id}>
                          <TableCell>
                            <div className="text-sm font-medium">{tracker.title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{tracker.task}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{tracker.project}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{tracker.startTime}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{tracker.endTime}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{tracker.totalTime}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none"
                                title="View Screenshot images"
                              >
                                <IconPhoto className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
