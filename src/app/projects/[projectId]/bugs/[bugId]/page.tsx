"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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

type BugDetail = {
  id: string
  projectId: string
  projectName: string
  title: string
  bugStatus: string
  priority: string
  dueDate: string
  createdDate: string
  createdBy: string
  assignTo: string[]
  description: string
  attachments: number
  comments: number
  commentList: { user: string; text: string; time: string }[]
  files: { id: string; name: string; size: string }[]
}

export default function BugDetailPage() {
  const params = useParams()
  const projectId = params?.projectId as string
  const bugId = params?.bugId as string
  const [bug, setBug] = useState<BugDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let ignore = false

    async function loadBug() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`/api/projects/bugs/${bugId}`)
        if (!res.ok) {
          throw new Error("Gagal memuat detail bug")
        }

        const json = await res.json()
        const data = json?.data
        if (!data) {
          throw new Error("Bug tidak ditemukan")
        }

        if (!ignore) {
          const mapped: BugDetail = {
            id: String(data.id ?? ""),
            projectId: String(data.projectId ?? ""),
            projectName: String(data.projectName ?? ""),
            title: String(data.title ?? ""),
            bugStatus: String(data.bugStatus ?? ""),
            priority: String(data.priority ?? ""),
            dueDate: String(data.dueDate ?? ""),
            createdDate: String(data.createdDate ?? ""),
            createdBy: String(data.createdBy ?? ""),
            assignTo: Array.isArray(data.assignTo)
              ? (data.assignTo as string[])
              : [],
            description: String(data.description ?? ""),
            attachments:
              typeof data.attachments === "number" ? data.attachments : 0,
            comments:
              typeof data.comments === "number" ? data.comments : 0,
            commentList: Array.isArray(data.commentList)
              ? data.commentList
              : [],
            files: Array.isArray(data.files) ? data.files : [],
          }

          if (mapped.projectId !== projectId) {
            throw new Error("Bug tidak ditemukan")
          }

          setBug(mapped)
        }
      } catch (e: any) {
        if (!ignore) {
          setError(e.message || "Terjadi kesalahan saat memuat detail bug")
          setBug(null)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    if (bugId) {
      loadBug()
    }

    return () => {
      ignore = true
    }
  }, [projectId, bugId])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-lg border bg-card px-4 py-8 text-center text-muted-foreground">
          Memuat detail bug...
        </div>
      </div>
    )
  }

  if (!bug || error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="rounded-lg border bg-card px-4 py-8 text-center text-muted-foreground">
          {error || "Bug tidak ditemukan."}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:p-1">
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
            <p className="text-sm">
              {bug.assignTo.length > 0 ? bug.assignTo.join(", ") : "-"}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Description</p>
          <p className="text-sm text-muted-foreground">{bug.description || "-"}</p>
        </div>
      </Card>

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
            {bug.commentList.length > 0 ? (
              <ul className="space-y-3 pt-2 border-t">
                {bug.commentList.map((c, i) => (
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
  )
}
