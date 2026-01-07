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
  CardDescription,
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

const projectStages = [
  { id: 1, name: "Planning", color: "#F59E0B", order: 1 },
  { id: 2, name: "In Progress", color: "#3B82F6", order: 2 },
  { id: 3, name: "On Hold", color: "#9CA3AF", order: 3 },
  { id: 4, name: "Review", color: "#8B5CF6", order: 4 },
  { id: 5, name: "Completed", color: "#10B981", order: 5 },
] as const

export default function ProjectSystemSetupPage() {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editingStage, setEditingStage] = React.useState<typeof projectStages[number] | null>(null)

  const handleEdit = (stage: typeof projectStages[number]) => {
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
            <div>
              <h1 className="text-3xl font-bold">Project System Setup</h1>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Project Stages</CardTitle>
                  <CardDescription>
                    Kelola stage/stage project yang digunakan untuk mengkategorikan status project.
                  </CardDescription>
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
                      <DialogTitle>Create Project Stage</DialogTitle>
                      <DialogDescription>
                        Tambahkan stage baru untuk project sesuai modul Project Stage ERP.
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
                      <DialogTitle>Edit Project Stage</DialogTitle>
                      <DialogDescription>
                        Edit stage project sesuai modul Project Stage ERP.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="editStageName">Stage Name</Label>
                        <Input
                          id="editStageName"
                          placeholder="Planning"
                          defaultValue={editingStage?.name || ""}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="editColor">Color</Label>
                        <Input
                          id="editColor"
                          type="color"
                          defaultValue={editingStage?.color || "#3B82F6"}
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
                      {projectStages.map((stage) => (
                        <TableRow key={stage.id}>
                          <TableCell>
                            <div className="text-sm font-medium">{stage.name}</div>
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
