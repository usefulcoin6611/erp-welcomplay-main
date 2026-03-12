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
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconSearch } from "@tabler/icons-react"

const timesheetReports = [
  {
    id: 1,
    project: "Implementasi ERP PT Maju Jaya",
    task: "Setup Chart of Accounts",
    week: "2025-10-01 - 2025-10-07",
    totalTime: "12:30",
  },
  {
    id: 2,
    project: "CRM Upgrade CV Kreatif Digital",
    task: "Desain Pipeline CRM",
    week: "2025-11-01 - 2025-11-07",
    totalTime: "08:15",
  },
] as const

export default function TimesheetReportPage() {
  const total = timesheetReports.length

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
            <div>
              <h1 className="text-3xl font-bold">Timesheet Reports</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Rows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Timesheet Summary</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search project or task..." className="h-9 pl-9 bg-gray-50 border-0 shadow-none focus-visible:border-0 focus-visible:ring-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Week</TableHead>
                        <TableHead className="text-right">
                          Total Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheetReports.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="text-sm">{row.project}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.task}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.week}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">
                              {row.totalTime}
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

