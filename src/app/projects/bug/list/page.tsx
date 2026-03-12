"use client"

import React, { useState } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPlus, IconSearch, IconGridDots, IconPencil, IconTrash } from "@tabler/icons-react"

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

const bugs = [
  {
    id: 101,
    bugId: "BUG-101",
    project: "Implementasi ERP PT Maju Jaya",
    title: "Error saat posting jurnal",
    priority: "high" as const,
    status: "Open" as const,
    startDate: "2025-10-05",
    dueDate: "2025-10-08",
    assignTo: "Budi Santoso",
    createdBy: "Sari Wijaya",
  },
  {
    id: 102,
    bugId: "BUG-102",
    project: "CRM Upgrade CV Kreatif Digital",
    title: "Pipeline tidak muncul di dashboard",
    priority: "medium" as const,
    status: "In Progress" as const,
    startDate: "2025-11-02",
    dueDate: "2025-11-06",
    assignTo: "Ahmad Fauzi",
    createdBy: "Dewi Lestari",
  },
] as const

function getPriorityClasses(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-none"
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-none"
    case "low":
      return "bg-green-100 text-green-700 border-none"
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-700 border-none"
    case "In Progress":
      return "bg-yellow-100 text-yellow-700 border-none"
    case "Closed":
      return "bg-green-100 text-green-700 border-none"
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

export default function BugListPage() {
  const total = bugs.length
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [bugToDelete, setBugToDelete] = useState<typeof bugs[number] | null>(null)

  const handleDeleteClick = (bug: typeof bugs[number]) => {
    setBugToDelete(bug)
    setDeleteAlertOpen(true)
  }

  const handleConfirmDelete = () => {
    setBugToDelete(null)
    setDeleteAlertOpen(false)
  }

  return (
    <>
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 space-y-1 flex-1">
            <CardTitle className="text-2xl font-semibold">Bug Report</CardTitle>
            <CardDescription>
              Kelola laporan bug per project. Buat dan lacak status bug.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 shadow-none"
            >
              <IconGridDots className="mr-2 h-4 w-4" />
              Kanban
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Bug
                </Button>
              </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Bug</DialogTitle>
                      <DialogDescription>
                        Laporkan bug baru sesuai modul Bug Report ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            placeholder="Error saat posting jurnal"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="priority">
                            Priority <span className="text-red-500">*</span>
                          </Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="startDate">
                            Start Date <span className="text-red-500">*</span>
                          </Label>
                          <Input id="startDate" type="date" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="dueDate">
                            Due Date <span className="text-red-500">*</span>
                          </Label>
                          <Input id="dueDate" type="date" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="status">
                            Bug Status <span className="text-red-500">*</span>
                          </Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="assignTo">
                            Assigned To <span className="text-red-500">*</span>
                          </Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="budi">Budi Santoso</SelectItem>
                              <SelectItem value="sari">Sari Wijaya</SelectItem>
                              <SelectItem value="ahmad">Ahmad Fauzi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter Description"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" className="shadow-none">
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={CARD_STYLE}>
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-medium">Total Bugs</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card className={CARD_STYLE}>
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-medium">Open Bugs</CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold">
              {bugs.filter((b) => b.status === "Open" || b.status === "In Progress").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={CARD_STYLE}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-3.5">
          <CardTitle>Bug List</CardTitle>
          <div className="relative w-full max-w-xs">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input placeholder="Search bugs..." className="h-9 pl-9 bg-gray-50 border-0 shadow-none focus-visible:border-0 focus-visible:ring-0" />
          </div>
        </CardHeader>
        <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Bug Id</TableHead>
                        <TableHead className="px-6">Assign To</TableHead>
                        <TableHead className="px-6">Bug Title</TableHead>
                        <TableHead className="px-6">Start Date</TableHead>
                        <TableHead className="px-6">Due Date</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                        <TableHead className="px-6">Priority</TableHead>
                        <TableHead className="px-6">Created By</TableHead>
                        <TableHead className="w-[120px] px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bugs.map((bug) => (
                        <TableRow key={bug.id}>
                          <TableCell className="px-6">
                            <div className="text-sm font-medium">{bug.bugId}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{bug.assignTo}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <Link
                              href={`/projects/bug/${bug.id}`}
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              {bug.title}
                            </Link>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{bug.startDate}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{bug.dueDate}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <Badge className={getStatusClasses(bug.status)}>
                              {bug.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6">
                            <Badge className={getPriorityClasses(bug.priority)}>
                              {bug.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm">{bug.createdBy}</div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                title="Edit"
                              >
                                <IconPencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                title="Delete"
                                onClick={() => handleDeleteClick(bug)}
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
            <AlertDialogTitle>Hapus Bug?</AlertDialogTitle>
            <AlertDialogDescription>
              Bug &quot;{bugToDelete?.title}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

