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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconFilter,
  IconLayoutGrid,
  IconList,
  IconFlag,
  IconPaperclip,
  IconMessageCircle,
  IconListCheck,
} from "@tabler/icons-react"
import { Search, X } from 'lucide-react'
import { SimplePagination } from '@/components/ui/simple-pagination'

interface Task {
  id: number
  name: string
  projectName: string
  projectId: number
  stage: string
  priority: string
  endDate: string
  assignedTo: string[]
  completion: number
  attachments: number
  comments: number
  checklists: number
  isOwner?: boolean
}

const tasks: Task[] = [
  {
    id: 1,
    name: "Setup Database Schema",
    projectName: "Implementasi ERP PT Maju Jaya",
    projectId: 1,
    stage: "In Progress",
    priority: "high",
    endDate: "2025-12-15",
    assignedTo: ["Budi", "Sari"],
    completion: 75,
    attachments: 3,
    comments: 5,
    checklists: 2,
    isOwner: true,
  },
  {
    id: 2,
    name: "Design User Interface",
    projectName: "CRM Upgrade CV Kreatif Digital",
    projectId: 2,
    stage: "To Do",
    priority: "medium",
    endDate: "2025-12-20",
    assignedTo: ["Dewi"],
    completion: 30,
    attachments: 1,
    comments: 2,
    checklists: 1,
    isOwner: false,
  },
  {
    id: 3,
    name: "Implement Authentication",
    projectName: "Website Redesign PT Teknologi",
    projectId: 3,
    stage: "Review",
    priority: "critical",
    endDate: "2025-12-10",
    assignedTo: ["Ahmad", "Budi", "Sari"],
    completion: 90,
    attachments: 5,
    comments: 8,
    checklists: 4,
    isOwner: true,
  },
  {
    id: 4,
    name: "Write API Documentation",
    projectName: "Mobile App Development",
    projectId: 4,
    stage: "Done",
    priority: "low",
    endDate: "2025-11-30",
    assignedTo: ["Fauzi"],
    completion: 100,
    attachments: 2,
    comments: 1,
    checklists: 0,
    isOwner: false,
  },
  {
    id: 5,
    name: "Fix Bug in Payment Module",
    projectName: "Implementasi ERP PT Maju Jaya",
    projectId: 1,
    stage: "In Progress",
    priority: "high",
    endDate: "2025-12-18",
    assignedTo: ["Ahmad"],
    completion: 50,
    attachments: 0,
    comments: 3,
    checklists: 1,
    isOwner: true,
  },
  {
    id: 6,
    name: "Optimize Database Queries",
    projectName: "Cloud Migration Project",
    projectId: 5,
    stage: "To Do",
    priority: "medium",
    endDate: "2026-01-05",
    assignedTo: ["Sari", "Dewi"],
    completion: 20,
    attachments: 1,
    comments: 0,
    checklists: 0,
    isOwner: false,
  },
  {
    id: 7,
    name: "Create Test Cases",
    projectName: "CRM Upgrade CV Kreatif Digital",
    projectId: 2,
    stage: "In Progress",
    priority: "medium",
    endDate: "2025-12-25",
    assignedTo: ["Budi"],
    completion: 60,
    attachments: 2,
    comments: 4,
    checklists: 3,
    isOwner: true,
  },
  {
    id: 8,
    name: "Deploy to Production",
    projectName: "Website Redesign PT Teknologi",
    projectId: 3,
    stage: "Review",
    priority: "critical",
    endDate: "2025-12-12",
    assignedTo: ["Ahmad", "Fauzi"],
    completion: 85,
    attachments: 4,
    comments: 6,
    checklists: 2,
    isOwner: false,
  },
]

const priorityMap: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
  high: { label: "High", color: "bg-yellow-100 text-yellow-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-cyan-100 text-cyan-700" },
}

function getPriorityClasses(priority: string) {
  return priorityMap[priority]?.color || "bg-slate-100 text-slate-700"
}

function getCompletionColor(completion: number) {
  if (completion >= 80) return "bg-green-500"
  if (completion >= 50) return "bg-blue-500"
  if (completion >= 25) return "bg-yellow-500"
  return "bg-red-500"
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const taskDate = new Date(date)
  taskDate.setHours(0, 0, 0, 0)
  
  const isOverdue = taskDate < today
  
  return {
    formatted: date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    isOverdue,
  }
}

export default function TaskboardPage() {
  const [view, setView] = useState<"list" | "grid">("list")
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<string>('created_at-desc')
  const [statusFilter, setStatusFilter] = useState<string[]>(['see_my_tasks'])

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = tasks

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(q) ||
          task.projectName.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes('show_all')) {
      if (statusFilter.includes('see_my_tasks')) {
        // Filter to show only tasks assigned to current user
        // For demo, we'll show all tasks
      }
      
      // Priority filter
      const priorityFilters = statusFilter.filter(
        (f) => ['critical', 'high', 'medium', 'low'].includes(f)
      )
      if (priorityFilters.length > 0) {
        filtered = filtered.filter((task) =>
          priorityFilters.includes(task.priority)
        )
      }

      // Due today filter
      if (statusFilter.includes('due_today')) {
        const today = new Date().toISOString().split('T')[0]
        filtered = filtered.filter((task) => task.endDate === today)
      }

      // Over due filter
      if (statusFilter.includes('over_due')) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.endDate)
          taskDate.setHours(0, 0, 0, 0)
          return taskDate < today
        })
      }

      // Starred filter (not implemented in demo)
      if (statusFilter.includes('starred')) {
        // For demo, we'll just return all tasks
      }
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
      } else if (field === 'name') {
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

  const handleSort = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handleStatusFilter = (filter: string) => {
    if (filter === 'show_all') {
      setStatusFilter(['show_all'])
    } else {
      setStatusFilter((prev) => {
        if (prev.includes(filter)) {
          return prev.filter((f) => f !== filter)
        } else {
          if (filter === 'see_my_tasks') {
            return [filter]
          }
          if (['due_today', 'over_due', 'starred'].includes(filter)) {
            // Remove other "other" filters
            const otherFilters = prev.filter(
              (f) => !['due_today', 'over_due', 'starred'].includes(f)
            )
            return [...otherFilters, filter]
          }
          return [...prev, filter]
        }
      })
    }
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
            <div className="flex items-center justify-end">
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
                    <DropdownMenuItem
                      onClick={() => handleSort('created_at-desc')}
                      className={sortBy === 'created_at-desc' ? 'bg-accent' : ''}
                    >
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSort('created_at-asc')}
                      className={sortBy === 'created_at-asc' ? 'bg-accent' : ''}
                    >
                      Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSort('name-asc')}
                      className={sortBy === 'name-asc' ? 'bg-accent' : ''}
                    >
                      From A-Z
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSort('name-desc')}
                      className={sortBy === 'name-desc' ? 'bg-accent' : ''}
                    >
                      From Z-A
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shadow-none h-7"
                      title="Status"
                    >
                      <IconFlag className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('show_all')}
                      className={statusFilter.includes('show_all') ? 'bg-accent' : ''}
                    >
                      Show All
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('see_my_tasks')}
                      className={statusFilter.includes('see_my_tasks') ? 'bg-accent' : ''}
                    >
                      See My Tasks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('critical')}
                      className={statusFilter.includes('critical') ? 'bg-accent' : ''}
                    >
                      Critical
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('high')}
                      className={statusFilter.includes('high') ? 'bg-accent' : ''}
                    >
                      High
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('medium')}
                      className={statusFilter.includes('medium') ? 'bg-accent' : ''}
                    >
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('low')}
                      className={statusFilter.includes('low') ? 'bg-accent' : ''}
                    >
                      Low
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('due_today')}
                      className={statusFilter.includes('due_today') ? 'bg-accent' : ''}
                    >
                      Due Today
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('over_due')}
                      className={statusFilter.includes('over_due') ? 'bg-accent' : ''}
                    >
                      Over Due
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusFilter('starred')}
                      className={statusFilter.includes('starred') ? 'bg-accent' : ''}
                    >
                      Starred
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search */}
            <Card className="shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by Name"
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

            {/* Task List */}
            <Card>
              <CardHeader>
                <CardTitle>Task List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((task) => {
                          const dateInfo = formatDate(task.endDate)
                          return (
                            <TableRow key={task.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <Link
                                    href={`/projects/${task.projectId}/tasks/${task.id}`}
                                    className="text-sm font-semibold text-primary hover:underline block"
                                  >
                                    {task.name}
                                  </Link>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground m-0">
                                      {task.projectName}
                                    </p>
                                    {task.isOwner !== undefined && (
                                      <Badge
                                        className={
                                          task.isOwner
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }
                                      >
                                        {task.isOwner ? "Owner" : "Member"}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{task.stage}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={getPriorityClasses(task.priority)}>
                                  {priorityMap[task.priority]?.label || task.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`text-sm ${
                                    dateInfo.isOverdue ? "text-red-600 font-medium" : ""
                                  }`}
                                >
                                  {dateInfo.formatted}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex -space-x-2">
                                  {task.assignedTo.slice(0, 3).map((user, idx) => (
                                    <Avatar
                                      key={idx}
                                      className="h-8 w-8 border-2 border-white"
                                    >
                                      <AvatarFallback className="text-xs">
                                        {user.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {task.assignedTo.length > 3 && (
                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                      <span className="text-xs font-medium">
                                        +{task.assignedTo.length - 3}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <span className="text-sm font-medium">
                                    {task.completion}%
                                  </span>
                                  <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div
                                      className={`h-2 rounded-full ${getCompletionColor(
                                        task.completion
                                      )}`}
                                      style={{ width: `${task.completion}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3 justify-end">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <IconPaperclip className="h-4 w-4" />
                                    <span>{task.attachments}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <IconMessageCircle className="h-4 w-4" />
                                    <span>{task.comments}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <IconListCheck className="h-4 w-4" />
                                    <span>{task.checklists}</span>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No tasks found
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

