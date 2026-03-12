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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

type BranchOption = { id: string; name: string }
type CategoryOption = { id: string; name: string }

interface JobEditPageProps {
  params: Promise<{ id: string }>
}

export default function JobEditPage({ params }: JobEditPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [job, setJob] = useState<{ title: string; branchId: string; jobCategoryId: string; positions: number; status: string; startDate: string; endDate: string; description?: string; requirement?: string } | null>(null)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [branchId, setBranchId] = useState('')
  const [jobCategoryId, setJobCategoryId] = useState('')
  const [positions, setPositions] = useState('')
  const [status, setStatus] = useState<'active' | 'in_active'>('active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [requirement, setRequirement] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch(`/api/hrm/recruitment/jobs/${id}`).then((r) => r.json()),
      fetch('/api/branches').then((r) => r.json()),
      fetch('/api/job-categories').then((r) => r.json()),
    ]).then(([jobJson, branchJson, categoryJson]) => {
      if (cancelled) return
      if (jobJson.success && jobJson.data) {
        const j = jobJson.data
        setJob(j)
        setTitle(j.title)
        setBranchId(j.branchId ?? '')
        setJobCategoryId(j.jobCategoryId ?? '')
        setPositions(String(j.positions ?? ''))
        setStatus((j.status === 'in_active' ? 'in_active' : 'active') as 'active' | 'in_active')
        setStartDate(j.startDate ?? '')
        setEndDate(j.endDate ?? '')
        setDescription(j.description ?? '')
        setRequirement(j.requirement ?? '')
      }
      if (branchJson.success && Array.isArray(branchJson.data)) setBranches(branchJson.data)
      if (categoryJson.success && Array.isArray(categoryJson.data)) setCategories(categoryJson.data)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (!job && !loading) notFound()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hrm/recruitment/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          branchId,
          jobCategoryId,
          positions: parseInt(positions, 10) || 0,
          status,
          startDate,
          endDate,
          description: description || undefined,
          requirement: requirement || undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message ?? 'Job berhasil diperbarui')
        router.push(`/hrm/recruitment/jobs/${id}`)
      } else {
        toast.error(json.message ?? 'Gagal memperbarui job')
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memperbarui job')
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Edit Job - {job?.title ?? id}</h1>
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => router.push('/hrm/recruitment?tab=jobs')}>
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Job
              </Button>
            </div>

            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Form Edit Job</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Select value={branchId} onValueChange={setBranchId}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={jobCategoryId} onValueChange={setJobCategoryId}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Number of Positions</Label>
                      <Input type="number" min={1} value={positions} onChange={(e) => setPositions(e.target.value)} className="h-9" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'in_active')}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="in_active">In Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <RichTextEditor
                    id="edit-description"
                    label="Job Description"
                    value={description}
                    onChange={setDescription}
                    placeholder="Enter job description..."
                    minHeight="180px"
                  />
                  <RichTextEditor
                    id="edit-requirement"
                    label="Job Requirement"
                    value={requirement}
                    onChange={setRequirement}
                    placeholder="Enter job requirement..."
                    minHeight="180px"
                  />
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-none" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" className="h-9" onClick={() => router.push('/hrm/recruitment?tab=jobs')} disabled={submitting}>Batal</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
