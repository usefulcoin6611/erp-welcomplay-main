"use client"

import React, { useEffect, useMemo, useState } from "react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { IconPlus, IconSearch, IconPhoto, IconTrash } from "@tabler/icons-react"
import { SimplePagination } from "@/components/ui/simple-pagination"

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

type TrackerRow = {
  id: string
  projectId: string
  title: string
  task: string
  project: string
  startTime: string
  endTime: string
  totalTime: string
}

export default function TimeTrackerPage() {
  const [rows, setRows] = useState<TrackerRow[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [trackerToDelete, setTrackerToDelete] = useState<TrackerRow | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadTrackers() {
      try {
        const res = await fetch("/api/projects/time-trackers")
        if (!res.ok) {
          throw new Error("Gagal memuat data time tracker")
        }
        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []
        if (!ignore) {
          setRows(
            data.map((t: any) => ({
              id: String(t.id),
              projectId: String(t.projectId ?? ""),
              title: String(t.title ?? ""),
              task: String(t.task ?? ""),
              project: String(t.project ?? ""),
              startTime: String(t.startTime ?? ""),
              endTime: String(t.endTime ?? ""),
              totalTime: String(t.totalTime ?? ""),
            })),
          )
        }
      } catch {
        if (!ignore) {
          setRows([])
        }
      }
    }

    loadTrackers()

    return () => {
      ignore = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.task.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q),
    )
  }, [rows, search])

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filtered.slice(startIndex, endIndex)
  }, [filtered, currentPage, pageSize])

  const totalTrackers = rows.length

  const handleDeleteClick = (tracker: TrackerRow) => {
    setTrackerToDelete(tracker)
    setDeleteAlertOpen(true)
  }

  const handleConfirmDelete = () => {
    // Implement delete logic here
    setRows(rows.filter((r) => r.id !== trackerToDelete?.id))
    setTrackerToDelete(null)
    setDeleteAlertOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold">Time Tracker</CardTitle>
            <CardDescription>
              Lacak waktu per task dan project. Lihat screenshot dan total jam.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4 space-y-0 py-3.5">
          <CardTitle className="text-base font-medium">Time Tracker List</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 pl-9 w-full bg-gray-50 border-0 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6 font-medium">Title</TableHead>
                        <TableHead className="px-6 font-medium">Task</TableHead>
                        <TableHead className="px-6 font-medium">Project</TableHead>
                        <TableHead className="px-6 font-medium">Start Time</TableHead>
                        <TableHead className="px-6 font-medium">End Time</TableHead>
                        <TableHead className="px-6 font-medium">Total Time</TableHead>
                        <TableHead className="w-[120px] px-6 font-medium text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            No time trackers found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedRows.map((tracker) => (
                          <TableRow key={tracker.id}>
                            <TableCell className="px-6 font-medium">{tracker.title}</TableCell>
                            <TableCell className="px-6">{tracker.task}</TableCell>
                            <TableCell className="px-6">{tracker.project}</TableCell>
                            <TableCell className="px-6">{tracker.startTime}</TableCell>
                            <TableCell className="px-6">{tracker.endTime}</TableCell>
                            <TableCell className="px-6">{tracker.totalTime}</TableCell>
                            <TableCell className="px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  title="View Screenshot images"
                                >
                                  <IconPhoto className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 shadow-none bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100"
                                  title="Delete"
                                  onClick={() => handleDeleteClick(tracker)}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
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

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Time Tracker?</AlertDialogTitle>
            <AlertDialogDescription>
              Entri &quot;{trackerToDelete?.title}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
