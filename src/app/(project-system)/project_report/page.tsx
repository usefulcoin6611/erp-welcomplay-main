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
import { Label } from "@/components/ui/label"
import {
  IconEye,
  IconPencil,
  IconSearch,
  IconRefresh,
} from "@tabler/icons-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { SimplePagination } from '@/components/ui/simple-pagination'
import { X } from 'lucide-react'

interface Project {
  id: string
  name: string
  startDate: string
  endDate: string
  users: string[]
  completion: number
  status: string
}

const initialProjects: Project[] = []

const statusMap: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  cancel: { label: "Cancel", color: "bg-red-100 text-red-700" },
  finished: { label: "Finished", color: "bg-green-100 text-green-700" },
}

const statusOptions = [
  { value: "all", label: "Select Status" },
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
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ProjectReportPage() {
  const { user } = useAuth()
  const isCompany = user?.type === 'company'
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    let ignore = false

    async function loadProjects() {
      try {
        setLoading(true)
        setError("")

        const params = new URLSearchParams()
        if (isCompany && selectedStatus && selectedStatus !== "all") {
          params.set("status", selectedStatus)
        }

        const res = await fetch(`/api/projects?${params.toString()}`)
        if (!res.ok) {
          throw new Error("Gagal memuat data project")
        }

        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []

        if (!ignore) {
          setProjects(
            data.map((p: any) => ({
              id: String(p.id),
              name: String(p.name),
              startDate: p.startDate ?? "",
              endDate: p.endDate ?? "",
              users: Array.isArray(p.users) ? p.users : [],
              completion: typeof p.completion === "number" ? p.completion : 0,
              status: String(p.status),
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
  }, [isCompany, selectedStatus])

  const filteredData = useMemo(() => {
    let filtered = projects
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      filtered = filtered.filter((project) => project.name.toLowerCase().includes(q))
    }
    if (isCompany) {
      if (startDate) filtered = filtered.filter((project) => project.startDate >= startDate)
      if (endDate) filtered = filtered.filter((project) => project.endDate <= endDate)
    }
    return filtered
  }, [projects, isCompany, selectedUser, selectedStatus, startDate, endDate, search])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSelectedUser('all')
    setSelectedStatus('all')
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold">Project Reports</CardTitle>
            <CardDescription>
              Pantau laporan dan progres proyek Anda.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {isCompany && (
        <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
          <CardContent className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_14rem_14rem_auto] md:justify-start">
              <div className="space-y-2">
                <Label htmlFor="users" className="text-sm font-medium">Users</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger id="users" className="h-9 bg-white">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status" className="h-9 bg-white">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
                <Input 
                  id="start_date" 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="h-9 bg-white" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                <Input 
                  id="end_date" 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="h-9 bg-white" 
                />
              </div>
              <div className="flex items-center gap-2 md:pt-6">
                <Button 
                  variant="blue" 
                  size="sm" 
                  className="h-9 w-9 p-0 shadow-none shrink-0" 
                  onClick={() => {}}
                >
                  <IconSearch className="h-4 w-4" /> 
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 w-9 p-0 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 shadow-none shrink-0" 
                  onClick={handleReset}
                  title="Reset"
                >
                  <IconRefresh className="h-4 w-4" /> 
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4 space-y-0 py-3.5">
          <CardTitle className="text-base font-medium">Project List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9 w-[250px] bg-gray-50 border-gray-200 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 font-medium">Projects</TableHead>
                  <TableHead className="px-6 font-medium">Start Date</TableHead>
                  <TableHead className="px-6 font-medium">Due Date</TableHead>
                  <TableHead className="px-6 font-medium">Projects Members</TableHead>
                  <TableHead className="px-6 font-medium">Completion</TableHead>
                  <TableHead className="px-6 font-medium">Status</TableHead>
                  <TableHead className="px-6 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="px-6 font-medium">
                        <Link href={`/project_report/${project.id}`} className="hover:underline text-blue-600">{project.name}</Link>
                      </TableCell>
                      <TableCell className="px-6">{formatDate(project.startDate)}</TableCell>
                      <TableCell className="px-6">{formatDate(project.endDate)}</TableCell>
                      <TableCell className="px-6">
                        <div className="flex -space-x-2">
                          {project.users.slice(0, 3).map((user, idx) => (
                            <Avatar key={idx} className="h-8 w-8 border-2 border-white">
                              <AvatarFallback className="text-xs bg-slate-100">{user.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {project.users.length > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                              <span className="text-xs font-medium">+{project.users.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="space-y-1 w-[120px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{project.completion}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full rounded-full ${getCompletionColor(project.completion)}`} style={{ width: `${project.completion}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge variant="outline" className={getStatusClasses(project.status)}>{statusMap[project.status]?.label || project.status}</Badge>
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" 
                            title="View Project Report" 
                            asChild
                          >
                            <Link href={`/project_report/${project.id}`}><IconEye className="h-4 w-4" /></Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No projects found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="px-6 pb-6 pt-4 border-t">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
