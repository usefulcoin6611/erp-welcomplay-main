"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useProjectDashboard } from "@/contexts/project-dashboard-context"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const statusLabelMap: Record<string, string> = {
  on_going: 'In Progress',
  on_hold: 'On Hold',
  complete: 'Complete',
  cancelled: 'Cancelled',
}

export function TopDueProjects() {
  const t = useTranslations('projectDashboard.topDueProjects')
  const { data, loading } = useProjectDashboard()
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const allProjects = data.topDueProjects.map((p) => ({
    id: p.id,
    name: p.name,
    budget: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(p.budget),
    endDate: p.endDate ? new Date(p.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
    status: p.status,
    statusLabel: statusLabelMap[p.status] ?? p.status,
  }))

  const totalPages = Math.ceil(allProjects.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const projects = allProjects.slice(startIndex, startIndex + pageSize)

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'on_going': 'bg-blue-500 hover:bg-blue-600',
      'on_hold': 'bg-yellow-500 hover:bg-yellow-600',
      'complete': 'bg-green-500 hover:bg-green-600',
      'cancelled': 'bg-red-500 hover:bg-red-600',
    }
    return statusMap[status] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
        </CardHeader>
        <CardContent><Skeleton className="h-[240px] w-full" /></CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-none bg-white dark:bg-gray-900/50 flex flex-col h-full">
      <CardHeader className="p-6 pb-3">
        <CardTitle className="text-base font-semibold">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="px-6 flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-transparent border-0 hover:bg-transparent">
                <TableHead className="py-4 h-auto text-xs font-bold uppercase tracking-wider text-muted-foreground bg-transparent">{t('name')}</TableHead>
                <TableHead className="py-4 h-auto text-xs font-bold uppercase tracking-wider text-muted-foreground bg-transparent">{t('endDate')}</TableHead>
                <TableHead className="py-4 h-auto text-xs font-bold uppercase tracking-wider text-muted-foreground bg-transparent">{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    {t('noProjects')}
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id} className="border-0">
                    <TableCell className="py-4">
                      <Link href={`/projects/project/${project.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground text-[10px] font-bold transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                          {project.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="font-bold text-sm leading-tight transition-colors group-hover:text-primary">{project.name}</h6>
                          <p className="text-xs font-semibold text-cyan-600 mt-0.5">{project.budget}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 text-xs font-medium text-muted-foreground">{project.endDate}</TableCell>
                    <TableCell className="py-4">
                      <Badge className={`${getStatusColor(project.status)} text-[10px] font-bold uppercase tracking-wide px-2 py-0 border-0 text-white shadow-none`}>
                        {project.statusLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="p-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Rows per page</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px] text-[10px] font-bold border-0 bg-muted/30 shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border shadow-none">
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)} className="text-[10px] font-bold">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {startIndex + 1}-{Math.min(startIndex + pageSize, allProjects.length)} OF {allProjects.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
