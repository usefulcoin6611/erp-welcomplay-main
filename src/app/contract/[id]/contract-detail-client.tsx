'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  IconArrowLeft,
  IconDownload,
  IconEye,
  IconMail,
  IconCopy,
  IconPencil,
  IconChevronRight,
  IconPaperclip,
  IconMessage,
  IconFileText,
  IconUserPlus,
  IconClick,
  IconTrash,
} from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getContractStatusDisplay,
  getContractStatusBadgeClass,
  getContractAttachments,
  getContractComments,
  getContractNotes,
  CONTRACT_STATUS_OPTIONS,
  type Contract,
  type ContractAttachment,
  type ContractComment,
  type ContractNote,
} from '@/lib/contract-data'

type ContractDetailClientProps = {
  contract: Contract
}

export function ContractDetailClient({ contract }: ContractDetailClientProps) {
  const [activeSection, setActiveSection] = useState('general')
  const [commentText, setCommentText] = useState('')
  const [notesText, setNotesText] = useState('')
  const [localStatus, setLocalStatus] = useState(contract.status)
  const [comments, setComments] = useState<ContractComment[]>(() => getContractComments(contract.id))
  const [notes, setNotes] = useState<ContractNote[]>(() => getContractNotes(contract.id))
  const [attachments, setAttachments] = useState<ContractAttachment[]>(() => getContractAttachments(contract.id))

  const statusDisplay = getContractStatusDisplay(localStatus)
  const statusBadgeClass = getContractStatusBadgeClass(localStatus)
  const attachmentCount = attachments.length
  const commentCount = comments.length
  const notesCount = notes.length

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setComments((prev) => [
      { id: `c-${Date.now()}`, comment: commentText.trim(), user: 'Anda', created_at: 'Baru saja' },
      ...prev,
    ])
    setCommentText('')
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!notesText.trim()) return
    setNotes((prev) => [
      { id: `n-${Date.now()}`, notes: notesText.trim(), user: 'Anda', created_at: 'Baru saja' },
      ...prev,
    ])
    setNotesText('')
  }

  const navItems = [
    { id: 'general', label: 'General', icon: IconUserPlus },
    { id: 'attachment', label: 'Attachment', icon: IconPaperclip },
    { id: 'comment', label: 'Comment', icon: IconMessage },
    { id: 'notes', label: 'Notes', icon: IconFileText },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Header: title + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{contract.subject}</h1>
          <p className="text-sm text-muted-foreground">
            {contract.contractNumber} · {contract.client}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3 shadow-none bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
            title="Download PDF"
          >
            <IconDownload className="mr-1.5 h-4 w-4" />
            Download
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3 shadow-none bg-amber-700 text-white hover:bg-amber-800 border-amber-700"
            title="Preview"
          >
            <IconEye className="mr-1.5 h-4 w-4" />
            Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
            title="Send Email"
          >
            <IconMail className="mr-1.5 h-4 w-4" />
            Send Email
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3 shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
            title="Duplicate"
          >
            <IconCopy className="mr-1.5 h-4 w-4" />
            Duplicate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-3 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
            title="Add signature"
          >
            <IconPencil className="mr-1.5 h-4 w-4" />
            Add signature
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 shadow-none border-slate-200"
              >
                <span className="text-primary font-medium">{statusDisplay}</span>
                <IconChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {CONTRACT_STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => setLocalStatus(opt)}
                >
                  {getContractStatusDisplay(opt)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="outline" size="sm" className="h-8 px-3 shadow-none bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200">
            <Link href="/contract">
              <IconArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar nav */}
        <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] h-fit lg:sticky lg:top-4">
          <CardContent className="p-0">
            <nav className="flex flex-col">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`flex items-center justify-between px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                    activeSection === id ? 'bg-muted/80 font-medium text-primary' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </span>
                  <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="space-y-8">
          {/* General */}
          <div id="general" className="scroll-mt-4">
            <div className="grid gap-4 mb-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                      <IconPaperclip className="h-5 w-5" />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm font-medium">Attachment</span>
                      <span className="text-lg font-semibold">{attachmentCount}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                      <IconClick className="h-5 w-5" />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm font-medium">Comment</span>
                      <span className="text-lg font-semibold">{commentCount}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] overflow-hidden">
                  <CardContent className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                      <IconFileText className="h-5 w-5" />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <span className="text-sm font-medium">Notes</span>
                      <span className="text-lg font-semibold">{notesCount}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="pb-2 px-4 py-3">
                  <CardTitle className="text-sm font-medium">Contract Detail</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Subject</span>
                    <span className="font-medium">{contract.subject}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Project</span>
                    <span className="font-medium">{contract.project === '-' ? '-' : contract.project}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-medium">Rp {contract.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                      {contract.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={statusBadgeClass}>{statusDisplay}</Badge>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">{contract.startDate}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">{contract.endDate}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-sm font-medium">Contract Description</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contract.description ?? '-'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attachment */}
          <div id="attachment" className="scroll-mt-4">
            <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-sm font-medium">Contract Attachments</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-sm text-muted-foreground">
                  Seret file ke sini atau klik untuk upload
                </div>
                <div className="space-y-2">
                  {attachments.length > 0 ? (
                    attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          {file.size && (
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-7 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100" title="Download">
                            <IconDownload className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => setAttachments((p) => p.filter((a) => a.id !== file.id))}
                          >
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">Belum ada lampiran.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comment */}
          <div id="comment" className="scroll-mt-4">
            <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-sm font-medium">Comments</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-4">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none"
                    rows={2}
                  />
                  <Button type="submit" size="sm" variant="blue" className="shadow-none h-9 self-end">
                    Kirim
                  </Button>
                </form>
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 rounded-lg border border-gray-100 px-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {c.user.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{c.comment}</p>
                        <small className="text-xs text-muted-foreground">{c.created_at}</small>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Belum ada komentar.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <div id="notes" className="scroll-mt-4">
            <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <Textarea
                    placeholder="Add a Notes..."
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="min-h-[80px] resize-none"
                    rows={3}
                  />
                  <Button type="submit" size="sm" variant="blue" className="shadow-none h-8">
                    Add
                  </Button>
                </form>
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 rounded-lg border border-gray-100 px-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {n.user.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{n.notes}</p>
                        <small className="text-xs text-muted-foreground">{n.created_at}</small>
                      </div>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">Belum ada catatan.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
