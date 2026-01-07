import React from "react"
import Link from "next/link"
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
import { IconDownload, IconSearch } from "@tabler/icons-react"

const projectReports = [
  {
    id: 1,
    project: "Implementasi ERP PT Maju Jaya",
    status: "In Progress",
    tasksDone: 82,
    tasksTotal: 120,
    loggedHours: 430,
  },
  {
    id: 2,
    project: "CRM Upgrade CV Kreatif Digital",
    status: "Planning",
    tasksDone: 10,
    tasksTotal: 40,
    loggedHours: 96,
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
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

export default function ProjectReportPage() {
  const totalProjects = projectReports.length
  const totalHours = projectReports.reduce((sum, p) => sum + p.loggedHours, 0)

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
                <h1 className="text-3xl font-bold">Project Reports</h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 shadow-none"
              >
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProjects}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Logged Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours}h</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Project Performance</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search project..." className="h-9 pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead className="text-right">
                          Logged Hours
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectReports.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Link
                              href={`/projects/project/${row.id}`}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              {row.project}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusClasses(row.status)}>
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {row.tasksDone}/{row.tasksTotal}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">
                              {row.loggedHours}h
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

