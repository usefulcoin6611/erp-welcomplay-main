"use client"

import React, { useState } from "react"
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

type DealStage = { id: number; name: string; order: number }
type PipelineWithStages = { id: number; name: string; stages: DealStage[] }

const initialPipelines: PipelineWithStages[] = [
  {
    id: 1,
    name: 'Default Pipeline',
    stages: [
      { id: 1, name: 'Qualification', order: 0 },
      { id: 2, name: 'Needs Analysis', order: 1 },
      { id: 3, name: 'Proposal', order: 2 },
      { id: 4, name: 'Negotiation', order: 3 },
      { id: 5, name: 'Closed Won', order: 4 },
    ],
  },
  {
    id: 2,
    name: 'Enterprise Pipeline',
    stages: [
      { id: 6, name: 'Discovery', order: 0 },
      { id: 7, name: 'Proposal Sent', order: 1 },
      { id: 8, name: 'Approval', order: 2 },
    ],
  },
]

const pipelines = initialPipelines

/** Tombol Create Deal Stage untuk action slot SmoothTab */
export function DealStagesTabCreateButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="blue" className="shadow-none h-7">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Deal Stage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Deal Stage</DialogTitle>
          <DialogDescription>
            Buat tahapan deal baru untuk pipeline yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pipeline">Pipeline</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stageName">Stage Name</Label>
            <Input id="stageName" placeholder="New Stage" maxLength={20} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" className="shadow-none">
            Cancel
          </Button>
          <Button type="button" className="bg-blue-500 hover:bg-blue-600 shadow-none">
            Save Deal Stage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SortableDealStageRow({
  stage,
  onEdit,
  onDelete,
}: {
  stage: DealStage
  onEdit: () => void
  onDelete: () => void
}) {
  const id = String(stage.id)
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

export default function DealStagesTab() {
  const [pipelinesState, setPipelinesState] = useState<PipelineWithStages[]>(() =>
    JSON.parse(JSON.stringify(initialPipelines))
  )
  const [activeTab, setActiveTab] = useState(0)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {})
  )

  const currentPipeline = pipelinesState[activeTab]
  const stageIds = (currentPipeline?.stages.map((s) => String(s.id)) ?? []) as string[]

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !currentPipeline) return
    const activeId = typeof active.id === 'string' ? Number(active.id) : active.id
    const overId = typeof over.id === 'string' ? Number(over.id) : over.id
    const oldIndex = currentPipeline.stages.findIndex((s) => s.id === activeId)
    const newIndex = currentPipeline.stages.findIndex((s) => s.id === overId)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove([...currentPipeline.stages], oldIndex, newIndex)
    setPipelinesState((prev) =>
      prev.map((p, i) => (i === activeTab ? { ...p, stages: reordered } : p))
    )
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-lg border-0">
        <CardContent className="px-4 py-3">
          <div className="flex gap-2">
            {pipelinesState.map((pipeline, idx) => (
              <button
                key={pipeline.id}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === idx
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pipeline.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-0">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Deal Stages</CardTitle>
          <CardDescription className="text-sm">
            Urutkan tahapan deal dengan drag & drop.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 py-4 space-y-2 min-h-[120px]">
            <DndContext
              collisionDetection={rectIntersection}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext items={stageIds} strategy={verticalListSortingStrategy}>
                {currentPipeline?.stages.map((stage) => (
                  <SortableDealStageRow
                    key={stage.id}
                    stage={stage}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          <p className="px-4 pb-4 text-sm text-muted-foreground border-t pt-3 mt-0">
            <strong>Note:</strong> Seret ikon grip untuk mengubah urutan deal stage.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
