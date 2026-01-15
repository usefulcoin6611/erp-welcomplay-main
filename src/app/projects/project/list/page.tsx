"use client"

import { useState, useMemo } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  IconFilter,
  IconPlus,
  IconPencil,
  IconTrash,
  IconLayoutGrid,
  IconList,
  IconEye,
} from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, X } from 'lucide-react'
import { SimplePagination } from '@/components/ui/simple-pagination'

interface Project {
  id: number
  name: string
  status: string
  users: string[]
  completion: number
}

const projects: Project[] = [
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
  {
    id: 4,
    name: "Mobile App Development",
    status: "in_progress",
    users: ["Ahmad", "Dewi", "Fauzi", "Budi"],
    completion: 75,
  },
  {
    id: 5,
    name: "Cloud Migration Project",
    status: "finished",
    users: ["Sari", "Ahmad"],
    completion: 100,
  },
  {
    id: 6,
    name: "Database Optimization",
    status: "in_progress",
    users: ["Budi", "Dewi"],
    completion: 55,
  },
  {
    id: 7,
    name: "Security Audit",
    status: "cancel",
    users: ["Ahmad"],
    completion: 10,
  },
  {
    id: 8,
    name: "E-Commerce Platform",
    status: "in_progress",
    users: ["Sari", "Fauzi", "Budi", "Ahmad", "Dewi"],
    completion: 60,
  },
]

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
  const [view, setView] = useState<"list" | "grid">("list")
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = projects

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((project) => project.status === statusFilter)
    }

    return filtered
  }, [search, statusFilter])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status === 'all' ? '' : status)
    setCurrentPage(1)
  }

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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Projects</h1>
                <p className="text-sm text-muted-foreground">
                  Manage projects and track progress
                </p>
              </div>
              <div className="flex gap-2">
                {view === "list" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                    title="Grid View"
                    onClick={() => setView("grid")}
                  >
                    <IconLayoutGrid className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                    title="List View"
                    onClick={() => setView("list")}
                  >
                    <IconList className="h-3 w-3" />
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shadow-none h-7"
                      title="Filter"
                    >
                      <IconFilter className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusFilter('all')}>
                      Show All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('not_started')}>
                      Not Started
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('on_hold')}>
                      On Hold
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('in_progress')}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('cancel')}>
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusFilter('finished')}>
                      Finished
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="blue" size="sm" className="shadow-none h-7">
                      <IconPlus className="h-3 w-3" />
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
                        size="sm"
                        className="shadow-none h-7"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="blue"
                        size="sm"
                        className="shadow-none h-7"
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Search */}
            <Card className="shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors"
                    />
                    {search.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => handleSearchChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project List */}
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((project) => (
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
                            <TableCell>
                              <div className="flex items-center gap-2 justify-start">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                                  title="View"
                                  asChild
                                >
                                  <Link href={`/projects/project/${project.id}`}>
                                    <IconEye className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                                  title="Edit"
                                >
                                  <IconPencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="shadow-none h-7"
                                  title="Delete"
                                >
                                  <IconTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No projects found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="mt-4">
                    <SimplePagination
                      totalCount={totalRecords}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

