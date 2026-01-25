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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  IconLayoutGrid,
  IconList,
  IconArrowLeft,
  IconPaperclip,
  IconMessageCircle,
} from "@tabler/icons-react"
import { Search, X } from 'lucide-react'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { useAuth } from "@/contexts/auth-context"

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

export default function BugsReportPage() {
  const { user } = useAuth()
  const isCompany = user?.type === 'company'
  
  const [view, setView] = useState<"list" | "grid">("list")
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

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
                    variant="blue"
                    size="sm"
                    className="shadow-none h-7"
                    title="Grid View"
                    onClick={() => setView("grid")}
                  >
                    <IconLayoutGrid className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    variant="blue"
                    size="sm"
                    className="shadow-none h-7"
                    title="List View"
                    onClick={() => setView("list")}
                  >
                    <IconList className="h-3 w-3" />
                  </Button>
                )}
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

            {/* Search */}
            <Card className="shadow-none">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bugs..."
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

            {/* Bug List */}
            <Card>
              <CardHeader>
                <CardTitle>Bug Report List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Bug Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((bug) => {
                          const dateInfo = formatDate(bug.dueDate)
                          return (
                            <TableRow key={bug.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <Link
                                    href={`/projects/${bug.projectId}/bugs/${bug.id}`}
                                    className="text-sm font-semibold text-primary hover:underline block"
                                  >
                                    {bug.title}
                                  </Link>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground m-0">
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
                              <TableCell>
                                <Badge className={getBugStatusClasses(bug.bugStatus)}>
                                  {bug.bugStatus}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getPriorityClasses(bug.priority)}>
                                  {priorityMap[bug.priority]?.label || bug.priority}
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
                                <div className="flex items-center">
                                  <span className="text-sm">{bug.createdBy}</span>
                                </div>
                              </TableCell>
                              <TableCell>
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
                              <TableCell>
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

