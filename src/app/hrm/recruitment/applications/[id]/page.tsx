'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Download, Star, Trash, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type AppData = {
  id: string
  applicantName: string
  email: string
  phone: string
  jobTitle: string
  stageId: string
  stage: string
  appliedDate: string
  rating: number
  resume?: string
  coverLetter?: string
  isArchive: boolean
  profile?: string
  notes: { id: string; note: string; createdAt: string; noteCreatedName: string }[]
}

type StageOption = { id: string; name: string }

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [app, setApp] = useState<AppData | null>(null)
  const [stages, setStages] = useState<StageOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const refreshApp = async () => {
    const [appRes, stagesRes] = await Promise.all([
      fetch(`/api/hrm/recruitment/applications/${id}`),
      fetch('/api/job-stages'),
    ])
    const appJson = await appRes.json()
    const stagesJson = await stagesRes.json()
    if (appJson.success && appJson.data) setApp(appJson.data)
    if (stagesJson.success && Array.isArray(stagesJson.data)) setStages(stagesJson.data)
  }

  useEffect(() => {
    let cancelled = false
    refreshApp().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  if (!app) notFound()

  const handleStageChange = async (stageId: string) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hrm/recruitment/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId }),
      })
      const json = await res.json()
      if (json.success) {
        await refreshApp()
        toast.success('Stage berhasil diubah')
      } else toast.error(json.message ?? 'Gagal mengubah stage')
    } catch (e) {
      console.error(e)
      toast.error('Gagal mengubah stage')
    } finally {
      setSubmitting(false)
    }
  }

  const handleArchive = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hrm/recruitment/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchive: !app.isArchive }),
      })
      const json = await res.json()
      if (json.success) {
        await refreshApp()
        toast.success(app.isArchive ? 'Unarchived' : 'Archived')
        setArchiveDialogOpen(false)
      } else toast.error(json.message ?? 'Gagal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hrm/recruitment/applications/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        toast.success('Aplikasi dihapus')
        setDeleteDialogOpen(false)
        router.push('/hrm/recruitment?tab=applications')
      } else toast.error(json.message ?? 'Gagal menghapus')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddToOnBoard = () => {
    toast.success('Ditambahkan ke Job OnBoard')
    router.push('/hrm/recruitment?tab=onboarding')
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hrm/recruitment/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim(), noteCreatedName: 'Current User' }),
      })
      const json = await res.json()
      if (json.success) {
        await refreshApp()
        setNewNote('')
        toast.success('Catatan ditambahkan')
      } else toast.error(json.message ?? 'Gagal menambah catatan')
    } finally {
      setSubmitting(false)
    }
  }

  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">Job Application Details</CardTitle>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" className="h-7" onClick={() => router.push('/hrm/recruitment?tab=applications')}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Kembali ke Job Application
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={cardClass}>
                    <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-semibold">Basic Details</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 text-xs"
                          onClick={() => setArchiveDialogOpen(true)}
                        >
                          {app.isArchive ? 'UnArchive' : 'Archive'}
                        </Button>
                        {!app.isArchive && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                            onClick={() => setDeleteDialogOpen(true)}
                          >
                            <Trash className="h-3.5 w-3.5 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 rounded-lg border-2 border-primary">
                          <AvatarImage src={app.profile} />
                          <AvatarFallback className="rounded-lg">{getInitials(app.applicantName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{app.applicantName}</p>
                          <p className="text-sm text-muted-foreground">{app.email}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <Label className="text-xs text-muted-foreground">Stage</Label>
                        <div className="flex flex-wrap gap-3 mt-1.5">
                          {stages.map((stage) => (
                            <label key={stage.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="stage"
                                checked={app.stageId === stage.id || app.stage === stage.name}
                                onChange={() => handleStageChange(stage.id)}
                                disabled={submitting}
                                className="rounded-full border-input"
                              />
                              <span className="text-sm">{stage.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={cardClass}>
                    <CardHeader className="px-5 pt-5 pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
                      <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={handleAddToOnBoard}>
                        Add to Job OnBoard
                      </Button>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                      <dl className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd>{app.phone || '-'}</dd></div>
                        {app.dob && <div className="flex justify-between"><dt className="text-muted-foreground">DOB</dt><dd>{app.dob}</dd></div>}
                        {app.gender && <div className="flex justify-between"><dt className="text-muted-foreground">Gender</dt><dd>{app.gender}</dd></div>}
                        {app.country && <div className="flex justify-between"><dt className="text-muted-foreground">Country</dt><dd>{app.country}</dd></div>}
                        {app.state && <div className="flex justify-between"><dt className="text-muted-foreground">State</dt><dd>{app.state}</dd></div>}
                        {app.city && <div className="flex justify-between"><dt className="text-muted-foreground">City</dt><dd>{app.city}</dd></div>}
                        <div className="flex justify-between"><dt className="text-muted-foreground">Applied For</dt><dd>{app.jobTitle || '-'}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Applied at</dt><dd>{app.appliedDate}</dd></div>
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">CV / Resume</dt>
                          <dd>
                            {app.resume ? (
                              <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" asChild>
                                <a href="#" download onClick={(e) => { e.preventDefault(); toast.success('Download started'); }}>
                                  <Download className="h-3.5 w-3.5 mr-1" />
                                  Download
                                </a>
                              </Button>
                            ) : '-'}
                          </dd>
                        </div>
                        {app.coverLetter && (
                          <div className="col-span-full">
                            <dt className="text-muted-foreground mb-1">Cover Letter</dt>
                            <dd className="text-foreground">{app.coverLetter}</dd>
                          </div>
                        )}
                      </dl>
                      <div className="mt-3 pt-3 border-t flex items-center justify-end gap-1">
                        <span className="text-xs text-muted-foreground mr-2">Rating</span>
                        {stars.map((v) => (
                          <Star key={v} className={`h-4 w-4 ${v <= app.rating ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className={cardClass}>
                  <CardHeader className="px-5 pt-5 pb-3">
                    <CardTitle className="text-base font-semibold">Additional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-0 space-y-4">
                    {app.customQuestion && Object.keys(app.customQuestion).length > 0 && (
                      <div className="space-y-2">
                        {Object.entries(app.customQuestion).map(([q, ans]) => (
                          ans ? (
                            <div key={q} className="py-2 border-b last:border-0">
                              <p className="text-sm font-medium text-foreground">{q}</p>
                              <p className="text-sm text-muted-foreground">{ans}</p>
                            </div>
                          ) : null
                        ))}
                      </div>
                    )}
                    {app.skill && (
                      <div>
                        <Label className="text-sm font-medium">Skills</Label>
                        <p className="text-sm text-muted-foreground mt-1">{app.skill}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Applicant Notes</Label>
                      <div className="flex gap-2 mt-1">
                        <Textarea placeholder="Type here...." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={1} className="min-h-[36px]" />
                        <Button size="sm" className="h-9" onClick={handleAddNote}>Add Notes</Button>
                      </div>
                    </div>
                    {app.notes && app.notes.length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        {app.notes.map((note) => (
                          <div key={note.id} className="flex items-start justify-between gap-2 py-2 border-b last:border-0">
                            <div>
                              <p className="text-sm font-medium">{note.noteCreatedName}</p>
                              <p className="text-sm text-muted-foreground">{note.note}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{note.createdAt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{app.isArchive ? 'UnArchive' : 'Archive'} aplikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              {app.isArchive ? 'Aplikasi akan dikembalikan dari arsip.' : 'Aplikasi akan diarsipkan. Anda dapat UnArchive nanti.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>{app.isArchive ? 'UnArchive' : 'Archive'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus aplikasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
