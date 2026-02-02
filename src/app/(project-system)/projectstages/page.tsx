"use client"

import React, { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
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

const CARD_STYLE = "shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"

const initialProjectStages = [
  { id: 1, name: "Planning", color: "#F59E0B", order: 1 },
  { id: 2, name: "In Progress", color: "#3B82F6", order: 2 },
  { id: 3, name: "On Hold", color: "#9CA3AF", order: 3 },
  { id: 4, name: "Review", color: "#8B5CF6", order: 4 },
  { id: 5, name: "Completed", color: "#10B981", order: 5 },
]

const initialBugStatuses = [
  { id: 1, title: "New", order: 1 },
  { id: 2, title: "Confirmed", order: 2 },
  { id: 3, title: "In Progress", order: 3 },
  { id: 4, title: "Resolved", order: 4 },
  { id: 5, title: "Closed", order: 5 },
]

type ProjectStage = (typeof initialProjectStages)[number]
type BugStatus = (typeof initialBugStatuses)[number]

/** Tombol Create Stage untuk action SmoothTab */
function CreateStageButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
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
            <Input id="stageName" placeholder="Planning" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" type="color" defaultValue="#3B82F6" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="shadow-none">
            Cancel
          </Button>
          <Button type="button" className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
            Save Stage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Tombol Create Bug Status untuk action SmoothTab */
function CreateBugStatusButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
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
            <Input id="bugStatusTitle" placeholder="Enter Bug Status Title" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="shadow-none">
            Cancel
          </Button>
          <Button type="button" className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
            Save
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
        <Badge
          className="border-none shrink-0"
          style={{
            backgroundColor: `${stage.color}20`,
            color: stage.color,
          }}
        >
          {stage.color}
        </Badge>
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

function ProjectTaskStageContent() {
  const [stages, setStages] = useState<ProjectStage[]>(() => [...initialProjectStages])
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStage, setEditingStage] = React.useState<ProjectStage | null>(null)
  const [deleteStage, setDeleteStage] = React.useState<ProjectStage | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {})
  )
  const stageIds = stages.map((s) => String(s.id))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = stages.findIndex((s) => String(s.id) === active.id)
    const newIndex = stages.findIndex((s) => String(s.id) === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove([...stages], oldIndex, newIndex).map((s, i) => ({ ...s, order: i + 1 }))
    setStages(reordered)
  }

  const handleEdit = (stage: ProjectStage) => {
    setEditingStage(stage)
    setEditDialogOpen(true)
  }

  const handleCloseEdit = () => {
    setEditDialogOpen(false)
    setEditingStage(null)
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
                onEdit={() => handleEdit(stage)}
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
                defaultValue={editingStage?.name ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editColor">Color</Label>
              <Input
                id="editColor"
                type="color"
                defaultValue={editingStage?.color ?? "#3B82F6"}
              />
              <p className="text-xs text-muted-foreground">For chart representation</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="shadow-none" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button type="button" className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={handleCloseEdit}>
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
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => setDeleteStage(null)}>
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

function BugStatusContent() {
  const [statuses, setStatuses] = useState<BugStatus[]>(() => [...initialBugStatuses])
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStatus, setEditingStatus] = React.useState<BugStatus | null>(null)
  const [deleteStatus, setDeleteStatus] = React.useState<BugStatus | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {})
  )
  const statusIds = statuses.map((s) => String(s.id))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = statuses.findIndex((s) => String(s.id) === active.id)
    const newIndex = statuses.findIndex((s) => String(s.id) === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove([...statuses], oldIndex, newIndex).map((s, i) => ({ ...s, order: i + 1 }))
    setStatuses(reordered)
  }

  const handleEdit = (status: BugStatus) => {
    setEditingStatus(status)
    setEditDialogOpen(true)
  }

  const handleCloseEdit = () => {
    setEditDialogOpen(false)
    setEditingStatus(null)
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
                onEdit={() => handleEdit(status)}
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
                defaultValue={editingStatus?.title ?? ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="shadow-none" onClick={handleCloseEdit}>
              Cancel
            </Button>
            <Button type="button" className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={handleCloseEdit}>
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
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => setDeleteStatus(null)}>
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

  const handleTabChange = (tabId: string) => {
    router.replace(`${pathname}?tab=${tabId}`, { scroll: false })
  }

  const tabs = React.useMemo(
    () => [
      {
        id: "task-stage",
        title: "Project Task Stage",
        content: <ProjectTaskStageContent />,
      },
      {
        id: "bug-status",
        title: "Bug Status",
        content: <BugStatusContent />,
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
    <SmoothTab
      items={tabs}
      defaultTabId={activeTab}
      value={activeTab}
      activeColor="bg-cyan-600"
      action={action}
      onChange={handleTabChange}
    />
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
