"use client"

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
  IconCalendar,
  IconFilter,
  IconPlus,
  IconSearch,
  IconSend,
  IconPencil,
  IconTrash,
  IconLayoutGrid,
  IconList,
} from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const projects = [
  {
    id: 1,
    name: "Implementasi ERP PT Maju Jaya",
    status: "on_hold",
    users: ["Budi", "Sari", "Ahmad"],
    completion: 68,
  },
  {
    id: 2,
    name: "CRM Upgrade CV Kreatif Digital",
    status: "not_started",
    users: ["Dewi", "Fauzi"],
    completion: 25,
  },
  {
    id: 3,
    name: "Website Redesign PT Teknologi",
    status: "on_hold",
    users: ["Budi", "Sari"],
    completion: 45,
  },
] as const

const statusMap: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  cancel: { label: "Cancel", color: "bg-red-100 text-red-700" },
  finished: { label: "Finished", color: "bg-green-100 text-green-700" },
}

function getStatusClasses(status: string) {
  return statusMap[status]?.color || "bg-slate-100 text-slate-700"
}

function getCompletionColor(completion: number) {
  if (completion >= 80) return "bg-green-500"
  if (completion >= 50) return "bg-blue-500"
  if (completion >= 25) return "bg-yellow-500"
  return "bg-red-500"
}

export default function ProjectListPage() {
  const [view, setView] = React.useState<"list" | "grid">("list")

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
                <h1 className="text-3xl font-bold">Projects</h1>
              </div>
              <div className="flex gap-2">
                {view === "list" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 shadow-none"
                    onClick={() => setView("grid")}
                  >
                    <IconLayoutGrid className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 shadow-none"
                    onClick={() => setView("list")}
                  >
                    <IconList className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 shadow-none"
                >
                  <IconFilter className="mr-2 h-4 w-4" />
                  Status
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                      <IconPlus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Project</DialogTitle>
                      <DialogDescription>
                        Masukkan informasi project baru sesuai modul Project ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="projectName">
                          Project Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="projectName"
                          placeholder="Implementasi ERP PT Maju Jaya"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input id="startDate" type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input id="endDate" type="date" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="projectImage">
                          Project Image <span className="text-red-500">*</span>
                        </Label>
                        <Input id="projectImage" type="file" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="client">Client</Label>
                          <select
                            id="client"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select Client</option>
                            <option value="1">PT Maju Jaya</option>
                            <option value="2">CV Kreatif Digital</option>
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="user">
                            User <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="user"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            multiple
                          >
                            <option value="1">Budi Santoso</option>
                            <option value="2">Sari Wijaya</option>
                            <option value="3">Ahmad Fauzi</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="budget">Budget</Label>
                          <Input
                            id="budget"
                            type="number"
                            placeholder="450000000"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="estimatedHrs">Estimated Hours</Label>
                          <Input
                            id="estimatedHrs"
                            type="number"
                            placeholder="120"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                          id="description"
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter Description"
                          rows={4}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tag">Tag</Label>
                        <Input id="tag" placeholder="ERP, Finance, HRM" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="on_hold">On Hold</option>
                          <option value="in_progress">In Progress</option>
                          <option value="cancel">Cancel</option>
                          <option value="finished">Finished</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        className="shadow-none"
                      >
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

            <Card>
              <CardHeader>
                <CardTitle>Project List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded border-2 border-primary bg-slate-100 flex items-center justify-center">
                                <span className="text-xs font-semibold">
                                  {project.name.charAt(0)}
                                </span>
                              </div>
                              <Link
                                href={`/projects/project/${project.id}`}
                                className="text-sm font-semibold text-primary hover:underline"
                              >
                                {project.name}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusClasses(project.status)}>
                              {statusMap[project.status]?.label || project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {project.users.slice(0, 3).map((user, idx) => (
                                <Avatar
                                  key={idx}
                                  className="h-8 w-8 border-2 border-white"
                                >
                                  <AvatarFallback className="text-xs">
                                    {user.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {project.users.length > 3 && (
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    +{project.users.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {project.completion}%
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100">
                                <div
                                  className={`h-2 rounded-full ${getCompletionColor(project.completion)}`}
                                  style={{ width: `${project.completion}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none"
                                title="Invite User"
                              >
                                <IconSend className="h-4 w-4" />
                              </Button>
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

