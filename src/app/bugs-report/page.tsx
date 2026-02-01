"use client"

import { useState, useMemo } from 'react'
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainContentWrapper } from "@/components/main-content-wrapper"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  IconLayoutGrid,
  IconList,
  IconArrowLeft,
  IconPaperclip,
  IconMessageCircle,
  IconEye,
  IconPlus,
} from "@tabler/icons-react"
import { Search, X } from 'lucide-react'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { useAuth } from "@/contexts/auth-context"

const projectOptions = [
  { id: 1, name: "Implementasi ERP PT Maju Jaya" },
  { id: 2, name: "CRM Upgrade CV Kreatif Digital" },
  { id: 3, name: "Website Redesign PT Teknologi" },
  { id: 4, name: "Mobile App Development" },
  { id: 5, name: "Cloud Migration Project" },
]

const assignUserOptions = ["Budi", "Sari", "Ahmad", "Dewi", "Fauzi"]

interface Bug {
  id: number
  title: string
  projectName: string
  projectId: number
  bugStatus: string
  priority: string
  dueDate: string
  createdBy: string
  assignedTo: string[]
  attachments: number
  comments: number
  isOwner?: boolean
}

const bugs: Bug[] = [
  {
    id: 1,
    title: "Login page not loading",
    projectName: "Implementasi ERP PT Maju Jaya",
    projectId: 1,
    bugStatus: "Confirmed",
    priority: "high",
    dueDate: "2025-12-15",
    createdBy: "Budi Santoso",
    assignedTo: ["Sari", "Ahmad"],
    attachments: 2,
    comments: 5,
    isOwner: true,
  },
  {
    id: 2,
    title: "Database connection timeout",
    projectName: "CRM Upgrade CV Kreatif Digital",
    projectId: 2,
    bugStatus: "In Progress",
    priority: "critical",
    dueDate: "2025-12-10",
    createdBy: "Dewi Lestari",
    assignedTo: ["Fauzi"],
    attachments: 1,
    comments: 3,
    isOwner: false,
  },
  {
    id: 3,
    title: "Button alignment issue",
    projectName: "Website Redesign PT Teknologi",
    projectId: 3,
    bugStatus: "Resolved",
    priority: "low",
    dueDate: "2025-11-30",
    createdBy: "Ahmad Fauzi",
    assignedTo: ["Budi"],
    attachments: 0,
    comments: 1,
    isOwner: true,
  },
  {
    id: 4,
    title: "API endpoint returning 500 error",
    projectName: "Mobile App Development",
    projectId: 4,
    bugStatus: "Confirmed",
    priority: "high",
    dueDate: "2025-12-20",
    createdBy: "Sari Wijaya",
    assignedTo: ["Ahmad", "Dewi"],
    attachments: 3,
    comments: 8,
    isOwner: false,
  },
  {
    id: 5,
    title: "Memory leak in dashboard",
    projectName: "Implementasi ERP PT Maju Jaya",
    projectId: 1,
    bugStatus: "In Progress",
    priority: "medium",
    dueDate: "2025-12-18",
    createdBy: "Fauzi Rahman",
    assignedTo: ["Sari"],
    attachments: 1,
    comments: 2,
    isOwner: true,
  },
  {
    id: 6,
    title: "Missing validation on form",
    projectName: "Cloud Migration Project",
    projectId: 5,
    bugStatus: "New",
    priority: "medium",
    dueDate: "2026-01-05",
    createdBy: "Budi Santoso",
    assignedTo: ["Dewi", "Fauzi"],
    attachments: 0,
    comments: 0,
    isOwner: false,
  },
  {
    id: 7,
    title: "Export function not working",
    projectName: "CRM Upgrade CV Kreatif Digital",
    projectId: 2,
    bugStatus: "Resolved",
    priority: "low",
    dueDate: "2025-12-01",
    createdBy: "Ahmad Fauzi",
    assignedTo: ["Budi", "Sari"],
    attachments: 2,
    comments: 4,
    isOwner: true,
  },
  {
    id: 8,
    title: "Slow query performance",
    projectName: "Website Redesign PT Teknologi",
    projectId: 3,
    bugStatus: "Confirmed",
    priority: "critical",
    dueDate: "2025-12-12",
    createdBy: "Dewi Lestari",
    assignedTo: ["Ahmad"],
    attachments: 4,
    comments: 6,
    isOwner: false,
  },
]

const bugStatusMap: Record<string, { label: string; color: string }> = {
  New: { label: "New", color: "bg-gray-100 text-gray-700" },
  Confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  "In Progress": { label: "In Progress", color: "bg-yellow-100 text-yellow-700" },
  Resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
  Closed: { label: "Closed", color: "bg-slate-100 text-slate-700" },
}

const priorityMap: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
  high: { label: "High", color: "bg-yellow-100 text-yellow-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-cyan-100 text-cyan-700" },
}

function getBugStatusClasses(status: string) {
  return bugStatusMap[status]?.color || "bg-slate-100 text-slate-700"
}

function getPriorityClasses(priority: string) {
  return priorityMap[priority]?.color || "bg-slate-100 text-slate-700"
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const bugDate = new Date(date)
  bugDate.setHours(0, 0, 0, 0)
  
  const isOverdue = bugDate < today
  
  return {
    formatted: date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    isOverdue,
  }
}

const BUG_STATUS_OPTIONS = ["New", "Confirmed", "In Progress", "Resolved", "Closed"]
const PRIORITY_OPTIONS = ["critical", "high", "medium", "low"]

export default function BugsReportPage() {
  const { user } = useAuth()
  const isCompany = user?.type === 'company'
  
  const [view, setView] = useState<"list" | "grid">("list")
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    projectId: "",
    title: "",
    priority: "",
    startDate: "",
    dueDate: "",
    bugStatus: "",
    assignTo: "",
    description: "",
  })

  // Filtered data
  const filteredData = useMemo(() => {
    let filtered = bugs

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (bug) =>
          bug.title.toLowerCase().includes(q) ||
          bug.projectName.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [search])

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

  const handleCreateDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) {
      setCreateForm({
        projectId: "",
        title: "",
        priority: "",
        startDate: "",
        dueDate: "",
        bugStatus: "",
        assignTo: "",
        description: "",
      })
    }
  }

  const handleCreateBugSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API create bug
    handleCreateDialogOpenChange(false)
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <div className="flex items-center justify-end">
              <div className="flex gap-2">
                <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none h-7">
                      <IconPlus className="mr-2 h-3 w-3" /> Create Bug Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Bug Report</DialogTitle>
                      <DialogDescription>
                        Masukkan informasi bug report sesuai reference ERP. Field bertanda * wajib diisi.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateBugSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="create-project">Project <span className="text-red-500">*</span></Label>
                          <Select
                            value={createForm.projectId}
                            onValueChange={(v) => setCreateForm({ ...createForm, projectId: v })}
                            required
                          >
                            <SelectTrigger id="create-project">
                              <SelectValue placeholder="Pilih project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projectOptions.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="create-title">Title <span className="text-red-500">*</span></Label>
                          <Input
                            id="create-title"
                            value={createForm.title}
                            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                            placeholder="Enter title"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-priority">Priority <span className="text-red-500">*</span></Label>
                            <Select
                              value={createForm.priority}
                              onValueChange={(v) => setCreateForm({ ...createForm, priority: v })}
                              required
                            >
                              <SelectTrigger id="create-priority">
                                <SelectValue placeholder="Pilih priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRIORITY_OPTIONS.map((p) => (
                                  <SelectItem key={p} value={p}>{priorityMap[p]?.label ?? p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-status">Bug Status <span className="text-red-500">*</span></Label>
                            <Select
                              value={createForm.bugStatus}
                              onValueChange={(v) => setCreateForm({ ...createForm, bugStatus: v })}
                              required
                            >
                              <SelectTrigger id="create-status">
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                              <SelectContent>
                                {BUG_STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="create-start">Start Date <span className="text-red-500">*</span></Label>
                            <Input
                              id="create-start"
                              type="date"
                              value={createForm.startDate}
                              onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="create-due">Due Date <span className="text-red-500">*</span></Label>
                            <Input
                              id="create-due"
                              type="date"
                              value={createForm.dueDate}
                              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="create-assign">Assigned To <span className="text-red-500">*</span></Label>
                          <Select
                            value={createForm.assignTo}
                            onValueChange={(v) => setCreateForm({ ...createForm, assignTo: v })}
                            required
                          >
                            <SelectTrigger id="create-assign">
                              <SelectValue placeholder="Pilih user" />
                            </SelectTrigger>
                            <SelectContent>
                              {assignUserOptions.map((u) => (
                                <SelectItem key={u} value={u}>{u}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="create-desc">Description</Label>
                          <Textarea
                            id="create-desc"
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            placeholder="Enter description"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" size="sm" className="shadow-none h-7" onClick={() => handleCreateDialogOpenChange(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" variant="blue" className="shadow-none h-7">
                          Create
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <div className="inline-flex rounded-md bg-muted p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 shadow-none p-0 ${
                      view === "list"
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setView("list")}
                    title="List view"
                  >
                    <IconList className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                      view === "grid"
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setView("grid")}
                    title="Grid view"
                  >
                    <IconLayoutGrid className="h-3 w-3" />
                  </Button>
                </div>
                {isCompany && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                    title="Back"
                    asChild
                  >
                    <Link href="/projects">
                      <IconArrowLeft className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Bug List / Grid */}
            {view === "list" ? (
            <Card>
              <CardContent className="p-0">
                {/* Title and Search - Top */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Bug Report List</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bugs..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3 font-medium">Name</TableHead>
                        <TableHead className="px-4 py-3 font-medium">Bug Status</TableHead>
                        <TableHead className="px-4 py-3 font-medium">Priority</TableHead>
                        <TableHead className="px-4 py-3 font-medium">End Date</TableHead>
                        <TableHead className="px-4 py-3 font-medium">Created By</TableHead>
                        <TableHead className="px-4 py-3 font-medium">Assigned To</TableHead>
                        <TableHead className="px-4 py-3 font-medium"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((bug) => {
                          const dateInfo = formatDate(bug.dueDate)
                          return (
                            <TableRow key={bug.id}>
                              <TableCell className="px-4 py-3">
                                <div className="space-y-1">
                                  <Link
                                    href={`/projects/${bug.projectId}/bugs/${bug.id}`}
                                    className="text-sm font-medium text-primary hover:underline block"
                                  >
                                    {bug.title}
                                  </Link>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground m-0 font-normal">
                                      {bug.projectName}
                                    </p>
                                    {bug.isOwner !== undefined && (
                                      <Badge
                                        className={
                                          bug.isOwner
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }
                                      >
                                        {bug.isOwner ? "Owner" : "Member"}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Badge className={getBugStatusClasses(bug.bugStatus)}>
                                  {bug.bugStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <Badge className={getPriorityClasses(bug.priority)}>
                                  {priorityMap[bug.priority]?.label || bug.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <span
                                  className={`text-sm font-normal ${
                                    dateInfo.isOverdue ? "text-red-600" : ""
                                  }`}
                                >
                                  {dateInfo.formatted}
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex items-center">
                                  <span className="text-sm font-normal">{bug.createdBy}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex -space-x-2">
                                  {bug.assignedTo.slice(0, 3).map((user, idx) => (
                                    <Avatar
                                      key={idx}
                                      className="h-8 w-8 border-2 border-white"
                                    >
                                      <AvatarFallback className="text-xs">
                                        {user.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {bug.assignedTo.length > 3 && (
                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        +{bug.assignedTo.length - 3}
                                      </span>
                                    </div>
                                  )}
                                  {bug.assignedTo.length === 0 && (
                                    <span className="text-sm text-muted-foreground">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex items-center gap-3 justify-end">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <IconPaperclip className="h-4 w-4" />
                                    <span>{bug.attachments}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <IconMessageCircle className="h-4 w-4" />
                                    <span>{bug.comments}</span>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No bugs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="px-4 py-3 border-t">
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
            ) : (
              /* Grid view: satu card per bug */
              <>
                <div className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between mb-4">
                  <CardTitle className="text-base font-medium mb-0">Bug Report List</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bugs..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((bug) => {
                      const dateInfo = formatDate(bug.dueDate)
                      return (
                        <Card key={bug.id} className="flex flex-col h-full">
                          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 p-3">
                            <CardTitle className="text-sm font-medium mb-0">
                              <Link
                                href={`/projects/${bug.projectId}/bugs/${bug.id}`}
                                className="hover:underline text-primary"
                              >
                                {bug.title}
                              </Link>
                            </CardTitle>
                            {bug.isOwner !== undefined && (
                              <Badge
                                className={
                                  bug.isOwner
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {bug.isOwner ? "Owner" : "Member"}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent className="flex-1 p-3 pt-0 space-y-2">
                            <p className="text-xs text-muted-foreground m-0 line-clamp-2">{bug.projectName}</p>
                            <div className="flex flex-wrap gap-1">
                              <Badge className={getBugStatusClasses(bug.bugStatus)}>
                                {bug.bugStatus}
                              </Badge>
                              <Badge className={getPriorityClasses(bug.priority)}>
                                {priorityMap[bug.priority]?.label || bug.priority}
                              </Badge>
                            </div>
                            <div>
                              <span
                                className={`text-xs ${dateInfo.isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}
                              >
                                Due: {dateInfo.formatted}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground m-0">Created by: {bug.createdBy}</p>
                            <div className="flex -space-x-2">
                              {bug.assignedTo.slice(0, 3).map((user, idx) => (
                                <Avatar key={idx} className="h-6 w-6 border-2 border-white">
                                  <AvatarFallback className="text-[10px]">{user.charAt(0)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {bug.assignedTo.length > 3 && (
                                <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                  <span className="text-[10px] font-medium">+{bug.assignedTo.length - 3}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span><IconPaperclip className="h-3 w-3 inline mr-0.5" />{bug.attachments}</span>
                              <span><IconMessageCircle className="h-3 w-3 inline mr-0.5" />{bug.comments}</span>
                            </div>
                          </CardContent>
                          <div className="border-t p-3 pt-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="shadow-none h-7 w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                              asChild
                            >
                              <Link href={`/projects/${bug.projectId}/bugs/${bug.id}`}>
                                <IconEye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </Card>
                      )
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground rounded-lg border border-dashed">
                      No bugs found
                    </div>
                  )}
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
              </>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}


