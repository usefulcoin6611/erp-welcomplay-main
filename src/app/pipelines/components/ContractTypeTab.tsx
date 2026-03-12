"use client"

import React, { useEffect, useState } from "react"
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

type ContractTypeItem = {
  id: string
  name: string
}

export function ContractTypeTabCreateButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama contract type wajib diisi")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/contract-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal menyimpan contract type")
        return
      }
      setName("")
      setOpen(false)
      toast.success("Contract type berhasil dibuat")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("contract-types:updated"))
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan contract type")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="blue" className="shadow-none h-7">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Contract Type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Contract Type</DialogTitle>
          <DialogDescription>
            Tambahkan tipe kontrak baru.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="typeName">Contract Type Name</Label>
            <Input
              id="typeName"
              placeholder="Service Agreement"
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
            {saving ? "Saving..." : "Save Contract Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ContractTypeTab() {
  const [contractTypes, setContractTypes] = useState<ContractTypeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ContractTypeItem | null>(null)
  const [editName, setEditName] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<ContractTypeItem | null>(null)
  const [deletingLoading, setDeletingLoading] = useState(false)

  const loadContractTypes = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/contract-types", { cache: "no-store" })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !Array.isArray(json.data)) {
        return
      }
      setContractTypes(json.data as ContractTypeItem[])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContractTypes()
    const handler = () => {
      loadContractTypes()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("contract-types:updated", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("contract-types:updated", handler)
      }
    }
  }, [])

  const handleEditClick = (type: ContractTypeItem) => {
    setEditing(type)
    setEditName(type.name)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    if (!editName.trim()) {
      toast.error("Nama contract type wajib diisi")
      return
    }
    try {
      setSavingEdit(true)
      const res = await fetch(`/api/contract-types/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal memperbarui contract type")
        return
      }
      const updated = json.data as ContractTypeItem
      setContractTypes((prev) =>
        prev.map((ct) => (ct.id === updated.id ? updated : ct)),
      )
      setEditDialogOpen(false)
      setEditing(null)
      toast.success("Contract type berhasil diperbarui")
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui contract type")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteClick = (type: ContractTypeItem) => {
    setDeleting(type)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleting) return
    try {
      setDeletingLoading(true)
      const res = await fetch(`/api/contract-types/${deleting.id}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal menghapus contract type")
        return
      }
      setContractTypes((prev) =>
        prev.filter((ct) => ct.id !== deleting.id),
      )
      setDeleteDialogOpen(false)
      setDeleting(null)
      toast.success("Contract type berhasil dihapus")
    } catch {
      toast.error("Terjadi kesalahan saat menghapus contract type")
    } finally {
      setDeletingLoading(false)
    }
  }
  return (
    <>
      <div className="space-y-4">
        <Card className="rounded-lg border-0">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base font-medium">Contract Type List</CardTitle>
            <CardDescription className="text-sm">
              Daftar tipe kontrak yang tersedia.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3 font-medium">Name</TableHead>
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
                  ) : contractTypes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No contract types found
                      </TableCell>
                    </TableRow>
                  ) : (
                    contractTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="px-4 py-3 font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              onClick={() => handleEditClick(type)}
                            >
                              <IconPencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                              onClick={() => handleDeleteClick(type)}
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
          </CardContent>
        </Card>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Contract Type</DialogTitle>
            <DialogDescription>Ubah nama contract type.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editContractTypeName">Contract Type Name</Label>
              <Input
                id="editContractTypeName"
                placeholder="Service Agreement"
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
            <AlertDialogTitle>Hapus contract type</AlertDialogTitle>
            <AlertDialogDescription>
              Contract type akan dihapus secara permanen. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deletingLoading}
              onClick={handleConfirmDelete}
            >
              {deletingLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
