"use client"

import { useState, useMemo, useEffect } from 'react'
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
  { id: "PRJ-001", name: "Implementasi ERP PT Maju Jaya" },
  { id: "PRJ-002", name: "CRM Upgrade CV Kreatif Digital" },
  { id: "PRJ-003", name: "Website Redesign PT Teknologi Nusantara" },
  { id: "PRJ-004", name: "Mobile App Development" },
  { id: "PRJ-005", name: "Cloud Migration Project" },
]

const assignUserOptions = ["Budi", "Sari", "Ahmad", "Dewi", "Fauzi"]

interface Bug {
  id: string
  title: string
  projectName: string
  projectId: string
  bugStatus: string
  priority: string
  dueDate: string
  createdBy: string
  assignedTo: string[]
  attachments: number
  comments: number
  isOwner?: boolean
}

const initialBugs: Bug[] = []

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
  const [bugs, setBugs] = useState<Bug[]>(initialBugs)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
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

  useEffect(() => {
    let ignore = false

    async function loadBugs() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("/api/projects/bugs")
        if (!res.ok) {
          throw new Error("Gagal memuat data bug")
        }

        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []

        if (!ignore) {
          setBugs(
            data.map((b: any) => ({
              id: String(b.id),
              title: String(b.title),
              projectName: String(b.projectName ?? ""),
              projectId: String(b.projectId ?? ""),
              bugStatus: String(b.bugStatus ?? ""),
              priority: String(b.priority ?? ""),
              dueDate: String(b.dueDate ?? ""),
              createdBy: String(b.createdBy ?? ""),
              assignedTo: Array.isArray(b.assignedTo) ? b.assignedTo : [],
              attachments: typeof b.attachments === "number" ? b.attachments : 0,
              comments: typeof b.comments === "number" ? b.comments : 0,
              isOwner: Boolean(b.isOwner),
            })),
          )
        }
      } catch (e: any) {
        if (!ignore) {
          setError(e.message || "Terjadi kesalahan saat memuat data bug")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadBugs()

    return () => {
      ignore = true
    }
  }, [])

  const filteredData = useMemo(() => {
    let filtered = bugs

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (bug) =>
          bug.title.toLowerCase().includes(q) ||
          bug.projectName.toLowerCase().includes(q),
      )
    }

    return filtered
  }, [bugs, search])

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
    <>
            {/* Title Page */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Bugs Report</CardTitle>
                  <CardDescription>
                    Kelola dan pantau bug report Anda. Lihat status bug, prioritas, dan progress dari setiap bug yang sedang ditangani.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View mode toggle (List / Grid) */}
                  <div className="inline-flex rounded-md bg-muted p-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={view === 'list' ? 'default' : 'ghost'}
                      className={`h-7 w-7 shadow-none p-0 ${
                        view === 'list'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setView('list')}
                      title="List view"
                    >
                      <IconList className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={view === 'grid' ? 'default' : 'ghost'}
                      className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                        view === 'grid'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      onClick={() => setView('grid')}
                      title="Grid view"
                    >
                      <IconLayoutGrid className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Back button (only for company users) */}
                  {isCompany && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                      title="Back"
                      asChild
                    >
                      <Link href="/projects">
                        <IconArrowLeft className="mr-2 h-3 w-3" />
                        Back
                      </Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Bug List / Grid */}
            {view === "list" ? (
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                <CardTitle>Bug Report List</CardTitle>
                <div className="flex w-full max-w-md items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search bugs..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
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
                        <TableHead className="px-6">Name</TableHead>
                        <TableHead className="px-6">Bug Status</TableHead>
                        <TableHead className="px-6">Priority</TableHead>
                        <TableHead className="px-6">End Date</TableHead>
                        <TableHead className="px-6">Created By</TableHead>
                        <TableHead className="px-6">Assigned To</TableHead>
                        <TableHead className="px-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((bug) => {
                          const dateInfo = formatDate(bug.dueDate)
                          return (
                            <TableRow key={bug.id}>
                              <TableCell className="px-6 font-medium">
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
                              <TableCell className="px-6">
                                <Badge className={getBugStatusClasses(bug.bugStatus)}>
                                  {bug.bugStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6">
                                <Badge className={getPriorityClasses(bug.priority)}>
                                  {priorityMap[bug.priority]?.label || bug.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6">
                                <span
                                  className={`text-sm font-normal ${
                                    dateInfo.isOverdue ? "text-red-600" : ""
                                  }`}
                                >
                                  {dateInfo.formatted}
                                </span>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex items-center">
                                  <span className="text-sm font-normal">{bug.createdBy}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6">
                                <div className="flex -space-x-2">
                                  {bug.assignedTo.slice(0, 3).map((user, idx) => (
                                    <Avatar
                                      key={idx}
                                      className="h-9 w-9 border-2 border-white"
                                    >
                                      <AvatarFallback className="text-xs">
                                        {user.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {bug.assignedTo.length > 3 && (
                                    <div className="h-9 w-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
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
                              <TableCell className="px-6">
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
                          <TableCell colSpan={7} className="px-6 text-center py-8 text-muted-foreground">
                            No bugs found
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
            ) : (
              /* Grid view: satu card per bug */
              <>
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
    </>
  )
}


