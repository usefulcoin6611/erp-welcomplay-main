"use client"

import React, { useState } from "react"
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

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

const timeTrackers = [
  {
    id: 1,
    title: "Setup Chart of Accounts",
    task: "Setup Chart of Accounts",
    project: "Implementasi ERP PT Maju Jaya",
    startTime: "09:00:00",
    endTime: "13:30:00",
    totalTime: "04:30:00",
  },
  {
    id: 2,
    title: "Migrasi Data Awal",
    task: "Migrasi Data Awal",
    project: "Implementasi ERP PT Maju Jaya",
    startTime: "08:00:00",
    endTime: "14:00:00",
    totalTime: "06:00:00",
  },
  {
    id: 3,
    title: "Desain Pipeline CRM",
    task: "Desain Pipeline CRM",
    project: "CRM Upgrade CV Kreatif Digital",
    startTime: "10:00:00",
    endTime: "16:30:00",
    totalTime: "06:30:00",
  },
] as const

export default function TimeTrackerPage() {
  const totalTrackers = timeTrackers.length
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [trackerToDelete, setTrackerToDelete] = useState<typeof timeTrackers[number] | null>(null)

  const handleDeleteClick = (tracker: typeof timeTrackers[number]) => {
    setTrackerToDelete(tracker)
    setDeleteAlertOpen(true)
  }

  const handleConfirmDelete = () => {
    setTrackerToDelete(null)
    setDeleteAlertOpen(false)
  }

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 space-y-1 flex-1">
            <CardTitle className="text-2xl font-semibold">Time Tracker</CardTitle>
            <CardDescription>
              Lacak waktu per task dan project. Lihat screenshot dan total jam.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 py-3.5">
          <CardTitle>Time Tracker List</CardTitle>
        </CardHeader>
        <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Title</TableHead>
                        <TableHead className="px-6">Task</TableHead>
                        <TableHead className="px-6">Project</TableHead>
                        <TableHead className="px-6">Start Time</TableHead>
                        <TableHead className="px-6">End Time</TableHead>
                        <TableHead className="px-6">Total Time</TableHead>
                        <TableHead className="w-[120px] px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeTrackers.map((tracker) => (
                        <TableRow key={tracker.id}>
                          <TableCell className="px-6">
                            <div className="text-sm font-medium">{tracker.title}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{tracker.task}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{tracker.project}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{tracker.startTime}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{tracker.endTime}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm font-medium">{tracker.totalTime}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                                title="View Screenshot images"
                              >
                                <IconPhoto className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                title="Delete"
                                onClick={() => handleDeleteClick(tracker)}
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
