import React from "react"
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

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

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
    <>
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 space-y-1 flex-1">
            <CardTitle className="text-2xl font-semibold">Project Reports</CardTitle>
            <CardDescription>
              Ringkasan performa project: status, task, dan jam kerja.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
          >
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={CARD_STYLE}>
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card className={CARD_STYLE}>
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-medium">Total Logged Hours</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold">{totalHours}h</div>
          </CardContent>
        </Card>
      </div>

      <Card className={CARD_STYLE}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-3.5">
          <CardTitle>Project Performance</CardTitle>
          <div className="relative w-full max-w-xs">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input placeholder="Search project..." className="h-9 pl-9 bg-gray-50 border-0 shadow-none focus-visible:border-0 focus-visible:ring-0" />
          </div>
        </CardHeader>
        <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Project</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                        <TableHead className="px-6">Tasks</TableHead>
                        <TableHead className="text-right px-6">
                          Logged Hours
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectReports.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="px-6">
                            <Link
                              href={`/projects/project/${row.id}`}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              {row.project}
                            </Link>
                          </TableCell>
                          <TableCell className="px-6">
                            <Badge className={getStatusClasses(row.status)}>
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">
                              {row.tasksDone}/{row.tasksTotal}
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-6">
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
    </>
  )
}

