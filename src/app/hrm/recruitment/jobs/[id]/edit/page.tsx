'use client'

import { use, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { getJobById, updateJob } from '@/lib/recruitment-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'
const branches = ['Head Office', 'Branch A', 'Branch B']
const categories = ['IT', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales']

interface JobEditPageProps {
  params: Promise<{ id: string }>
}

export default function JobEditPage({ params }: JobEditPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const job = getJobById(id)

  const [title, setTitle] = useState(job?.title ?? '')
  const [branch, setBranch] = useState(job?.branch ?? '')
  const [category, setCategory] = useState(job?.category ?? '')
  const [positions, setPositions] = useState(job ? String(job.positions) : '')
  const [status, setStatus] = useState<'active' | 'in_active'>(job?.status ?? 'active')
  const [startDate, setStartDate] = useState(job?.startDate ?? '')
  const [endDate, setEndDate] = useState(job?.endDate ?? '')
  const [description, setDescription] = useState(job?.description ?? '')

  if (!job) {
    notFound()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateJob(id, {
      title,
      branch,
      category,
      positions: parseInt(positions, 10) || 0,
      status,
      startDate,
      endDate,
      description: description || undefined,
    })
    router.push(`/hrm/recruitment/jobs/${id}`)
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
              <h1 className="text-lg font-semibold">Edit Job - {job.title}</h1>
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
                      <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((b) => (
                            <SelectItem key={b} value={b}>{b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
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
                  <div className="space-y-2">
                    <Label>Job Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Enter job description..." className="resize-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-none">Simpan</Button>
                    <Button type="button" variant="outline" className="h-9" onClick={() => router.push('/hrm/recruitment?tab=jobs')}>Batal</Button>
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
