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

const taskReports = [
  {
    id: 1,
    project: "Implementasi ERP PT Maju Jaya",
    name: "Setup Chart of Accounts",
    stage: "Done",
    priority: "high",
  },
  {
    id: 2,
    project: "CRM Upgrade CV Kreatif Digital",
    name: "Desain Pipeline CRM",
    stage: "In Progress",
    priority: "medium",
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

export default function TaskReportPage() {
  const total = taskReports.length

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
              <h1 className="text-3xl font-bold">Task Reports</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Task List</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search tasks..." className="h-9 pl-9 bg-gray-50 border-0 shadow-none focus-visible:border-0 focus-visible:ring-0" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskReports.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="text-sm font-medium">{row.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.project}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{row.stage}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityClasses(row.priority)}>
                              {row.priority}
                            </Badge>
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

