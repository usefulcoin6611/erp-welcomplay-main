import React from "react"
import Link from "next/link"
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
import { Textarea } from "@/components/ui/textarea"
import { IconPlus, IconSearch } from "@tabler/icons-react"

const milestones = [
  {
    id: 1,
    project: "Implementasi ERP PT Maju Jaya",
    title: "Analisis Kebutuhan",
    status: "complete",
    cost: 45_000_000,
    startDate: "2025-10-01",
    dueDate: "2025-10-15",
  },
  {
    id: 2,
    project: "Implementasi ERP PT Maju Jaya",
    title: "Go-live Finance",
    status: "in_progress",
    cost: 80_000_000,
    startDate: "2025-11-01",
    dueDate: "2025-11-30",
  },
] as const

function getStatusClasses(status: string) {
  switch (status) {
    case "complete":
      return "bg-green-100 text-green-700 border-none"
    case "in_progress":
      return "bg-blue-100 text-blue-700 border-none"
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-none"
    default:
      return "bg-slate-100 text-slate-700 border-none"
  }
}

export default function MilestonePage() {
  const total = milestones.length
  const totalCost = milestones.reduce((sum, m) => sum + m.cost, 0)

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
                <h1 className="text-3xl font-bold">Milestones</h1>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>Create Milestone</DialogTitle>
                    <DialogDescription>
                      Tambahkan milestone baru ke project seperti pada modul proyek ERP.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project">Project</Label>
                      <Input id="project" placeholder="Implementasi ERP PT Maju Jaya" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" placeholder="Go-live Finance" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" required />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost">Cost</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        placeholder="80000000"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter description"
                        rows={3}
                      />
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
                      Save Milestone
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {milestones.filter((m) => m.status === "complete").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalCost.toLocaleString("id-ID")}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Milestone List</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search milestone..." className="h-9 pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Milestone</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milestones.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <div className="space-y-0.5">
                              <Link
                                href={`/projects/milestone/${m.id}`}
                                className="text-sm font-semibold text-primary hover:underline"
                              >
                                {m.title}
                              </Link>
                              <div className="text-xs text-muted-foreground">
                                Milestone #{m.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{m.project}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusClasses(m.status)}>{m.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {m.startDate} - {m.dueDate}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm font-medium">
                              Rp {m.cost.toLocaleString("id-ID")}
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

