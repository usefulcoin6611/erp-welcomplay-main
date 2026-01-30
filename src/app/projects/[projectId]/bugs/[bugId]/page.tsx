"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MainContentWrapper } from "@/components/main-content-wrapper"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IconArrowLeft,
  IconSend,
  IconTrash,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react"

const bugStatusMap: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  Confirmed: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
  Closed: "bg-slate-100 text-slate-700",
}

const priorityMap: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-yellow-100 text-yellow-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-cyan-100 text-cyan-700",
}

const bugsData: Record<string, {
  id: number
  projectId: number
  title: string
  projectName: string
  bugStatus: string
  priority: string
  dueDate: string
  createdDate: string
  createdBy: string
  assignTo: string
  description: string
  comments: { user: string; text: string; time: string }[]
  files: { id: string; name: string; size: string }[]
}> = {
  "1-1": {
    id: 1,
    projectId: 1,
    title: "Login page not loading",
    projectName: "Implementasi ERP PT Maju Jaya",
    bugStatus: "Confirmed",
    priority: "high",
    dueDate: "2025-12-15",
    createdDate: "2025-11-20",
    createdBy: "Budi Santoso",
    assignTo: "Sari",
    description: "Halaman login tidak memuat setelah update terakhir. Error di konsol: timeout pada assets.",
    comments: [
      { user: "Sari", text: "Sedang cek konfigurasi auth.", time: "1 hari lalu" },
      { user: "Ahmad", text: "Coba clear cache browser.", time: "12 jam lalu" },
    ],
    files: [
      { id: "f1", name: "screenshot-error.png", size: "85 KB" },
      { id: "f2", name: "console-log.txt", size: "12 KB" },
    ],
  },
  "2-2": {
    id: 2,
    projectId: 2,
    title: "Database connection timeout",
    projectName: "CRM Upgrade CV Kreatif Digital",
    bugStatus: "In Progress",
    priority: "critical",
    dueDate: "2025-12-10",
    createdDate: "2025-11-18",
    createdBy: "Dewi Lestari",
    assignTo: "Fauzi",
    description: "Koneksi database timeout saat load report.",
    comments: [],
    files: [],
  },
  "3-3": {
    id: 3,
    projectId: 3,
    title: "Button alignment issue",
    projectName: "Website Redesign PT Teknologi",
    bugStatus: "Resolved",
    priority: "low",
    dueDate: "2025-11-30",
    createdDate: "2025-11-10",
    createdBy: "Ahmad Fauzi",
    assignTo: "Budi",
    description: "Tombol di form tidak sejajar pada layar mobile.",
    comments: [{ user: "Budi", text: "Sudah diperbaiki di PR #42.", time: "2 hari lalu" }],
    files: [],
  },
  "4-4": {
    id: 4,
    projectId: 4,
    title: "API endpoint returning 500 error",
    projectName: "Mobile App Development",
    bugStatus: "Confirmed",
    priority: "high",
    dueDate: "2025-12-20",
    createdDate: "2025-11-22",
    createdBy: "Sari Wijaya",
    assignTo: "Ahmad",
    description: "Endpoint /api/users mengembalikan 500 saat payload besar.",
    comments: [],
    files: [],
  },
  "1-5": {
    id: 5,
    projectId: 1,
    title: "Memory leak in dashboard",
    projectName: "Implementasi ERP PT Maju Jaya",
    bugStatus: "In Progress",
    priority: "medium",
    dueDate: "2025-12-18",
    createdDate: "2025-11-25",
    createdBy: "Fauzi Rahman",
    assignTo: "Sari",
    description: "Memory naik terus saat dashboard dibiarkan terbuka.",
    comments: [],
    files: [],
  },
  "5-6": {
    id: 6,
    projectId: 5,
    title: "Missing validation on form",
    projectName: "Cloud Migration Project",
    bugStatus: "New",
    priority: "medium",
    dueDate: "2026-01-05",
    createdDate: "2025-12-01",
    createdBy: "Budi Santoso",
    assignTo: "Dewi",
    description: "Form upload tidak validasi tipe file.",
    comments: [],
    files: [],
  },
  "2-7": {
    id: 7,
    projectId: 2,
    title: "Export function not working",
    projectName: "CRM Upgrade CV Kreatif Digital",
    bugStatus: "Resolved",
    priority: "low",
    dueDate: "2025-12-01",
    createdDate: "2025-11-15",
    createdBy: "Ahmad Fauzi",
    assignTo: "Budi",
    description: "Export Excel gagal untuk data > 10k baris.",
    comments: [],
    files: [],
  },
  "3-8": {
    id: 8,
    projectId: 3,
    title: "Slow query performance",
    projectName: "Website Redesign PT Teknologi",
    bugStatus: "Confirmed",
    priority: "critical",
    dueDate: "2025-12-12",
    createdDate: "2025-11-28",
    createdBy: "Dewi Lestari",
    assignTo: "Ahmad",
    description: "Query laporan sangat lambat (> 30 detik).",
    comments: [],
    files: [],
  },
}

export default function BugDetailPage() {
  const params = useParams()
  const projectId = params?.projectId as string
  const bugId = params?.bugId as string

  const bug = useMemo(() => {
    const key = `${projectId}-${bugId}`
    const b = bugsData[key]
    if (!b || String(b.projectId) !== String(projectId)) return null
    return b
  }, [projectId, bugId])

  if (!bug) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4">
              <div className="rounded-lg border bg-card px-4 py-8 text-center text-muted-foreground">
                Bug tidak ditemukan.
              </div>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-5 bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <h1 className="text-lg font-semibold truncate">{bug.title}</h1>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <Link href={`/projects/project/${bug.projectId}`} className="hover:underline truncate">
                    {bug.projectName}
                  </Link>
                  <span aria-hidden className="text-muted-foreground/60">·</span>
                  <Badge className={bugStatusMap[bug.bugStatus] ?? "bg-slate-100 text-slate-700"}>
                    {bug.bugStatus}
                  </Badge>
                  <Badge className={priorityMap[bug.priority] ?? "bg-slate-100 text-slate-700"}>
                    {bug.priority}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" className="shadow-none h-9 px-4 bg-blue-500 hover:bg-blue-600">
                  Edit Bug
                </Button>
                <Button asChild variant="outline" size="icon" className="h-9 w-9 shadow-none">
                  <Link href="/bugs-report">
                    <IconArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Detail – Title, Priority, Created Date, Assign to, Description (reference bugShow) */}
            <Card className="p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Title</p>
                  <p className="text-sm font-medium">{bug.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Priority</p>
                  <Badge className={priorityMap[bug.priority] ?? "bg-slate-100 text-slate-700"}>
                    {bug.priority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Created Date</p>
                  <p className="text-sm">{bug.createdDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Assign to</p>
                  <p className="text-sm">{bug.assignTo}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="text-sm text-muted-foreground">{bug.description || "-"}</p>
              </div>
            </Card>

            {/* Tabs: Comments, Files (reference bugShow) */}
            <Card className="p-4">
              <Tabs defaultValue="comments" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="comments" className="mt-0 space-y-4">
                  <form className="space-y-2">
                    <Textarea
                      placeholder="Write message..."
                      className="min-h-[80px] resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button type="button" size="sm" className="shadow-none h-8 bg-blue-500 hover:bg-blue-600">
                        <IconSend className="h-3.5 w-3.5 mr-1" /> Submit
                      </Button>
                    </div>
                  </form>
                  {bug.comments.length > 0 ? (
                    <ul className="space-y-3 pt-2 border-t">
                      {bug.comments.map((c, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                            <AvatarFallback className="text-xs">{c.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 flex justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{c.user}</p>
                              <p className="text-sm text-muted-foreground">{c.text}</p>
                              <p className="text-xs text-muted-foreground">{c.time}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-destructive hover:text-destructive">
                              <IconTrash className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">Belum ada komentar.</p>
                  )}
                </TabsContent>
                <TabsContent value="files" className="mt-0 space-y-4">
                  <form className="flex flex-wrap items-end gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">File</label>
                      <input type="file" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm file:mr-2 file:border-0 file:bg-transparent file:text-sm file:font-medium" />
                    </div>
                    <Button type="submit" size="sm" className="shadow-none h-9 bg-blue-500 hover:bg-blue-600">
                      <IconUpload className="h-3.5 w-3.5 mr-1" /> Upload
                    </Button>
                  </form>
                  {bug.files.length > 0 ? (
                    <ul className="space-y-2 pt-2 border-t">
                      {bug.files.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="secondary" size="sm" className="shadow-none h-7">
                              <IconDownload className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                              <IconTrash className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2">Belum ada file.</p>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
