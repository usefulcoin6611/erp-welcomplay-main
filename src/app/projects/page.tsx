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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  IconFilter,
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
  image?: string
  description?: string
  startDate?: string
  endDate?: string
}

const projects: Project[] = [
  {
    id: 1,
    name: "Implementasi ERP PT Maju Jaya",
    status: "on_hold",
    users: ["Budi", "Sari", "Ahmad"],
    completion: 68,
    description: "Implementasi sistem ERP lengkap untuk mengelola keuangan, HRM, POS, dan CRM.",
    startDate: "2025-10-01",
    endDate: "2026-01-31",
  },
  {
    id: 2,
    name: "CRM Upgrade CV Kreatif Digital",
    status: "not_started",
    users: ["Dewi", "Fauzi"],
    completion: 25,
    description: "Upgrade modul CRM dengan fitur pipeline, automation, dan laporan penjualan.",
    startDate: "2025-11-10",
    endDate: "2026-03-15",
  },
  {
    id: 3,
    name: "Website Redesign PT Teknologi",
    status: "on_hold",
    users: ["Budi", "Sari"],
    completion: 45,
    description: "Redesign website dengan UI/UX modern dan responsive design.",
    startDate: "2025-09-15",
    endDate: "2026-02-28",
  },
  {
    id: 4,
    name: "Mobile App Development",
    status: "in_progress",
    users: ["Ahmad", "Dewi", "Fauzi", "Budi"],
    completion: 75,
    description: "Pengembangan aplikasi mobile untuk iOS dan Android.",
    startDate: "2025-08-01",
    endDate: "2026-05-31",
  },
  {
    id: 5,
    name: "Cloud Migration Project",
    status: "finished",
    users: ["Sari", "Ahmad"],
    completion: 100,
    description: "Migrasi infrastruktur ke cloud dengan AWS.",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
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

export default function ProjectsPage() {
  const [view, setView] = useState<"list" | "grid">("list")
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('created_at-desc')

  // Filtered and sorted data
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

    // Sort
    const [field, order] = sortBy.split('-')
    filtered = [...filtered].sort((a, b) => {
      let aVal: any = a.name
      let bVal: any = b.name
      
      if (field === 'created_at') {
        // For demo, use id as created_at
        aVal = a.id
        bVal = b.id
      } else if (field === 'project_name') {
        aVal = a.name
        bVal = b.name
      }

      if (order === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      }
    })

    return filtered
  }, [search, statusFilter, sortBy])

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

  const handleSort = (sort: string) => {
    setSortBy(sort)
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Title Page */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Proyek</CardTitle>
                  <CardDescription>
                    Kelola dan pantau proyek Anda. Lihat status proyek, progress, dan tim yang terlibat dalam setiap proyek.
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
                  {/* Sort */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                        title="Sort"
                      >
                        <IconFilter className="mr-2 h-3 w-3" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSort('created_at-desc')}>
                        Newest
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('created_at-asc')}>
                        Oldest
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('project_name-desc')}>
                        From Z-A
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSort('project_name-asc')}>
                        From A-Z
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Status Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                        title="Status"
                      >
                        Status
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
                </div>
              </CardHeader>
            </Card>

            {/* Project List View */}
            {view === "list" ? (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Project List</CardTitle>
                  <div className="flex w-full max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search projects..."
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
                                  <div className="h-10 w-10 rounded border border-primary bg-slate-100 flex items-center justify-center">
                                    <span className="text-xs font-semibold">
                                      {project.name.charAt(0)}
                                    </span>
                                  </div>
                                  <Link
                                    href={`/projects/project/${project.id}`}
                                    className="text-sm font-medium text-primary hover:underline"
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
                                  <div className="text-sm font-normal">
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
                                    className="shadow-none h-7 w-7 p-0 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                                    title="View"
                                    asChild
                                  >
                                    <Link href={`/projects/project/${project.id}`}>
                                      <IconEye className="h-3 w-3" />
                                    </Link>
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
            ) : (
              /* Grid View */
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedData.length > 0 ? (
                  paginatedData.map((project) => (
                    <Card key={project.id} className="flex flex-col h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded border border-primary bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold">
                                {project.name.charAt(0)}
                              </span>
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
                      <CardContent className="flex-1 flex flex-col">
                        <div className="mb-3">
                          <Badge className={getStatusClasses(project.status)}>
                            {statusMap[project.status]?.label || project.status}
                          </Badge>
                        </div>
                        {project.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                        <div className="mb-3">
                          <small className="text-xs font-semibold text-muted-foreground">MEMBERS</small>
                          <div className="flex -space-x-2 mt-2">
                            {project.users.slice(0, 3).map((user, idx) => (
                              <Avatar
                                key={idx}
                                className="h-8 w-8 border border-white"
                              >
                                <AvatarFallback className="text-xs">
                                  {user.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h6 className="text-sm font-semibold">
                                {project.startDate ? new Date(project.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                              </h6>
                              <p className="text-xs text-muted-foreground">Start Date</p>
                            </div>
                            <div className="text-right">
                              <h6 className="text-sm font-semibold">
                                {project.endDate ? new Date(project.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                              </h6>
                              <p className="text-xs text-muted-foreground">Due Date</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No projects found
                    </CardContent>
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
                  onPageSizeChange={(size) => {
                    setPageSize(size)
                    setCurrentPage(1)
                  }}
                />
              </div>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}


