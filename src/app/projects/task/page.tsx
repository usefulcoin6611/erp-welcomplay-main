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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPlus, IconSearch, IconLayoutKanban } from "@tabler/icons-react"

const tasks = [
  {
    id: 1,
    projectId: 1,
    project: "Implementasi ERP PT Maju Jaya",
    name: "Setup Chart of Accounts",
    stage: "To Do",
    priority: "high",
    milestone: "Analisis Kebutuhan",
    estimatedHrs: 8,
    startDate: "2025-10-01",
    dueDate: "2025-10-10",
    assignTo: ["Budi", "Sari"],
  },
  {
    id: 2,
    projectId: 1,
    project: "Implementasi ERP PT Maju Jaya",
    name: "Migrasi Data Awal",
    stage: "In Progress",
    priority: "medium",
    milestone: "Go-live Finance",
    estimatedHrs: 16,
    startDate: "2025-10-05",
    dueDate: "2025-10-20",
    assignTo: ["Ahmad"],
  },
  {
    id: 3,
    projectId: 2,
    project: "CRM Upgrade CV Kreatif Digital",
    name: "Desain Pipeline CRM",
    stage: "Review",
    priority: "low",
    milestone: null,
    estimatedHrs: 4,
    startDate: "2025-11-01",
    dueDate: "2025-11-25",
    assignTo: ["Dewi"],
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

export default function ProjectTaskPage() {
  const total = tasks.length

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
                <h1 className="text-3xl font-bold">Project Tasks</h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 shadow-none"
                >
                  <IconLayoutKanban className="mr-2 h-4 w-4" />
                  Taskboard
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Create Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Task</DialogTitle>
                      <DialogDescription>
                        Tambahkan task baru untuk project sesuai modul Project Task ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="taskName">
                          Task Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="taskName"
                          placeholder="Setup Chart of Accounts"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="milestone">Milestone</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Milestone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Select Milestone</SelectItem>
                              <SelectItem value="1">Analisis Kebutuhan</SelectItem>
                              <SelectItem value="2">Go-live Finance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="stage">
                            Stage <span className="text-red-500">*</span>
                          </Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">To Do</SelectItem>
                              <SelectItem value="2">In Progress</SelectItem>
                              <SelectItem value="3">Review</SelectItem>
                              <SelectItem value="4">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter Description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="estimatedHrs">
                            Estimated Hours <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="estimatedHrs"
                            type="number"
                            placeholder="8"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            allocated total 0 hrs in other tasks
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="priority">
                            Priority <span className="text-red-500">*</span>
                          </Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input id="startDate" type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dueDate">End Date</Label>
                          <Input id="dueDate" type="date" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Task Members</Label>
                        <p className="text-xs text-muted-foreground">
                          Below users are assigned in your project.
                        </p>
                        <div className="space-y-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                          {["Budi Santoso", "Sari Wijaya", "Ahmad Fauzi"].map(
                            (user, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 hover:bg-accent rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {user.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{user}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.toLowerCase().replace(" ", ".")}@example.com
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs shadow-none"
                                >
                                  Add
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" className="shadow-none">
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-600 shadow-none"
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    High Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter((t) => t.priority === "high").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter((t) => t.stage === "In Progress").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Task List</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search tasks..." className="h-9 pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Estimated Hours</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div className="space-y-0.5">
                              <Link
                                href={`/projects/task/${task.id}`}
                                className="text-sm font-semibold text-primary hover:underline"
                              >
                                {task.name}
                              </Link>
                              <div className="text-xs text-muted-foreground">
                                {task.startDate && task.dueDate
                                  ? `${task.startDate} - ${task.dueDate}`
                                  : "No dates"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/projects/project/${task.projectId}`}
                              className="text-sm hover:underline"
                            >
                              {task.project}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {task.milestone || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{task.stage}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityClasses(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{task.estimatedHrs} hrs</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{task.dueDate}</span>
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

