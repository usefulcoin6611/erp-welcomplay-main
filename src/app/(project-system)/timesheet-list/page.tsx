"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { IconSearch } from "@tabler/icons-react"
import { SimplePagination } from "@/components/ui/simple-pagination"

type TimesheetRow = {
  id: string
  projectId: string
  project: string
  task: string
  date: string
  time: string
  user: string
}

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

export default function TimesheetListPage() {
  const [rows, setRows] = useState<TimesheetRow[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    let ignore = false

    async function loadTimesheets() {
      try {
        const res = await fetch("/api/projects/timesheets")
        if (!res.ok) {
          throw new Error("Gagal memuat data timesheet")
        }
        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []
        if (!ignore) {
          setRows(
            data.map((t: any) => ({
              id: String(t.id),
              projectId: String(t.projectId ?? ""),
              project: String(t.project ?? ""),
              task: String(t.task ?? ""),
              date: String(t.date ?? ""),
              time: String(t.time ?? ""),
              user: String(t.user ?? ""),
            })),
          )
        }
      } catch {
        if (!ignore) {
          setRows([])
        }
      }
    }

    loadTimesheets()

    return () => {
      ignore = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      (r) =>
        r.project.toLowerCase().includes(q) ||
        r.task.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q),
    )
  }, [rows, search])

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filtered.slice(startIndex, endIndex)
  }, [filtered, currentPage, pageSize])

  const totalHours = useMemo(() => {
    const totalMinutes = rows.reduce((sum, r) => {
      const [h, m] = r.time.split(":").map((v) => parseInt(v || "0", 10))
      if (isNaN(h) || isNaN(m)) return sum
      return (sum + h * 60 + m)
    }, 0)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }, [rows])

  return (
    <div className="flex flex-col gap-4">
      {/* Title / header card with stats */}
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 pb-4 space-y-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Timesheet List</CardTitle>
            <CardDescription>
              Kelola timesheet per project dan task. Lihat jam kerja yang tercatat.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-lg bg-muted/50 px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-muted-foreground">Total Entries</span>
              <span className="text-xl font-bold tabular-nums">{rows.length}</span>
            </div>
            <div className="h-4 w-px bg-border shrink-0" aria-hidden />
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-muted-foreground">Total Hours</span>
              <span className="text-xl font-bold tabular-nums">{totalHours}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timesheet List card: search + table */}
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4 py-3.5">
          <CardTitle className="text-base font-medium">Timesheet List</CardTitle>
          <div className="relative w-full sm:w-auto sm:min-w-[220px]">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search project or task..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 pl-9 w-full bg-gray-50 border-0 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
              />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 font-medium">Project</TableHead>
                  <TableHead className="px-6 font-medium">Task</TableHead>
                  <TableHead className="px-6 font-medium">Date</TableHead>
                  <TableHead className="px-6 font-medium">User</TableHead>
                  <TableHead className="px-6 font-medium text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No timesheets found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="px-6 font-medium">{row.project}</TableCell>
                      <TableCell className="px-6">{row.task}</TableCell>
                      <TableCell className="px-6">{row.date}</TableCell>
                      <TableCell className="px-6">{row.user}</TableCell>
                      <TableCell className="px-6 text-right font-medium">{row.time}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 pb-6 pt-4 border-t">
              <SimplePagination
                totalCount={filtered.length}
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
  )
}
