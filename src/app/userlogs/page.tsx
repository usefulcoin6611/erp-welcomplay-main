"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainContentWrapper } from "@/components/main-content-wrapper"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Eye, Search, Trash, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

type UserLogRow = {
  id: string
  userId: string
  userName: string
  userEmail: string
  userType: string
  date: string
  ip: string
  country: string
  device_type: string
  os_name: string
  details: unknown
}

type UserOption = { id: string; name: string }

type LogDetail = {
  id: string
  userName: string
  userEmail: string
  date: string
  ip: string | null
  details: Record<string, unknown> | null
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatDateTime(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function UserLogsPage() {
  const { user: authUser, isLoading: authLoading } = useAuth()
  const isLoaded = !authLoading
  const [logs, setLogs] = useState<UserLogRow[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ month: "", userId: "" })
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewLog, setViewLog] = useState<LogDetail | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const currentMonth = (() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`
  })()

  const fetchLogs = useCallback(async () => {
    const month = filters.month || currentMonth
    const params = new URLSearchParams({ month })
    if (filters.userId) params.set("userId", filters.userId)
    const res = await fetch(`/api/userlogs?${params}`)
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        setLogs([])
        return
      }
      toast.error("Failed to load user logs")
      return
    }
    const data = await res.json()
    setLogs(Array.isArray(data) ? data : [])
  }, [filters.month, filters.userId, currentMonth])

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users")
    if (!res.ok) return
    const data = await res.json()
    const list = Array.isArray(data) ? data : data?.users ?? []
    setUsers(
      list.map((u: { id: string; name?: string; email?: string }) => ({
        id: u.id,
        name: u.name || u.email || String(u.id),
      }))
    )
  }, [])

  // Depend on authUser?.id only so we don't re-run when context gives a new user object reference
  const authUserId = authUser?.id ?? null
  useEffect(() => {
    if (!isLoaded) return
    if (!authUser) {
      setLoading(false)
      setLogs([])
      return
    }
    setLoading(true)
    Promise.all([fetchLogs(), fetchUsers()]).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: run only when auth state changes, not when fetchLogs/fetchUsers identity changes
  }, [isLoaded, authUserId])

  const handleApply = () => {
    setLoading(true)
    fetchLogs().finally(() => setLoading(false))
  }

  const handleReset = () => {
    setFilters({ month: currentMonth, userId: "" })
    setLoading(true)
    const params = new URLSearchParams({ month: currentMonth })
    fetch(`/api/userlogs?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }

  const openView = (id: string) => {
    setViewLog(null)
    setViewModalOpen(true)
    setViewLoading(true)
    fetch(`/api/userlogs/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setViewLog(data)
      })
      .catch(() => toast.error("Failed to load log details"))
      .finally(() => setViewLoading(false))
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteId(id)
    setDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/userlogs/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Failed to delete log")
        return
      }
      setLogs((prev) => prev.filter((l) => l.id !== deleteId))
      setDeleteId(null)
      setDeleteAlertOpen(false)
      toast.success("Log deleted")
    } finally {
      setDeleting(false)
    }
  }

  const detailKeys: { key: string; label: string }[] = [
    { key: "status", label: "Status" },
    { key: "country", label: "Country" },
    { key: "countryCode", label: "Country Code" },
    { key: "region", label: "Region" },
    { key: "regionName", label: "Region Name" },
    { key: "city", label: "City" },
    { key: "zip", label: "Zip" },
    { key: "lat", label: "Latitude" },
    { key: "lon", label: "Longitude" },
    { key: "timezone", label: "Timezone" },
    { key: "isp", label: "ISP" },
    { key: "org", label: "Org" },
    { key: "as", label: "As" },
    { key: "query", label: "Query" },
    { key: "browser_name", label: "Browser Name" },
    { key: "os_name", label: "OS Name" },
    { key: "browser_language", label: "Browser Language" },
    { key: "device_type", label: "Device Type" },
    { key: "referrer_host", label: "Referrer Host" },
    { key: "referrer_path", label: "Referrer Path" },
  ]

  if (!isLoaded) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="px-6 py-8 text-center text-muted-foreground">Loading...</CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!authUser) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="px-6 py-8 text-center text-muted-foreground">Please sign in to view user logs.</CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)", "--header-height": "calc(var(--spacing) * 12)" } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Title */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Manage User Log</CardTitle>
                  <CardDescription>
                    View login history by month and user. See IP, country, device, and OS for each session.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="shadow-none h-7 px-4" asChild>
                  <Link href="/users">
                    <ArrowLeft className="mr-2 h-3 w-3" />
                    Back to Users
                  </Link>
                </Button>
              </CardHeader>
            </Card>

            {/* Filters */}
            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
              <CardContent className="px-6 py-4">
                <form
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_auto] md:justify-start"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleApply()
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="userlog-month" className="text-sm font-medium">
                      Month
                    </Label>
                    <input
                      id="userlog-month"
                      type="month"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                      value={filters.month || currentMonth}
                      onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">User</Label>
                    <Select
                      value={filters.userId || "all"}
                      onValueChange={(v) => setFilters((f) => ({ ...f, userId: v === "all" ? "" : v }))}
                    >
                      <SelectTrigger
                        id="userlog-user"
                        className="w-full !h-9 border border-input bg-background shadow-xs"
                      >
                        <SelectValue placeholder="Select User" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                      title="Apply"
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                      title="Reset"
                      onClick={handleReset}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Table */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <CardTitle>User Log List</CardTitle>
                <CardDescription>Login records for the selected month and user.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">User Name</TableHead>
                        <TableHead className="px-6">Role</TableHead>
                        <TableHead className="px-6">Last Login</TableHead>
                        <TableHead className="px-6">IP</TableHead>
                        <TableHead className="px-6">Country</TableHead>
                        <TableHead className="px-6">Device</TableHead>
                        <TableHead className="px-6">OS</TableHead>
                        <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                            No user logs found for the selected filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="px-6 font-normal">{row.userName}</TableCell>
                            <TableCell className="px-6">
                              <Badge className="bg-primary/10 text-primary border-0">
                                {row.userType || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 font-normal">{formatDate(row.date)}</TableCell>
                            <TableCell className="px-6 font-normal">{row.ip}</TableCell>
                            <TableCell className="px-6 font-normal">{row.country}</TableCell>
                            <TableCell className="px-6 font-normal">{row.device_type}</TableCell>
                            <TableCell className="px-6 font-normal">{row.os_name}</TableCell>
                            <TableCell className="px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                  onClick={() => openView(row.id)}
                                  title="View"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                  onClick={() => openDeleteConfirm(row.id)}
                                  title="Delete"
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>

      {/* View detail modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View User Logs</DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading...</p>
          ) : viewLog ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">User</p>
                  <p>{viewLog.userName} ({viewLog.userEmail})</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Date</p>
                  <p>{formatDateTime(viewLog.date)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">IP</p>
                  <p>{viewLog.ip ?? "—"}</p>
                </div>
              </div>
              {viewLog.details && typeof viewLog.details === "object" && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {detailKeys.map(({ key, label }) => {
                    const val = (viewLog.details as Record<string, unknown>)[key]
                    if (val === undefined || val === null) return null
                    return (
                      <div key={key}>
                        <p className="font-medium text-muted-foreground">{label}</p>
                        <p className="mt-0.5">{String(val)}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No details available.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={(o) => { setDeleteAlertOpen(o); if (!o) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user log?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this login record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
