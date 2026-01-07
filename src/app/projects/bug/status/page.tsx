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
import { IconPlus, IconSearch } from "@tabler/icons-react"

const bugStatuses = [
  { id: 1, title: "Open", order: 1 },
  { id: 2, title: "In Progress", order: 2 },
  { id: 3, title: "Closed", order: 3 },
] as const

export default function BugStatusPage() {
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
                <h1 className="text-3xl font-bold">Bug Status</h1>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Status
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[420px]">
                  <DialogHeader>
                    <DialogTitle>Create Bug Status</DialogTitle>
                    <DialogDescription>
                      Tambahkan status baru untuk bug report sesuai modul Bug Status ERP.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="statusTitle">Status Title</Label>
                      <Input id="statusTitle" placeholder="Open" maxLength={20} />
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
                      Save Status
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle>Bug Status List</CardTitle>
                <div className="relative w-full max-w-xs">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input placeholder="Search status..." className="h-9 pl-9" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead className="w-[180px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bugStatuses.map((status) => (
                        <TableRow key={status.id}>
                          <TableCell>
                            <div className="text-sm font-medium">{status.title}</div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{status.order}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 shadow-none"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 shadow-none"
                              >
                                Delete
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

