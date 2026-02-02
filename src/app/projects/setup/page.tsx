"use client"

import React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
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
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react"
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

const projectStages = [
  { id: 1, name: "Planning", order: 1 },
  { id: 2, name: "In Progress", order: 2 },
  { id: 3, name: "On Hold", order: 3 },
  { id: 4, name: "Review", order: 4 },
  { id: 5, name: "Completed", order: 5 },
] as const

const bugStatuses = [
  { id: 1, title: "New", order: 1 },
  { id: 2, title: "Confirmed", order: 2 },
  { id: 3, title: "In Progress", order: 3 },
  { id: 4, title: "Resolved", order: 4 },
  { id: 5, title: "Closed", order: 5 },
] as const

type ProjectStage = (typeof projectStages)[number]
type BugStatus = (typeof bugStatuses)[number]

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

function ProjectTaskStageContent() {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStage, setEditingStage] = React.useState<ProjectStage | null>(null)
  const [deleteStage, setDeleteStage] = React.useState<ProjectStage | null>(null)

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6">Stage</TableHead>
              <TableHead className="px-6">Order</TableHead>
              <TableHead className="w-[180px] px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectStages.map((stage) => (
              <TableRow key={stage.id}>
                <TableCell className="px-6">
                  <div className="text-sm font-medium">{stage.name}</div>
                </TableCell>
                <TableCell className="px-6">
                  <span className="text-sm">{stage.order}</span>
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                      onClick={() => handleEdit(stage)}
                      title="Edit"
                    >
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                      title="Delete"
                      onClick={() => setDeleteStage(stage)}
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
      <p className="mt-4 text-sm text-muted-foreground">
        <strong>Note:</strong> You can easily change order of project task stage using drag & drop.
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

function BugStatusContent() {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStatus, setEditingStatus] = React.useState<BugStatus | null>(null)
  const [deleteStatus, setDeleteStatus] = React.useState<BugStatus | null>(null)

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6">Title</TableHead>
              <TableHead className="px-6">Order</TableHead>
              <TableHead className="w-[180px] px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bugStatuses.map((status) => (
              <TableRow key={status.id}>
                <TableCell className="px-6">
                  <div className="text-sm font-medium">{status.title}</div>
                </TableCell>
                <TableCell className="px-6">
                  <span className="text-sm">{status.order}</span>
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                      onClick={() => handleEdit(status)}
                      title="Edit"
                    >
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                      title="Delete"
                      onClick={() => setDeleteStatus(status)}
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
      <p className="mt-4 text-sm text-muted-foreground">
        <strong>Note:</strong> You can easily change order of project Bug status using drag & drop.
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
        <CardContent className="pt-6">
          <ProjectSystemSetupContent />
        </CardContent>
      </Card>
    </>
  )
}
