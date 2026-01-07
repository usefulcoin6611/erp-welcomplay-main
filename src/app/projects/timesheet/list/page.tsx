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
import { IconCalendar, IconPlus, IconSearch } from "@tabler/icons-react"

const timesheets = [
  {
    id: 1,
    project: "Implementasi ERP PT Maju Jaya",
    task: "Setup Chart of Accounts",
    date: "2025-10-02",
    time: "04:30",
    user: "Budi",
  },
  {
    id: 2,
    project: "Implementasi ERP PT Maju Jaya",
    task: "Migrasi Data Awal",
    date: "2025-10-05",
    time: "06:00",
    user: "Sari",
  },
] as const

export default function TimesheetListPage() {
  const totalHours = "10:30"

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
                <h1 className="text-3xl font-bold">Timesheet</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                <IconPlus className="mr-2 h-4 w-4" />
                Add Timesheet
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timesheets.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Timesheet List</CardTitle>
                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search project or task..."
                      className="h-9 pl-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 shadow-none"
                  >
                    <IconCalendar className="mr-2 h-4 w-4" />
                    Week
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheets.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="text-sm">{row.project}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.task}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.date}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.user}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">{row.time}</div>
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

