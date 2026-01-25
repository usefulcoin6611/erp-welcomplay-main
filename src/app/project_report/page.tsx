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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  IconEye,
  IconPencil,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { SimplePagination } from '@/components/ui/simple-pagination'
import { X } from 'lucide-react'

interface Project {
  id: number
  name: string
  startDate: string
  endDate: string
  users: string[]
  completion: number
  status: string
}

const projects: Project[] = [
  {
    id: 1,
    name: "Implementasi ERP PT Maju Jaya",
    startDate: "2025-10-01",
    endDate: "2026-01-31",
    users: ["Budi", "Sari", "Ahmad"],
    completion: 68,
    status: "on_hold",
  },
  {
    id: 2,
    name: "CRM Upgrade CV Kreatif Digital",
    startDate: "2025-11-10",
    endDate: "2026-03-15",
    users: ["Dewi", "Fauzi"],
    completion: 25,
    status: "not_started",
  },
  {
    id: 3,
    name: "Website Redesign PT Teknologi",
    startDate: "2025-09-15",
    endDate: "2026-02-28",
    users: ["Budi", "Sari", "Ahmad", "Dewi"],
    completion: 45,
    status: "on_hold",
  },
  {
    id: 4,
    name: "Mobile App Development",
    startDate: "2025-08-01",
    endDate: "2026-05-31",
    users: ["Ahmad", "Dewi", "Fauzi"],
    completion: 75,
    status: "in_progress",
  },
  {
    id: 5,
    name: "Cloud Migration Project",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    users: ["Sari", "Ahmad"],
    completion: 100,
    status: "finished",
  },
]

const statusMap: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  cancel: { label: "Cancel", color: "bg-red-100 text-red-700" },
  finished: { label: "Finished", color: "bg-green-100 text-green-700" },
}

const statusOptions = [
  { value: "", label: "Select Status" },
  { value: "not_started", label: "Not Started" },
  { value: "on_hold", label: "On Hold" },
  { value: "in_progress", label: "In Progress" },
  { value: "cancel", label: "Cancel" },
  { value: "finished", label: "Finished" },
]

const users = [
  { id: "1", name: "Budi Santoso" },
  { id: "2", name: "Sari Wijaya" },
  { id: "3", name: "Ahmad Fauzi" },
  { id: "4", name: "Dewi Lestari" },
  { id: "5", name: "Fauzi Rahman" },
]

function getStatusClasses(status: string) {
  return statusMap[status]?.color || "bg-slate-100 text-slate-700"
}

function getCompletionColor(completion: number) {
  if (completion >= 80) return "bg-green-500"
  if (completion >= 50) return "bg-blue-500"
  if (completion >= 25) return "bg-yellow-500"
  return "bg-red-500"
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProjectReportPage() {
  const { user } = useAuth()
  const isCompany = user?.type === 'company'

  // Filter states (only for company)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  // Search and pagination states
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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

    if (isCompany) {
      // User filter
      if (selectedUser) {
        // In real app, this would filter by user_id
        // For demo, we'll just return all projects
      }

      // Status filter
      if (selectedStatus) {
        filtered = filtered.filter((project) => project.status === selectedStatus)
      }

      // Start date filter
      if (startDate) {
        filtered = filtered.filter((project) => project.startDate >= startDate)
      }

      // End date filter
      if (endDate) {
        filtered = filtered.filter((project) => project.endDate <= endDate)
      }
    }

    return filtered
  }, [isCompany, selectedUser, selectedStatus, startDate, endDate, search])

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

  const handleApply = () => {
    // Filters are already applied via useMemo
    // This function can be used for additional logic if needed
  }

  const handleReset = () => {
    setSelectedUser('')
    setSelectedStatus('')
    setStartDate('')
    setEndDate('')
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">

            {/* Search */}
            <Card className="shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

            {/* Filters - Only for Company */}
            {isCompany && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="users">Users</Label>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger id="users" className="h-9">
                          <SelectValue placeholder="All Users" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Users</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger id="status" className="h-9">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variant="blue"
                      size="sm"
                      className="shadow-none h-7"
                      onClick={handleApply}
                    >
                      <IconSearch className="h-3 w-3 mr-2" />
                      Apply
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shadow-none h-7"
                      onClick={handleReset}
                      asChild
                    >
                      <Link href="/project_report">
                        <IconRefresh className="h-3 w-3 mr-2" />
                        Reset
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Report Table */}
            <Card>
              <CardHeader>
                <CardTitle>Project Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projects</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Projects Members</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Link
                                  href={`/projects/${project.id}`}
                                  className="text-sm font-semibold text-primary hover:underline"
                                >
                                  {project.name}
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{formatDate(project.startDate)}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{formatDate(project.endDate)}</span>
                            </TableCell>
                            <TableCell>
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
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-green-600">
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
                              <Badge className={getStatusClasses(project.status)}>
                                {statusMap[project.status]?.label || project.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-start">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                                  title="View Project Report"
                                  asChild
                                >
                                  <Link href={`/project_report/${project.id}`}>
                                    <IconEye className="h-3 w-3" />
                                  </Link>
                                </Button>
                                {isCompany && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                                    title="Edit"
                                  >
                                    <IconPencil className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

