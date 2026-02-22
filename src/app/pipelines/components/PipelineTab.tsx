"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconPlus,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'
import { Search, X } from 'lucide-react'
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
import { toast } from "sonner"

type PipelineItem = {
  id: string
  name: string
  deals: number
  value: number
}

export function PipelineTabCreateButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama pipeline wajib diisi")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/pipelines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal membuat pipeline")
        return
      }
      setName("")
      setOpen(false)
      toast.success("Pipeline berhasil dibuat")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("pipelines:updated"))
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat pipeline")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="blue" className="shadow-none h-7">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Pipeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Pipeline</DialogTitle>
          <DialogDescription>
            Tambahkan pipeline baru seperti di modul Pipeline ERP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pipelineName">Pipeline Name</Label>
            <Input
              id="pipelineName"
              placeholder="Default Pipeline"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="shadow-none"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 shadow-none"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Pipeline"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PipelineTab() {
  const [search, setSearch] = useState('')
  const [pipelines, setPipelines] = useState<PipelineItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPipeline, setEditingPipeline] = useState<PipelineItem | null>(null)
  const [editName, setEditName] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPipeline, setDeletingPipeline] = useState<PipelineItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadPipelines = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/pipelines", { cache: "no-store" })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !Array.isArray(json.data)) {
        return
      }
      setPipelines(json.data as PipelineItem[])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPipelines()
    const handler = () => {
      loadPipelines()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("pipelines:updated", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pipelines:updated", handler)
      }
    }
  }, [])

  const filteredPipelines = useMemo(() => {
    if (!search.trim()) return pipelines
    const q = search.trim().toLowerCase()
    return pipelines.filter((p) => p.name.toLowerCase().includes(q))
  }, [search, pipelines])

  const handleEditClick = (pipeline: PipelineItem) => {
    setEditingPipeline(pipeline)
    setEditName(pipeline.name)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingPipeline) return
    if (!editName.trim()) {
      toast.error("Nama pipeline wajib diisi")
      return
    }
    try {
      setSavingEdit(true)
      const res = await fetch(`/api/pipelines/${editingPipeline.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal memperbarui pipeline")
        return
      }
      const updated = json.data as PipelineItem
      setPipelines((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditDialogOpen(false)
      setEditingPipeline(null)
      toast.success("Pipeline berhasil diperbarui")
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui pipeline")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteClick = (pipeline: PipelineItem) => {
    setDeletingPipeline(pipeline)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingPipeline) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/pipelines/${deletingPipeline.id}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal menghapus pipeline")
        return
      }
      setPipelines((prev) => prev.filter((p) => p.id !== deletingPipeline.id))
      setDeleteDialogOpen(false)
      setDeletingPipeline(null)
      toast.success("Pipeline berhasil dihapus")
    } catch {
      toast.error("Terjadi kesalahan saat menghapus pipeline")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <Card className="rounded-lg border-0">
        <CardHeader className="px-4 py-3 border-b w-full">
          <div className="flex w-full items-center justify-between gap-4">
            <CardTitle className="text-base font-medium shrink-0">Pipeline List</CardTitle>
            <div className="shrink-0">
              <div className="relative w-64 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pipelines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                />
                {search.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 font-medium">Pipeline</TableHead>
                  <TableHead className="px-4 py-3 text-right w-[250px] font-medium">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPipelines.length > 0 ? (
                  filteredPipelines.map((pipeline) => (
                    <TableRow key={pipeline.id}>
                      <TableCell className="px-4 py-3 font-medium">
                        {pipeline.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                            onClick={() => handleEditClick(pipeline)}
                          >
                            <IconPencil className="h-4 w-4" />
                          </Button>
                          {pipelines.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                              onClick={() => handleDeleteClick(pipeline)}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No pipelines found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Pipeline</DialogTitle>
            <DialogDescription>
              Ubah nama pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editPipelineName">Pipeline Name</Label>
              <Input
                id="editPipelineName"
                placeholder="Default Pipeline"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="shadow-none"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 shadow-none"
              disabled={savingEdit}
              onClick={handleSaveEdit}
            >
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus pipeline
            </AlertDialogTitle>
            <AlertDialogDescription>
              Pipeline akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleConfirmDelete}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
