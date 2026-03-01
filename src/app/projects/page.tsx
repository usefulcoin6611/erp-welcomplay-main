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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  IconFilter,
  IconPlus,
  IconPencil,
  IconTrash,
  IconLayoutGrid,
  IconList,
  IconEye,
} from "@tabler/icons-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { toast } from "sonner"

const PLACEHOLDER = "__none__"
const PROJECT_STATUSES = ["not_started", "on_hold", "in_progress", "cancel", "finished"] as const

interface Project {
  id: string
  name: string
  status: string
  users: string[]
  completion: number
  description?: string
  startDate?: string
  endDate?: string
  clientName?: string
  budget?: number
  estimatedHrs?: number
  tags?: string
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

type CustomerOption = { id: string; name: string }
type EmployeeOption = { id: string; name: string }

export default function ProjectsPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [view, setView] = useState<"list" | "grid">("list")
  const isClientRole = userRole === "client"
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createClientId, setCreateClientId] = useState(PLACEHOLDER)
  const [createStatus, setCreateStatus] = useState<string>("not_started")
  const [createStartDate, setCreateStartDate] = useState("")
  const [createEndDate, setCreateEndDate] = useState("")
  const [createBudget, setCreateBudget] = useState("")
  const [createEstimatedHrs, setCreateEstimatedHrs] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createTags, setCreateTags] = useState("")
  const [createUserIds, setCreateUserIds] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [editName, setEditName] = useState("")
  const [editClientId, setEditClientId] = useState(PLACEHOLDER)
  const [editStatus, setEditStatus] = useState("not_started")
  const [editStartDate, setEditStartDate] = useState("")
  const [editEndDate, setEditEndDate] = useState("")
  const [editBudget, setEditBudget] = useState("")
  const [editEstimatedHrs, setEditEstimatedHrs] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editTags, setEditTags] = useState("")
  const [editUserIds, setEditUserIds] = useState<Set<string>>(new Set())
  const [savingEdit, setSavingEdit] = useState(false)

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
              clientName: p.clientName ?? undefined,
              budget: typeof p.budget === "number" ? p.budget : undefined,
              estimatedHrs: typeof p.estimatedHrs === "number" ? p.estimatedHrs : undefined,
              tags: p.tags ?? undefined,
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

  useEffect(() => {
    let ignore = false
    Promise.all([
      fetch("/api/customers", { cache: "no-store" }).then((r) => r.json().catch(() => ({ success: false, data: [] }))),
      fetch("/api/employees", { cache: "no-store" }).then((r) => r.json().catch(() => ({ success: false, data: [] }))),
    ]).then(([custRes, empRes]) => {
      if (ignore) return
      if (custRes?.success && Array.isArray(custRes.data)) {
        setCustomers(custRes.data.map((c: any) => ({ id: c.id, name: c.name })))
      }
      if (empRes?.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data.map((e: any) => ({ id: e.id, name: e.name })))
      }
    })
    return () => { ignore = true }
  }, [])

  const openDeleteConfirm = (project: Project) => {
    setProjectToDelete(project)
    setDeleteAlertOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) {
      setDeleteAlertOpen(false)
      return
    }
    try {
      setDeleteLoading(true)
      const res = await fetch(`/api/projects/${encodeURIComponent(projectToDelete.id)}`, { method: "DELETE" })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? "Gagal menghapus project")
        return
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      setProjectToDelete(null)
      setDeleteAlertOpen(false)
      toast.success("Project berhasil dihapus")
    } catch {
      toast.error("Terjadi kesalahan saat menghapus project")
    } finally {
      setDeleteLoading(false)
    }
  }

  const resetCreateForm = () => {
    setCreateName("")
    setCreateClientId(PLACEHOLDER)
    setCreateStatus("not_started")
    setCreateStartDate("")
    setCreateEndDate("")
    setCreateBudget("")
    setCreateEstimatedHrs("")
    setCreateDescription("")
    setCreateTags("")
    setCreateUserIds(new Set())
  }

  const handleCreateProject = async () => {
    if (!createName.trim()) {
      toast.error("Nama project wajib diisi")
      return
    }
    const clientName = createClientId && createClientId !== PLACEHOLDER
      ? customers.find((c) => c.id === createClientId)?.name ?? null
      : null
    const userNames = employees
      .filter((e) => createUserIds.has(e.id))
      .map((e) => e.name)
    try {
      setCreating(true)
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          clientName,
          status: createStatus,
          startDate: createStartDate || null,
          endDate: createEndDate || null,
          budget: createBudget ? Number(createBudget) : 0,
          estimatedHrs: createEstimatedHrs ? Number(createEstimatedHrs) : 0,
          description: createDescription.trim() || null,
          tags: createTags.trim() || null,
          users: userNames,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? "Gagal membuat project")
        return
      }
      const created = json.data
      setProjects((prev) => [{
        id: String(created.id),
        name: String(created.name),
        status: String(created.status),
        users: Array.isArray(created.users) ? created.users : [],
        completion: Number(created.completion) ?? 0,
        description: created.description ?? "",
        startDate: created.startDate ?? undefined,
        endDate: created.endDate ?? undefined,
      }, ...prev])
      resetCreateForm()
      setCreateOpen(false)
      toast.success("Project berhasil dibuat")
    } catch {
      toast.error("Terjadi kesalahan saat membuat project")
    } finally {
      setCreating(false)
    }
  }

  const openEditDialog = (project: Project) => {
    setEditProject(project)
    setEditName(project.name)
    setEditClientId(
      project.clientName && customers.some((c) => c.name === project.clientName)
        ? customers.find((c) => c.name === project.clientName)!.id
        : PLACEHOLDER
    )
    setEditStatus(project.status || "not_started")
    setEditStartDate(project.startDate ?? "")
    setEditEndDate(project.endDate ?? "")
    setEditBudget(project.budget != null ? String(project.budget) : "")
    setEditEstimatedHrs(project.estimatedHrs != null ? String(project.estimatedHrs) : "")
    setEditDescription(project.description ?? "")
    setEditTags(project.tags ?? "")
    setEditUserIds(new Set(employees.filter((e) => project.users?.includes(e.name)).map((e) => e.id)))
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editProject) return
    if (!editName.trim()) {
      toast.error("Nama project wajib diisi")
      return
    }
    const clientName = editClientId && editClientId !== PLACEHOLDER
      ? customers.find((c) => c.id === editClientId)?.name ?? null
      : null
    const userNames = employees.filter((e) => editUserIds.has(e.id)).map((e) => e.name)
    try {
      setSavingEdit(true)
      const res = await fetch(`/api/projects/${encodeURIComponent(editProject.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          clientName,
          status: editStatus,
          startDate: editStartDate || null,
          endDate: editEndDate || null,
          budget: editBudget ? Number(editBudget) : 0,
          estimatedHrs: editEstimatedHrs ? Number(editEstimatedHrs) : 0,
          description: editDescription.trim() || null,
          tags: editTags.trim() || null,
          users: userNames,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? "Gagal memperbarui project")
        return
      }
      const updated = json.data
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editProject.id
            ? {
                id: String(updated.id),
                name: String(updated.name),
                status: String(updated.status),
                users: Array.isArray(updated.users) ? updated.users : [],
                completion: Number(updated.completion) ?? 0,
                description: updated.description ?? "",
                startDate: updated.startDate ?? undefined,
                endDate: updated.endDate ?? undefined,
                clientName: updated.clientName,
                budget: updated.budget,
                estimatedHrs: updated.estimatedHrs,
                tags: updated.tags,
              }
            : p
        )
      )
      setEditOpen(false)
      setEditProject(null)
      toast.success("Project berhasil diperbarui")
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui project")
    } finally {
      setSavingEdit(false)
    }
  }

  const toggleCreateUser = (id: string) => {
    setCreateUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleEditUser = (id: string) => {
    setEditUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.role) setUserRole(data.role)
      })
      .catch(() => {})
  }, [])

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
                  {/* Add Project (hidden for client role) */}
                  {!isClientRole && (
                  <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="shadow-none h-7 px-4 bg-blue-500 text-white hover:bg-blue-600 border-0">
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
                          <Label htmlFor="projectName">Project Name <span className="text-red-500">*</span></Label>
                          <Input
                            id="projectName"
                            placeholder="Implementasi ERP PT Maju Jaya"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Client</Label>
                            <Select value={createClientId} onValueChange={setCreateClientId}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Select client (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={PLACEHOLDER}>None</SelectItem>
                                {customers.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select value={createStatus} onValueChange={setCreateStatus}>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PROJECT_STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>{statusMap[s]?.label ?? s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={createStartDate}
                              onChange={(e) => setCreateStartDate(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={createEndDate}
                              onChange={(e) => setCreateEndDate(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="budget">Budget (IDR)</Label>
                            <Input
                              id="budget"
                              type="number"
                              min={0}
                              step={1}
                              placeholder="450000000"
                              value={createBudget}
                              onChange={(e) => setCreateBudget(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="estimatedHrs">Estimated Hours</Label>
                            <Input
                              id="estimatedHrs"
                              type="number"
                              min={0}
                              step={0.5}
                              placeholder="120"
                              value={createEstimatedHrs}
                              onChange={(e) => setCreateEstimatedHrs(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Team members (optional)</Label>
                          <div className="rounded-md border border-input p-3 max-h-32 overflow-y-auto space-y-2">
                            {employees.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No employees loaded.</p>
                            ) : (
                              employees.map((e) => (
                                <div key={e.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`create-user-${e.id}`}
                                    checked={createUserIds.has(e.id)}
                                    onCheckedChange={() => toggleCreateUser(e.id)}
                                  />
                                  <label htmlFor={`create-user-${e.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                    {e.name}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Enter description"
                            rows={4}
                            value={createDescription}
                            onChange={(e) => setCreateDescription(e.target.value)}
                            className="resize-none"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tag">Tags (comma-separated)</Label>
                          <Input
                            id="tag"
                            placeholder="ERP, Finance, HRM"
                            value={createTags}
                            onChange={(e) => setCreateTags(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" size="sm" className="shadow-none h-7" onClick={() => setCreateOpen(false)} disabled={creating}>
                          Cancel
                        </Button>
                        <Button type="button" variant="blue" size="sm" className="shadow-none h-7" disabled={!createName.trim() || creating} onClick={handleCreateProject}>
                          {creating ? "Creating..." : "Create"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  )}
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
                      className="h-9 pl-9 pr-9 bg-gray-50 border-0 shadow-none focus-visible:border-0 focus-visible:ring-0 hover:bg-gray-100"
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
                                {!isClientRole && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="shadow-none h-7 w-7 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                      title="Edit"
                                      onClick={() => openEditDialog(project)}
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
                                  </>
                                )}
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
                        <div className="mt-auto pt-3 border-t space-y-3">
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
                          {!isClientRole && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0 flex-1 shadow-none bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200" title="Edit" onClick={() => openEditDialog(project)}>
                                <IconPencil className="h-3 w-3" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 w-7 p-0 flex-1 shadow-none bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200" title="Delete" onClick={() => openDeleteConfirm(project)}>
                                <IconTrash className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
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

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditProject(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Ubah informasi project.</DialogDescription>
          </DialogHeader>
          {editProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Project Name <span className="text-red-500">*</span></Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Project name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Client</Label>
                  <Select value={editClientId} onValueChange={setEditClientId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Client (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PLACEHOLDER}>None</SelectItem>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{statusMap[s]?.label ?? s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Budget (IDR)</Label>
                  <Input type="number" min={0} step={1} value={editBudget} onChange={(e) => setEditBudget(e.target.value)} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Estimated Hours</Label>
                  <Input type="number" min={0} step={0.5} value={editEstimatedHrs} onChange={(e) => setEditEstimatedHrs(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Team members</Label>
                <div className="rounded-md border border-input p-3 max-h-32 overflow-y-auto space-y-2">
                  {employees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No employees loaded.</p>
                  ) : (
                    employees.map((e) => (
                      <div key={e.id} className="flex items-center space-x-2">
                        <Checkbox id={`edit-user-${e.id}`} checked={editUserIds.has(e.id)} onCheckedChange={() => toggleEditUser(e.id)} />
                        <label htmlFor={`edit-user-${e.id}`} className="text-sm font-medium leading-none cursor-pointer">{e.name}</label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="resize-none" placeholder="Description" />
              </div>
              <div className="grid gap-2">
                <Label>Tags (comma-separated)</Label>
                <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="ERP, Finance, HRM" />
              </div>
            </div>
          )}
          {editProject && (
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" className="shadow-none h-7" onClick={() => setEditOpen(false)} disabled={savingEdit}>Cancel</Button>
              <Button type="button" variant="blue" size="sm" className="shadow-none h-7" disabled={!editName.trim() || savingEdit} onClick={handleSaveEdit}>
                {savingEdit ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setProjectToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Project?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{projectToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white" disabled={deleteLoading}>
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

