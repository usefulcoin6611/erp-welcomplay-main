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
import { Checkbox } from "@/components/ui/checkbox"
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconDownload,
  IconSend,
} from "@tabler/icons-react"
import { Slider } from "@/components/ui/slider"

// Mock data – sesuaikan dengan taskboard
const tasksData: Record<string, {
  id: number
  projectId: number
  name: string
  projectName: string
  stage: string
  priority: string
  endDate: string
  startDate: string
  estimatedHrs: number | null
  milestone: string | null
  progress: number
  description: string
  assignedTo: string[]
  attachments: number
  comments: number
  checklists: { id: string; name: string; done: boolean }[]
  files: { id: string; name: string; size: string }[]
  activity: { user: string; type: string; remark: string; time: string }[]
  commentList: { user: string; text: string; time: string }[]
}> = {
  "1": {
    id: 1,
    projectId: 1,
    name: "Setup Database Schema",
    projectName: "Implementasi ERP PT Maju Jaya",
    stage: "In Progress",
    priority: "high",
    endDate: "2025-12-15",
    startDate: "2025-11-01",
    estimatedHrs: 40,
    milestone: "Phase 1 - Database",
    progress: 75,
    description: "Membuat skema database dan relasi tabel untuk modul awal ERP.",
    assignedTo: ["Budi", "Sari"],
    attachments: 3,
    comments: 5,
    checklists: [
      { id: "c1", name: "Review requirement", done: true },
      { id: "c2", name: "Design tables", done: true },
      { id: "c3", name: "Implement migrations", done: false },
    ],
    files: [
      { id: "f1", name: "schema-v1.pdf", size: "120 KB" },
      { id: "f2", name: "er-diagram.png", size: "85 KB" },
    ],
    activity: [
      { user: "Budi", type: "Update", remark: "Progress diubah menjadi 75%", time: "2 jam lalu" },
      { user: "Sari", type: "Comment", remark: "Checklist item ditambahkan", time: "1 hari lalu" },
    ],
    commentList: [
      { user: "Budi", text: "Schema sudah sesuai requirement.", time: "1 hari lalu" },
      { user: "Sari", text: "Perlu tambah index pada tabel transaksi.", time: "12 jam lalu" },
    ],
  },
  "2": {
    id: 2,
    projectId: 2,
    name: "Design User Interface",
    projectName: "CRM Upgrade CV Kreatif Digital",
    stage: "To Do",
    priority: "medium",
    endDate: "2025-12-20",
    startDate: "2025-12-01",
    estimatedHrs: 32,
    milestone: null,
    progress: 30,
    description: "Desain UI untuk dashboard dan modul pelanggan.",
    assignedTo: ["Dewi"],
    attachments: 1,
    comments: 2,
    checklists: [{ id: "c1", name: "Wireframe dashboard", done: false }],
    files: [],
    activity: [],
    commentList: [],
  },
  "3": {
    id: 3,
    projectId: 3,
    name: "Implement Authentication",
    projectName: "Website Redesign PT Teknologi",
    stage: "Review",
    priority: "critical",
    endDate: "2025-12-10",
    startDate: "2025-11-15",
    estimatedHrs: 24,
    milestone: "Sprint 1",
    progress: 90,
    description: "Implementasi login, register, dan session management.",
    assignedTo: ["Ahmad", "Budi", "Sari"],
    attachments: 5,
    comments: 8,
    checklists: [
      { id: "c1", name: "Login flow", done: true },
      { id: "c2", name: "Forgot password", done: true },
      { id: "c3", name: "Session timeout", done: true },
    ],
    files: [
      { id: "f1", name: "auth-flow.docx", size: "45 KB" },
    ],
    activity: [
      { user: "Ahmad", type: "Update", remark: "Progress 90%", time: "3 jam lalu" },
    ],
    commentList: [
      { user: "Ahmad", text: "Ready for QA.", time: "3 jam lalu" },
    ],
  },
  "4": {
    id: 4,
    projectId: 4,
    name: "Write API Documentation",
    projectName: "Mobile App Development",
    stage: "Done",
    priority: "low",
    endDate: "2025-11-30",
    startDate: "2025-10-15",
    estimatedHrs: 16,
    milestone: "Docs Sprint",
    progress: 100,
    description: "Dokumentasi API untuk mobile app.",
    assignedTo: ["Fauzi"],
    attachments: 2,
    comments: 1,
    checklists: [],
    files: [],
    activity: [],
    commentList: [],
  },
  "5": {
    id: 5,
    projectId: 1,
    name: "Fix Bug in Payment Module",
    projectName: "Implementasi ERP PT Maju Jaya",
    stage: "In Progress",
    priority: "high",
    endDate: "2025-12-18",
    startDate: "2025-11-20",
    estimatedHrs: 8,
    milestone: null,
    progress: 50,
    description: "Perbaikan bug pada modul pembayaran.",
    assignedTo: ["Ahmad"],
    attachments: 0,
    comments: 3,
    checklists: [],
    files: [],
    activity: [],
    commentList: [],
  },
  "6": {
    id: 6,
    projectId: 5,
    name: "Optimize Database Queries",
    projectName: "Cloud Migration Project",
    stage: "To Do",
    priority: "medium",
    endDate: "2026-01-05",
    startDate: "2025-12-15",
    estimatedHrs: 20,
    milestone: null,
    progress: 20,
    description: "Optimasi query database untuk performa cloud.",
    assignedTo: ["Sari", "Dewi"],
    attachments: 1,
    comments: 0,
    checklists: [],
    files: [],
    activity: [],
    commentList: [],
  },
  "7": {
    id: 7,
    projectId: 2,
    name: "Create Test Cases",
    projectName: "CRM Upgrade CV Kreatif Digital",
    stage: "In Progress",
    priority: "medium",
    endDate: "2025-12-25",
    startDate: "2025-12-01",
    estimatedHrs: 24,
    milestone: "QA Phase",
    progress: 60,
    description: "Penulisan test cases untuk modul CRM.",
    assignedTo: ["Budi"],
    attachments: 2,
    comments: 4,
    checklists: [],
    files: [],
    activity: [],
    commentList: [],
  },
  "8": {
    id: 8,
    projectId: 3,
    name: "Deploy to Production",
    projectName: "Website Redesign PT Teknologi",
    stage: "Review",
    priority: "critical",
    endDate: "2025-12-12",
    startDate: "2025-11-25",
    estimatedHrs: 12,
    milestone: "Go-live",
    progress: 85,
    description: "Deploy aplikasi ke production.",
    assignedTo: ["Ahmad", "Fauzi"],
    attachments: 4,
    comments: 6,
    checklists: [],
    files: [],
    activity: [],
    commentList: [],
  },
}

const priorityMap: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
  high: { label: "High", color: "bg-yellow-100 text-yellow-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  low: { label: "Low", color: "bg-cyan-100 text-cyan-700" },
}

function getPriorityClasses(priority: string) {
  return priorityMap[priority]?.color ?? "bg-slate-100 text-slate-700"
}

export default function TaskDetailPage() {
  const params = useParams()
  const projectId = params?.projectId as string
  const taskId = params?.taskId as string

  const task = useMemo(() => {
    const t = tasksData[taskId]
    if (!t || String(t.projectId) !== String(projectId)) return null
    return t
  }, [projectId, taskId])

  if (!task) {
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
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4">
              <div className="rounded-lg border bg-card px-4 py-8 text-center text-muted-foreground">
                Task tidak ditemukan.
              </div>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-0">
              <div className="min-w-0 space-y-1">
                <h1 className="text-lg font-semibold truncate">{task.name}</h1>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <Link href={`/projects/project/${task.projectId}`} className="hover:underline truncate">
                    {task.projectName}
                  </Link>
                  <span aria-hidden className="text-muted-foreground/60">·</span>
                  <Badge className={getPriorityClasses(task.priority)}>{priorityMap[task.priority]?.label ?? task.priority}</Badge>
                  <span>{task.stage}</span>
                  <span aria-hidden className="text-muted-foreground/60">·</span>
                  <span>{task.startDate} → {task.endDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" className="shadow-none h-9 px-4 bg-blue-500 hover:bg-blue-600">
                  Edit Task
                </Button>
                <Button asChild variant="outline" size="icon" className="h-9 w-9 shadow-none">
                  <Link href="/taskboard">
                    <IconArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Task Detail */}
            <Card className="p-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. Hours</p>
                  <p className="text-sm font-semibold text-green-600">
                    {task.estimatedHrs != null ? task.estimatedHrs : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Milestone</p>
                  <p className="text-sm font-medium truncate" title={task.milestone ?? undefined}>
                    {task.milestone ?? "-"}
                  </p>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</p>
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                  <Slider value={[task.progress]} max={100} step={1} className="w-full" disabled />
                </div>
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t line-clamp-2">
                  {task.description}
                </p>
              )}
            </Card>

            {/* Checklist + Attachments */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <CardTitle className="text-sm font-medium">Checklist</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 -mr-1">
                    <IconPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {task.checklists.length > 0 ? (
                  <ul className="space-y-2">
                    {task.checklists.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Checkbox checked={item.done} disabled className="h-3.5 w-3.5 shrink-0" />
                          <span className={`truncate ${item.done ? "text-muted-foreground line-through" : ""}`}>
                            {item.name}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-destructive hover:text-destructive -mr-1">
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground py-1">Belum ada checklist.</p>
                )}
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <CardTitle className="text-sm font-medium">Attachments</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 -mr-1">
                    <IconPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {task.files.length > 0 ? (
                  <ul className="space-y-2">
                    {task.files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-muted-foreground">{file.size}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
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
                  <p className="text-xs text-muted-foreground py-1">Belum ada lampiran.</p>
                )}
              </Card>
            </div>

            {/* Activity + Comments */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <CardTitle className="text-sm font-medium mb-3">Activity</CardTitle>
                {task.activity.length > 0 ? (
                  <ul className="space-y-3">
                    {task.activity.map((a, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarFallback className="text-xs">{a.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-xs font-medium">{a.type}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{a.remark}</p>
                          <p className="text-[10px] text-muted-foreground">{a.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground py-1">Belum ada aktivitas.</p>
                )}
              </Card>

              <Card className="p-4">
                <CardTitle className="text-sm font-medium mb-3">Comments</CardTitle>
                {task.commentList.length > 0 ? (
                  <ul className="space-y-3 mb-4">
                    {task.commentList.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                          <AvatarFallback className="text-xs">{c.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-xs font-medium">{c.user}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{c.text}</p>
                          <p className="text-[10px] text-muted-foreground">{c.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground py-1 mb-4">Belum ada komentar.</p>
                )}
                <div className="flex gap-2 pt-4 border-t">
                  <Textarea
                    placeholder="Add a comment..."
                    className="min-h-[64px] resize-none text-xs flex-1 py-2.5"
                    rows={2}
                  />
                  <Button size="sm" className="shrink-0 h-9 w-9 p-0 bg-blue-500 hover:bg-blue-600 mt-auto">
                    <IconSend className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
