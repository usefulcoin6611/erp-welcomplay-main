"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
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
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { IconPlus, IconPencil, IconTrash, IconGripVertical } from "@tabler/icons-react"
import { SmoothTab } from "@/components/ui/smooth-tab"
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

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

type ProjectStage = {
  id: string
  name: string
  order: number
}

type BugStatus = {
  id: string
  title: string
  order: number
}

// Context to share refresh functions
const ProjectStagesContext = createContext<{
  refreshTaskStages: () => void
  refreshBugStatuses: () => void
}>({
  refreshTaskStages: () => {},
  refreshBugStatuses: () => {},
})

/** Tombol Create Stage untuk action SmoothTab */
function CreateStageButton() {
  const { refreshTaskStages } = useContext(ProjectStagesContext)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/project-task-stages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || "Gagal membuat stage")

      toast.success("Stage berhasil dibuat")
      setOpen(false)
      setName("")
      refreshTaskStages()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600 border-0">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Stage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Create Project Task Stage</DialogTitle>
          <DialogDescription>
            Tambahkan stage baru untuk task project sesuai modul Project Task Stage ERP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              placeholder="Planning"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="shadow-none" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Stage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Tombol Create Bug Status untuk action SmoothTab */
function CreateBugStatusButton() {
  const { refreshBugStatuses } = useContext(ProjectStagesContext)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/bug-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message || "Gagal membuat bug status")

      toast.success("Bug status berhasil dibuat")
      setOpen(false)
      setTitle("")
      refreshBugStatuses()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600 border-0">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Bug Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Create Bug Status</DialogTitle>
          <DialogDescription>
            Tambahkan status bug baru sesuai modul Bug Status ERP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bugStatusTitle">Bug Status Title</Label>
            <Input
              id="bugStatusTitle"
              placeholder="Enter Bug Status Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="shadow-none" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SortableProjectStageRow({
  stage,
  onEdit,
  onDelete,
}: {
  stage: ProjectStage
  onEdit: () => void
  onDelete: () => void
}) {
  const id = String(stage.id)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: "none" }}
      className={`flex cursor-grab active:cursor-grabbing touch-none select-none items-center justify-between gap-2 rounded-md border bg-card px-4 py-3 hover:bg-accent/50 ${
        isDragging ? "z-10 opacity-90 shadow-md ring-2 ring-primary/20" : ""
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
          className="h-8 w-8 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
          onClick={onEdit}
          title="Edit"
        >
          <IconPencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
          onClick={onDelete}
          title="Delete"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ProjectTaskStageContent({ registerRefresh }: { registerRefresh: (fn: () => void) => void }) {
  const [stages, setStages] = useState<ProjectStage[]>([])
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStage, setEditingStage] = React.useState<ProjectStage | null>(null)
  const [deleteStage, setDeleteStage] = React.useState<ProjectStage | null>(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {})
  )

  const fetchStages = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/project-task-stages")
      const json = await res.json()
      if (json.success) {
        setStages(json.data)
      }
    } catch (error) {
      toast.error("Gagal memuat data stage")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStages()
    registerRefresh(fetchStages)
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = stages.findIndex((s) => String(s.id) === active.id)
    const newIndex = stages.findIndex((s) => String(s.id) === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove([...stages], oldIndex, newIndex).map((s, i) => ({ ...s, order: i + 1 }))
    setStages(reordered)

    try {
      const ids = reordered.map((s) => s.id)
      await fetch("/api/project-task-stages/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      toast.success("Urutan stage diperbarui")
    } catch (error) {
      toast.error("Gagal memperbarui urutan")
      fetchStages() // revert
    }
  }

  const handleUpdate = async () => {
    if (!editingStage || !editingStage.name.trim()) return

    try {
      const res = await fetch(`/api/project-task-stages/${editingStage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingStage.name }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message)

      toast.success("Stage berhasil diperbarui")
      setEditDialogOpen(false)
      fetchStages()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteStage) return
    try {
      const res = await fetch(`/api/project-task-stages/${deleteStage.id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message)

      toast.success("Stage berhasil dihapus")
      setDeleteStage(null)
      fetchStages()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const stageIds = stages.map((s) => String(s.id))

  if (loading && stages.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Memuat data...</div>
  }

  return (
    <>
      <div className="space-y-2 min-h-[120px]">
        <DndContext
          collisionDetection={rectIntersection}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext items={stageIds} strategy={verticalListSortingStrategy}>
            {stages.map((stage) => (
              <SortableProjectStageRow
                key={stage.id}
                stage={stage}
                onEdit={() => {
                  setEditingStage(stage)
                  setEditDialogOpen(true)
                }}
                onDelete={() => setDeleteStage(stage)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        <strong>Note:</strong> Seret ikon grip untuk mengubah urutan project task stage.
      </p>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit Project Task Stage</DialogTitle>
            <DialogDescription>
              Edit stage project sesuai modul Project Task Stage ERP.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editStageName">Stage Name</Label>
              <Input
                id="editStageName"
                placeholder="Planning"
                value={editingStage?.name ?? ""}
                onChange={(e) => setEditingStage(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="shadow-none" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={handleUpdate}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteStage} onOpenChange={(open) => !open && setDeleteStage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus stage?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Stage &quot;{deleteStage?.name}&quot; akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SortableBugStatusRow({
  status,
  onEdit,
  onDelete,
}: {
  status: BugStatus
  onEdit: () => void
  onDelete: () => void
}) {
  const id = String(status.id)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, touchAction: "none" }}
      className={`flex cursor-grab active:cursor-grabbing touch-none select-none items-center justify-between gap-2 rounded-md border bg-card px-4 py-3 hover:bg-accent/50 ${
        isDragging ? "z-10 opacity-90 shadow-md ring-2 ring-primary/20" : ""
      }`}
      {...attributes}
      {...listeners}
      aria-label="Seret untuk mengubah urutan"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <IconGripVertical className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="font-medium truncate">{status.title}</span>
      </div>
      <div
        className="flex shrink-0 gap-2"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
          onClick={onEdit}
          title="Edit"
        >
          <IconPencil className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
          onClick={onDelete}
          title="Delete"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function BugStatusContent({ registerRefresh }: { registerRefresh: (fn: () => void) => void }) {
  const [statuses, setStatuses] = useState<BugStatus[]>([])
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStatus, setEditingStatus] = React.useState<BugStatus | null>(null)
  const [deleteStatus, setDeleteStatus] = React.useState<BugStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {})
  )

  const fetchStatuses = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/bug-statuses")
      const json = await res.json()
      if (json.success) {
        setStatuses(json.data)
      }
    } catch (error) {
      toast.error("Gagal memuat data bug status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatuses()
    registerRefresh(fetchStatuses)
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = statuses.findIndex((s) => String(s.id) === active.id)
    const newIndex = statuses.findIndex((s) => String(s.id) === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove([...statuses], oldIndex, newIndex).map((s, i) => ({ ...s, order: i + 1 }))
    setStatuses(reordered)

    try {
      const ids = reordered.map((s) => s.id)
      await fetch("/api/bug-statuses/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      toast.success("Urutan bug status diperbarui")
    } catch (error) {
      toast.error("Gagal memperbarui urutan")
      fetchStatuses() // revert
    }
  }

  const handleUpdate = async () => {
    if (!editingStatus || !editingStatus.title.trim()) return

    try {
      const res = await fetch(`/api/bug-statuses/${editingStatus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingStatus.title }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message)

      toast.success("Bug status berhasil diperbarui")
      setEditDialogOpen(false)
      fetchStatuses()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteStatus) return
    try {
      const res = await fetch(`/api/bug-statuses/${deleteStatus.id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message)

      toast.success("Bug status berhasil dihapus")
      setDeleteStatus(null)
      fetchStatuses()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const statusIds = statuses.map((s) => String(s.id))

  if (loading && statuses.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Memuat data...</div>
  }

  return (
    <>
      <div className="space-y-2 min-h-[120px]">
        <DndContext
          collisionDetection={rectIntersection}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext items={statusIds} strategy={verticalListSortingStrategy}>
            {statuses.map((status) => (
              <SortableBugStatusRow
                key={status.id}
                status={status}
                onEdit={() => {
                  setEditingStatus(status)
                  setEditDialogOpen(true)
                }}
                onDelete={() => setDeleteStatus(status)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        <strong>Note:</strong> Seret ikon grip untuk mengubah urutan bug status.
      </p>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit Bug Status</DialogTitle>
            <DialogDescription>
              Edit status bug sesuai modul Bug Status ERP.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editBugStatusTitle">Bug Status Title</Label>
              <Input
                id="editBugStatusTitle"
                placeholder="Enter Bug Status Title"
                value={editingStatus?.title ?? ""}
                onChange={(e) => setEditingStatus(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="shadow-none" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={handleUpdate}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteStatus} onOpenChange={(open) => !open && setDeleteStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus bug status?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Status &quot;{deleteStatus?.title}&quot; akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ProjectSystemSetupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const activeTab = searchParams.get("tab") || "task-stage"
  
  const [refreshTaskStagesFn, setRefreshTaskStagesFn] = useState<() => void>(() => () => {})
  const [refreshBugStatusesFn, setRefreshBugStatusesFn] = useState<() => void>(() => () => {})

  const handleTabChange = (tabId: string) => {
    router.replace(`${pathname}?tab=${tabId}`, { scroll: false })
  }

  const tabs = React.useMemo(
    () => [
      {
        id: "task-stage",
        title: "Project Task Stage",
        content: <ProjectTaskStageContent registerRefresh={setRefreshTaskStagesFn} />,
      },
      {
        id: "bug-status",
        title: "Bug Status",
        content: <BugStatusContent registerRefresh={setRefreshBugStatusesFn} />,
      },
    ],
    []
  )

  const action =
    activeTab === "task-stage" ? (
      <CreateStageButton />
    ) : activeTab === "bug-status" ? (
      <CreateBugStatusButton />
    ) : undefined

  return (
    <ProjectStagesContext.Provider value={{
      refreshTaskStages: refreshTaskStagesFn,
      refreshBugStatuses: refreshBugStatusesFn
    }}>
      <SmoothTab
        items={tabs}
        defaultTabId={activeTab}
        value={activeTab}
        activeColor="bg-gray-600"
        action={action}
        onChange={handleTabChange}
      />
    </ProjectStagesContext.Provider>
  )
}

export default function ProjectSystemSetupPage() {
  return (
    <>
      <Card className={CARD_STYLE}>
        <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
          <div className="min-w-0 space-y-1 flex-1">
            <CardTitle className="text-2xl font-semibold">Project System Setup</CardTitle>
            <CardDescription>
              Kelola Project Task Stage dan Bug Status. Sesuai modul Project Setup reference-erp (Project Task Stages & Bug Status).
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className={CARD_STYLE}>
        <CardContent className="px-6 pt-6 pb-6">
          <ProjectSystemSetupContent />
        </CardContent>
      </Card>
    </>
  )
}
