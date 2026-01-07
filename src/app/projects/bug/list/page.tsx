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
import { IconPlus, IconSearch, IconGridDots, IconPencil, IconTrash } from "@tabler/icons-react"

const bugs = [
  {
    id: 101,
    bugId: "BUG-101",
    project: "Implementasi ERP PT Maju Jaya",
    title: "Error saat posting jurnal",
    priority: "high" as const,
    status: "Open" as const,
    startDate: "2025-10-05",
    dueDate: "2025-10-08",
    assignTo: "Budi Santoso",
    createdBy: "Sari Wijaya",
  },
  {
    id: 102,
    bugId: "BUG-102",
    project: "CRM Upgrade CV Kreatif Digital",
    title: "Pipeline tidak muncul di dashboard",
    priority: "medium" as const,
    status: "In Progress" as const,
    startDate: "2025-11-02",
    dueDate: "2025-11-06",
    assignTo: "Ahmad Fauzi",
    createdBy: "Dewi Lestari",
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

function getStatusClasses(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-700 border-none"
    case "In Progress":
      return "bg-yellow-100 text-yellow-700 border-none"
    case "Closed":
      return "bg-green-100 text-green-700 border-none"
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

export default function BugListPage() {
  const total = bugs.length

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
                <h1 className="text-3xl font-bold">Bug Report</h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 shadow-none"
                >
                  <IconGridDots className="mr-2 h-4 w-4" />
                  Kanban
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Create Bug
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Bug</DialogTitle>
                      <DialogDescription>
                        Laporkan bug baru sesuai modul Bug Report ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            placeholder="Error saat posting jurnal"
                            required
                          />
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
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startDate">
                            Start Date <span className="text-red-500">*</span>
                          </Label>
                          <Input id="startDate" type="date" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dueDate">
                            Due Date <span className="text-red-500">*</span>
                          </Label>
                          <Input id="dueDate" type="date" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="status">
                            Bug Status <span className="text-red-500">*</span>
                          </Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="assignTo">
                            Assigned To <span className="text-red-500">*</span>
                          </Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="budi">Budi Santoso</SelectItem>
                              <SelectItem value="sari">Sari Wijaya</SelectItem>
                              <SelectItem value="ahmad">Ahmad Fauzi</SelectItem>
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
                  <CardTitle className="text-sm font-medium">Total Bugs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Open Bugs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bugs.filter((b) => b.status === "Open" || b.status === "In Progress").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Bug List</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search bugs..." className="h-9 pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bug Id</TableHead>
                        <TableHead>Assign To</TableHead>
                        <TableHead>Bug Title</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead className="w-[120px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bugs.map((bug) => (
                        <TableRow key={bug.id}>
                          <TableCell>
                            <div className="text-sm font-medium">{bug.bugId}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{bug.assignTo}</div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/projects/bug/${bug.id}`}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              {bug.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{bug.startDate}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{bug.dueDate}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusClasses(bug.status)}>
                              {bug.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityClasses(bug.priority)}>
                              {bug.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{bug.createdBy}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none"
                                title="Edit"
                              >
                                <IconPencil className="h-4 w-4" />
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

