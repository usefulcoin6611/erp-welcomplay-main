"use client"

import React, { useEffect, useState } from "react"
import {
  DndContext,
  rectIntersection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconPlus,
  IconGripVertical,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type LeadStage = { id: string; name: string; order: number }
type PipelineOption = { id: string; name: string }

export function LeadStagesTabCreateButton() {
  const [open, setOpen] = useState(false)
  const [pipelines, setPipelines] = useState<PipelineOption[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState("")
  const [name, setName] = useState("")
  const [loadingPipelines, setLoadingPipelines] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
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

    loadPipelines()
  }, [])

  const handleSave = async () => {
    if (!selectedPipelineId) {
      toast.error("Pipeline wajib dipilih")
      return
    }
    if (!name.trim()) {
      toast.error("Nama stage wajib diisi")
      return
    }
    try {
      setSaving(true)
      const res = await fetch("/api/lead-stages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pipelineId: selectedPipelineId,
          name: name.trim(),
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal membuat lead stage")
        return
      }
      setName("")
      setOpen(false)
      toast.success("Lead stage berhasil dibuat")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("lead-stages:updated"))
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat lead stage")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="blue" className="shadow-none h-7">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Lead Stage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Lead Stage</DialogTitle>
          <DialogDescription>
            Buat tahapan lead baru untuk pipeline yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pipeline">Pipeline</Label>
            <Select
              value={selectedPipelineId}
              onValueChange={setSelectedPipelineId}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPipelines ? "Loading..." : "Select Pipeline"} />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              placeholder="New Stage"
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
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 shadow-none"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Lead Stage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SortableLeadStageRow({
  stage,
  onEdit,
  onDelete,
}: {
  stage: LeadStage
  onEdit: () => void
  onDelete: () => void
}) {
  const id = stage.id
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: 'none' }}
      className={`flex cursor-grab active:cursor-grabbing touch-none select-none items-center justify-between gap-2 rounded-md border bg-card px-4 py-3 hover:bg-accent/50 ${
        isDragging ? 'z-10 opacity-90 shadow-md ring-2 ring-primary/20' : ''
      }`}
      {...attributes}
      {...listeners}
      aria-label="Seret untuk mengubah urutan"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <IconGripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="font-medium truncate">{stage.name}</span>
      </div>
      <div
        className="flex shrink-0 gap-2"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
          onClick={onEdit}
        >
          <IconPencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
          onClick={onDelete}
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function LeadStagesTab() {
  const [pipelines, setPipelines] = useState<PipelineOption[]>([])
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("")
  const [leadStages, setLeadStages] = useState<LeadStage[]>([])
  const [loadingPipelines, setLoadingPipelines] = useState(false)
  const [loadingStages, setLoadingStages] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingStage, setEditingStage] = useState<LeadStage | null>(null)
  const [editName, setEditName] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [stageToDelete, setStageToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {})
  )

  const stageIds = leadStages.map((s) => s.id)

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

  const loadLeadStages = async (pipelineId: string) => {
    try {
      setLoadingStages(true)
      const params = new URLSearchParams({ pipelineId })
      const res = await fetch(`/api/lead-stages?${params.toString()}`, {
        cache: "no-store",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !Array.isArray(json.data)) {
        setLeadStages([])
        return
      }
      const items = (json.data as any[]).map((s) => ({
        id: s.id as string,
        name: s.name as string,
        order: Number(s.order ?? 0),
      }))
      setLeadStages(items)
    } catch {
      setLeadStages([])
    } finally {
      setLoadingStages(false)
    }
  }

  useEffect(() => {
    loadPipelines()
  }, [])

  useEffect(() => {
    if (!selectedPipelineId) {
      setLeadStages([])
      return
    }
    loadLeadStages(selectedPipelineId)
  }, [selectedPipelineId])

  useEffect(() => {
    const handler = () => {
      if (selectedPipelineId) {
        loadLeadStages(selectedPipelineId)
      }
    }
    if (typeof window !== "undefined") {
      window.addEventListener("lead-stages:updated", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("lead-stages:updated", handler)
      }
    }
  }, [selectedPipelineId])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const activeId = String(active.id)
    const overId = String(over.id)
    const oldIndex = leadStages.findIndex((s) => s.id === activeId)
    const newIndex = leadStages.findIndex((s) => s.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    
    const reordered = arrayMove([...leadStages], oldIndex, newIndex).map((s, i) => ({ ...s, order: i + 1 }))
    setLeadStages(reordered)

    try {
      const ids = reordered.map((s) => s.id)
      await fetch("/api/lead-stages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      toast.success("Urutan lead stage diperbarui")
    } catch (error) {
      toast.error("Gagal memperbarui urutan")
      if (selectedPipelineId) {
        loadLeadStages(selectedPipelineId) // revert
      }
    }
  }

  const handleEdit = (stage: LeadStage) => {
    setEditingStage(stage)
    setEditName(stage.name)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingStage) return
    if (!editName.trim()) {
      toast.error("Nama stage wajib diisi")
      return
    }
    try {
      setSavingEdit(true)
      const res = await fetch(`/api/lead-stages/${editingStage.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal memperbarui lead stage")
        return
      }
      const updated = json.data as any
      setLeadStages((prev) =>
        prev.map((s) =>
          s.id === updated.id
            ? { ...s, name: updated.name as string }
            : s,
        ),
      )
      setEditDialogOpen(false)
      setEditingStage(null)
      toast.success("Lead stage berhasil diperbarui")
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui lead stage")
    } finally {
      setSavingEdit(false)
    }
  }

  const openDeleteConfirm = (id: string) => {
    setStageToDelete(id)
    setDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    if (!stageToDelete) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/lead-stages/${stageToDelete}`, {
        method: "DELETE",
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Gagal menghapus lead stage")
        return
      }
      setLeadStages((prev) => prev.filter((s) => s.id !== stageToDelete))
      setDeleteAlertOpen(false)
      setStageToDelete(null)
      toast.success("Lead stage berhasil dihapus")
    } catch {
      toast.error("Terjadi kesalahan saat menghapus lead stage")
    } finally {
      setDeleting(false)
    }
  }

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
                >
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder={loadingPipelines ? "Loading..." : "Select Pipeline"} />
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
                <LeadStagesTabCreateButton />
              </div>
            </div>
          </CardContent>
        </Card>

      <Card className="rounded-lg border-0">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Lead Stages</CardTitle>
          <CardDescription className="text-sm">
            Urutkan tahapan lead dengan drag & drop.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 py-4 space-y-2 min-h-[120px]">
            {loadingStages ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : leadStages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada lead stage untuk pipeline ini.</p>
            ) : (
              <DndContext
                collisionDetection={rectIntersection}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
              >
                <SortableContext items={stageIds} strategy={verticalListSortingStrategy}>
                  {leadStages.map((stage) => (
                    <SortableLeadStageRow
                      key={stage.id}
                      stage={stage}
                      onEdit={() => handleEdit(stage)}
                      onDelete={() => openDeleteConfirm(stage.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
          <p className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3 mt-0">
            <strong>Note:</strong> Seret ikon grip untuk mengubah urutan lead stage.
          </p>
        </CardContent>
      </Card>
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Lead Stage</DialogTitle>
            <DialogDescription>
              Ubah nama lead stage pada pipeline terpilih.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editStageName">Stage Name</Label>
              <Input
                id="editStageName"
                placeholder="Stage Name"
                maxLength={50}
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
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Lead Stage?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus stage ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
