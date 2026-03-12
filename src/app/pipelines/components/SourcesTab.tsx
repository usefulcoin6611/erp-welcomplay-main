"use client"

import React, { useEffect, useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
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

type SourceItem = {
  id: string
  name: string
}

/** Tombol Create Source untuk action slot SmoothTab */
export function SourcesTabCreateButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama source wajib diisi")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal membuat source")
        return
      }
      setName("")
      setOpen(false)
      toast.success("Source berhasil dibuat")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sources:updated"))
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat source")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="blue" className="shadow-none h-7">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Source</DialogTitle>
          <DialogDescription>
            Tambahkan sumber baru untuk lead dan deal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sourceName">Source Name</Label>
            <Input
              id="sourceName"
              placeholder="Website"
              maxLength={50}
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
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 shadow-none"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function SourcesTab() {
  const [sources, setSources] = useState<SourceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<SourceItem | null>(null)
  const [editName, setEditName] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSource, setDeletingSource] = useState<SourceItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadSources = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/sources", { cache: "no-store" })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !Array.isArray(json.data)) {
        return
      }
      const items = (json.data as any[]).map((s) => ({
        id: s.id as string,
        name: s.name as string,
      }))
      setSources(items)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSources()
    const handler = () => {
      loadSources()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("sources:updated", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sources:updated", handler)
      }
    }
  }, [])

  const filteredSources = useMemo(() => {
    if (!search.trim()) return sources
    const q = search.trim().toLowerCase()
    return sources.filter((s) => s.name.toLowerCase().includes(q))
  }, [search, sources])

  const handleEditClick = (source: SourceItem) => {
    setEditingSource(source)
    setEditName(source.name)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingSource) return
    if (!editName.trim()) {
      toast.error("Nama source wajib diisi")
      return
    }
    try {
      setSavingEdit(true)
      const res = await fetch(`/api/sources/${editingSource.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal memperbarui source")
        return
      }
      const updated = json.data as SourceItem
      setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setEditDialogOpen(false)
      setEditingSource(null)
      toast.success("Source berhasil diperbarui")
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui source")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteClick = (source: SourceItem) => {
    setDeletingSource(source)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSource) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/sources/${deletingSource.id}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal menghapus source")
        return
      }
      setSources((prev) => prev.filter((s) => s.id !== deletingSource.id))
      setDeleteDialogOpen(false)
      setDeletingSource(null)
      toast.success("Source berhasil dihapus")
    } catch {
      toast.error("Terjadi kesalahan saat menghapus source")
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
              <CardTitle className="text-base font-medium shrink-0">
                Source List
              </CardTitle>
              <div className="shrink-0">
                <Input
                  placeholder="Search sources..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3 font-medium">
                      Source
                    </TableHead>
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
                  ) : filteredSources.length > 0 ? (
                    filteredSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="px-4 py-3 font-medium">
                          {source.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              onClick={() => handleEditClick(source)}
                            >
                              <IconPencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                              onClick={() => handleDeleteClick(source)}
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
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
                        No sources found
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
            <DialogTitle>Edit Source</DialogTitle>
            <DialogDescription>Ubah nama source.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editSourceName">Source Name</Label>
              <Input
                id="editSourceName"
                placeholder="Website"
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
              disabled={savingEdit}
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
            <AlertDialogTitle>Hapus source</AlertDialogTitle>
            <AlertDialogDescription>
              Source akan dihapus secara permanen. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={handleConfirmDelete}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
