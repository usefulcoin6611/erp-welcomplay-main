"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
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
import { IconPlus, IconSearch, IconPencil, IconTrash } from "@tabler/icons-react"

const stages = [
  { id: 1, name: "To Do", color: "#9CA3AF", order: 1 },
  { id: 2, name: "In Progress", color: "#3B82F6", order: 2 },
  { id: 3, name: "Review", color: "#F59E0B", order: 3 },
  { id: 4, name: "Done", color: "#10B981", order: 4 },
] as const

export default function TaskStagePage() {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStage, setEditingStage] = React.useState<typeof stages[number] | null>(null)

  const handleEdit = (stage: typeof stages[number]) => {
    setEditingStage(stage)
    setEditDialogOpen(true)
  }

  const handleCloseEdit = () => {
    setEditDialogOpen(false)
    setEditingStage(null)
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Task Stages</h1>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Stage
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px]">
                  <DialogHeader>
                    <DialogTitle>Create Task Stage</DialogTitle>
                    <DialogDescription>
                      Tambahkan stage baru untuk board task sesuai modul Task Stage ERP.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stageName">Stage Name</Label>
                      <Input id="stageName" placeholder="QA Review" />
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
                    <Button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-600 shadow-none"
                    >
                      Save Stage
                    </Button>
                  </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                      <DialogTitle>Edit Task Stage</DialogTitle>
                      <DialogDescription>
                        Edit stage untuk board task sesuai modul Task Stage ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="editStageName">
                          Stage Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="editStageName"
                          placeholder="QA Review"
                          defaultValue={editingStage?.name || ""}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="editColor">
                          Color <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="editColor"
                          type="color"
                          defaultValue={editingStage?.color || "#3B82F6"}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          For chart representation
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        className="shadow-none"
                        onClick={handleCloseEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="bg-blue-500 hover:bg-blue-600 shadow-none"
                        onClick={handleCloseEdit}
                      >
                        Update
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Task Stages</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search stages..." className="h-9 pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead className="w-[180px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stages.map((stage) => (
                        <TableRow key={stage.id}>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {stage.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="border-none"
                              style={{
                                backgroundColor: `${stage.color}20`,
                                color: stage.color,
                              }}
                            >
                              {stage.color}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{stage.order}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none"
                                onClick={() => handleEdit(stage)}
                                title="Edit"
                              >
                                <IconPencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 shadow-none text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete"
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

