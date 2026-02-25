"use client"

import { useState, useMemo, useEffect } from 'react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Project {
  id: string
  name: string
  status: string
  users: string[]
  completion: number
  description?: string
  startDate?: string
  endDate?: string
}

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

const initialProjects: Project[] = []

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [view, setView] = useState<"list" | "grid">("list")
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let ignore = false

    async function loadProjects() {
      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()
        if (statusFilter) {
          params.set("status", statusFilter)
        }
        if (search.trim()) {
          params.set("search", search.trim())
        }

        const res = await fetch(`/api/projects?${params.toString()}`, {
          method: "GET",
        })

        if (!res.ok) {
          throw new Error("Gagal memuat data project")
        }

        const json = await res.json()

        if (!ignore) {
          const data = Array.isArray(json.data) ? json.data : []
          setProjects(
            data.map((p: any) => ({
              id: String(p.id),
              name: String(p.name),
              status: String(p.status),
              users: Array.isArray(p.users) ? p.users : [],
              completion: typeof p.completion === "number" ? p.completion : 0,
              description: p.description ?? "",
              startDate: p.startDate ?? undefined,
              endDate: p.endDate ?? undefined,
            })),
          )
        }
      } catch (e: any) {
        if (!ignore) {
          setError(e.message || "Terjadi kesalahan saat memuat data project")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      ignore = true
    }
  }, [statusFilter, search])

  const openDeleteConfirm = (project: Project) => {
    setProjectToDelete(project)
    setDeleteAlertOpen(true)
  }

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      setProjectToDelete(null)
    }
    setDeleteAlertOpen(false)
  }

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
  }, [projects, search, statusFilter])

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
    <>
            {/* Title Page - reference-erp projects list */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Proyek</CardTitle>
                  <CardDescription>
                    Kelola dan pantau proyek Anda. Lihat status proyek, progress, dan tim yang terlibat dalam setiap proyek.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View mode: List / Grid (state only, route tidak berubah - sesuai reference-erp) */}
                  <div className="inline-flex rounded-md bg-muted p-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={view === "list" ? "default" : "ghost"}
                      className={`h-7 w-7 shadow-none p-0 ${view === "list" ? "bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" : "text-muted-foreground hover:bg-transparent hover:text-foreground"}`}
                      onClick={() => setView("list")}
                      title="List view"
                    >
                      <IconList className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={view === "grid" ? "default" : "ghost"}
                      className={`h-7 w-7 shadow-none p-0 border-l border-muted ${view === "grid" ? "bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" : "text-muted-foreground hover:bg-transparent hover:text-foreground"}`}
                      onClick={() => setView("grid")}
                      title="Grid view"
                    >
                      <IconLayoutGrid className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                        title="Filter"
                      >
                        <IconFilter className="mr-2 h-3 w-3" />
                        Filter
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
                  {/* Add Project */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="shadow-none h-7 px-4 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
                        <IconPlus className="mr-2 h-3 w-3" />
                        Add Project
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
              </CardHeader>
            </Card>

            {/* Project List (list view) */}
            {view === "list" && (
            <Card className={CARD_STYLE}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-3.5">
                <CardTitle>Project List</CardTitle>
                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-9 bg-gray-50 pl-9 pr-9 shadow-none border-0 focus-visible:border-0 focus-visible:ring-0 hover:bg-gray-100"
                    />
                    {search.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                        onClick={() => handleSearchChange('')}
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Project</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                        <TableHead className="px-6">Users</TableHead>
                        <TableHead className="px-6">Completion</TableHead>
                        <TableHead className="px-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="px-6 font-medium">
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
                            <TableCell className="px-6">
                              <Badge className={getStatusClasses(project.status)}>
                                {statusMap[project.status]?.label || project.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6">
                              <div className="flex -space-x-2">
                                {project.users.slice(0, 3).map((user, idx) => (
                                  <Avatar
                                    key={idx}
                                    className="h-9 w-9 border-2 border-white"
                                  >
                                    <AvatarFallback className="text-xs">
                                      {user.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {project.users.length > 3 && (
                                  <div className="h-9 w-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      +{project.users.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-6">
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
                            <TableCell className="px-6">
                              <div className="flex items-center gap-2 justify-start">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                                  title="View"
                                  asChild
                                >
                                  <Link href={`/projects/project/${project.id}`}>
                                    <IconEye className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                  title="Edit"
                                >
                                  <IconPencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                  title="Delete"
                                  onClick={() => openDeleteConfirm(project)}
                                >
                                  <IconTrash className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="px-6 text-center py-8 text-muted-foreground">
                            No projects found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="px-6 pb-6 pt-4">
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
            )}

            {/* Grid view (state only, route tetap sama) */}
            {view === "grid" && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedData.length > 0 ? (
                  paginatedData.map((project) => (
                    <Card key={project.id} className={`flex flex-col h-full ${CARD_STYLE}`}>
                      <CardHeader className="pb-3 px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded border border-primary bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold">{project.name.charAt(0)}</span>
                            </div>
                            <Link
                              href={`/projects/project/${project.id}`}
                              className="text-sm font-semibold text-primary hover:underline truncate"
                            >
                              {project.name}
                            </Link>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col px-6">
                        <div className="mb-3">
                          <Badge className={getStatusClasses(project.status)}>
                            {statusMap[project.status]?.label ?? project.status}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                        )}
                        <div className="mb-3">
                          <small className="text-xs font-semibold text-muted-foreground">MEMBERS</small>
                          <div className="flex -space-x-2 mt-2">
                            {project.users.slice(0, 3).map((user, idx) => (
                              <Avatar key={idx} className="h-8 w-8 border border-white">
                                <AvatarFallback className="text-xs">{user.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <div>
                              <h6 className="text-sm font-semibold">
                                {project.startDate ? new Date(project.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                              </h6>
                              <p className="text-xs text-muted-foreground">Start</p>
                            </div>
                            <div className="text-right">
                              <h6 className="text-sm font-semibold">
                                {project.endDate ? new Date(project.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}
                              </h6>
                              <p className="text-xs text-muted-foreground">Due</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center text-muted-foreground">No projects found</CardContent>
                  </Card>
                )}
              </div>
            )}
            {view === "grid" && totalRecords > 0 && (
              <div className="mt-4">
                <SimplePagination
                  totalCount={totalRecords}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                />
              </div>
            )}

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setProjectToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Project?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{projectToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

