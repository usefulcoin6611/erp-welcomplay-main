"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

type PipelineOption = {
  id: string
  name: string
}

type PipelineLabelItem = {
  id: string
  name: string
  color: string
}

const LABEL_COLOR_PLACEHOLDER = "__none__"
const PIPELINE_PLACEHOLDER = "__none__"

const labelColors = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
] as const

/** Tombol Create Label untuk action slot SmoothTab */
export function LabelsTabCreateButton({
  pipelines = [],
  selectedPipelineId = "",
}: {
  pipelines?: PipelineOption[]
  selectedPipelineId?: string
}) {
  const [open, setOpen] = useState(false)
  const [pipelineId, setPipelineId] = useState<string>(PIPELINE_PLACEHOLDER)
  const [name, setName] = useState("")
  const [color, setColor] = useState<string>(LABEL_COLOR_PLACEHOLDER)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (selectedPipelineId) {
      setPipelineId(selectedPipelineId)
    } else if (pipelines.length > 0) {
      setPipelineId(pipelines[0].id)
    } else {
      setPipelineId(PIPELINE_PLACEHOLDER)
    }
  }, [open, selectedPipelineId, pipelines])

  const handleSave = async () => {
    if (!pipelineId || pipelineId === PIPELINE_PLACEHOLDER) {
      toast.error("Pipeline wajib dipilih")
      return
    }
    if (!name.trim()) {
      toast.error("Nama label wajib diisi")
      return
    }
    if (!color || color === LABEL_COLOR_PLACEHOLDER) {
      toast.error("Warna label wajib dipilih")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/pipeline-labels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pipelineId,
          name: name.trim(),
          color,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal membuat label")
        return
      }
      setName("")
      setColor(LABEL_COLOR_PLACEHOLDER)
      setOpen(false)
      toast.success("Label berhasil dibuat")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("pipeline-labels:updated"))
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat label")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="blue"
          className="shadow-none h-7"
          disabled={pipelines.length === 0}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Create Label
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Label</DialogTitle>
          <DialogDescription>
            Buat label baru dengan warna untuk pipeline yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pipeline">Pipeline</Label>
            <Select
              value={pipelineId || PIPELINE_PLACEHOLDER}
              onValueChange={setPipelineId}
              disabled={pipelines.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Pipeline">
                  {pipelineId && pipelineId !== PIPELINE_PLACEHOLDER
                    ? pipelines.find((p) => p.id === pipelineId)?.name
                    : "Select Pipeline"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PIPELINE_PLACEHOLDER}>
                  Select Pipeline
                </SelectItem>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="labelName">Label Name</Label>
            <Input
              id="labelName"
              placeholder="Hot"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="labelColor">Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LABEL_COLOR_PLACEHOLDER}>
                  Select Color
                </SelectItem>
                {labelColors.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: c.value }}
                      />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {saving ? "Saving..." : "Save Label"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function LabelsTab() {
  const [pipelines, setPipelines] = useState<PipelineOption[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("")
  const [labels, setLabels] = useState<PipelineLabelItem[]>([])
  const [loadingPipelines, setLoadingPipelines] = useState(false)
  const [loadingLabels, setLoadingLabels] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<PipelineLabelItem | null>(
    null,
  )
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState<string>("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingLabel, setDeletingLabel] = useState<PipelineLabelItem | null>(
    null,
  )
  const [deleting, setDeleting] = useState(false)

  const loadPipelines = async () => {
    try {
      setLoadingPipelines(true)
      const res = await fetch("/api/pipelines", { cache: "no-store" })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !Array.isArray(json.data)) {
        return
      }
      const items = (json.data as any[]).map((p) => ({
        id: p.id as string,
        name: p.name as string,
      }))
      setPipelines(items)
      if (!selectedPipelineId && items.length > 0) {
        setSelectedPipelineId(items[0].id)
      }
    } catch {
    } finally {
      setLoadingPipelines(false)
    }
  }

  const loadLabels = async (pipelineId: string) => {
    try {
      setLoadingLabels(true)
      const res = await fetch(
        `/api/pipeline-labels?pipelineId=${encodeURIComponent(pipelineId)}`,
        { cache: "no-store" },
      )
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !Array.isArray(json.data)) {
        setLabels([])
        return
      }
      const items = (json.data as any[]).map((l) => ({
        id: l.id as string,
        name: l.name as string,
        color: l.color as string,
      }))
      setLabels(items)
    } catch {
      setLabels([])
    } finally {
      setLoadingLabels(false)
    }
  }

  useEffect(() => {
    loadPipelines()
  }, [])

  useEffect(() => {
    if (!selectedPipelineId) {
      setLabels([])
      return
    }
    loadLabels(selectedPipelineId)
  }, [selectedPipelineId])

  useEffect(() => {
    const handler = () => {
      if (selectedPipelineId) {
        loadLabels(selectedPipelineId)
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("pipeline-labels:updated", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pipeline-labels:updated", handler)
      }
    }
  }, [selectedPipelineId])

  const handleEditClick = (label: PipelineLabelItem) => {
    setEditingLabel(label)
    setEditName(label.name)
    setEditColor(label.color)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingLabel) return
    if (!editName.trim()) {
      toast.error("Nama label wajib diisi")
      return
    }
    if (!editColor) {
      toast.error("Warna label wajib dipilih")
      return
    }
    try {
      setSavingEdit(true)
      const res = await fetch(`/api/pipeline-labels/${editingLabel.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          color: editColor,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal memperbarui label")
        return
      }
      const updated = json.data as PipelineLabelItem
      setLabels((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l)),
      )
      setEditDialogOpen(false)
      setEditingLabel(null)
      toast.success("Label berhasil diperbarui")
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui label")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteClick = (label: PipelineLabelItem) => {
    setDeletingLabel(label)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingLabel) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/pipeline-labels/${deletingLabel.id}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal menghapus label")
        return
      }
      setLabels((prev) => prev.filter((l) => l.id !== deletingLabel.id))
      setDeleteDialogOpen(false)
      setDeletingLabel(null)
      toast.success("Label berhasil dihapus")
    } catch {
      toast.error("Terjadi kesalahan saat menghapus label")
    } finally {
      setDeleting(false)
    }
  }

  const hasPipelines = pipelines.length > 0

  const currentPipelineName = useMemo(() => {
    if (!selectedPipelineId) return ""
    const p = pipelines.find((pl) => pl.id === selectedPipelineId)
    return p?.name ?? ""
  }, [pipelines, selectedPipelineId])

  return (
    <>
      <div className="space-y-4">
        <Card className="rounded-lg border-0">
          <CardContent className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Pipeline</span>
                <Select
                  value={selectedPipelineId}
                  onValueChange={setSelectedPipelineId}
                  disabled={loadingPipelines || !hasPipelines}
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue
                      placeholder={
                        loadingPipelines
                          ? "Loading..."
                          : hasPipelines
                          ? "Select Pipeline"
                          : "No pipelines"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {pipelines.map((pipeline) => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto">
                <LabelsTabCreateButton
                  pipelines={pipelines}
                  selectedPipelineId={selectedPipelineId}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-0">
          <CardHeader className="px-4 py-3 border-b">
            <CardTitle className="text-base font-medium">Labels</CardTitle>
            <CardDescription className="text-sm">
              Daftar label untuk mengkategorikan lead dan deal.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 py-4 space-y-2">
              {loadingLabels ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : !selectedPipelineId ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Silakan pilih pipeline terlebih dahulu
                </div>
              ) : labels.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Belum ada label untuk pipeline ini
                </div>
              ) : (
                labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between rounded-md border bg-card px-4 py-3 hover:bg-accent/50"
                  >
                    <Badge
                      className="border-none"
                      style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        onClick={() => handleEditClick(label)}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                        onClick={() => handleDeleteClick(label)}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
            <DialogDescription>Ubah nama dan warna label.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editLabelName">Label Name</Label>
              <Input
                id="editLabelName"
                placeholder="Hot"
                maxLength={50}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editLabelColor">Color</Label>
              <Select
                value={editColor}
                onValueChange={setEditColor}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Color" />
                </SelectTrigger>
                <SelectContent>
                  {labelColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>Hapus label</AlertDialogTitle>
            <AlertDialogDescription>
              Label akan dihapus secara permanen. Tindakan ini tidak dapat
              dibatalkan.
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
