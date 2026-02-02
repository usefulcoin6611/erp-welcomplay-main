'use client'

import { useState } from 'react'
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
import { addJob, getJobCategoriesList } from '@/lib/recruitment-data'
import { toast } from 'sonner'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]'
const branches = ['Head Office', 'Branch A', 'Branch B']
const statusOptions: { value: 'active' | 'in_active'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'in_active', label: 'In Active' },
]

export default function JobCreatePage() {
  const router = useRouter()
  const categories = getJobCategoriesList()
  const [title, setTitle] = useState('')
  const [branch, setBranch] = useState('')
  const [category, setCategory] = useState('')
  const [positions, setPositions] = useState('')
  const [status, setStatus] = useState<'active' | 'in_active'>('active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newJob = addJob({
      title,
      branch,
      category,
      positions: parseInt(positions, 10) || 0,
      status,
      startDate,
      endDate,
      description: description || undefined,
    })
    toast.success('Job berhasil dibuat')
    router.push(`/hrm/recruitment/jobs/${newJob.id}`)
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
              <h1 className="text-lg font-semibold">Job Create</h1>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => router.push('/hrm/recruitment?tab=jobs')}
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Job
              </Button>
            </div>

            <Card className={cardClass}>
              <CardHeader className="px-6 pt-6 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Create New Job</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-9"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger id="branch" className="h-9">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Job Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="h-9">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.title}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="positions">Number of Positions</Label>
                      <Input
                        id="positions"
                        type="number"
                        min={1}
                        value={positions}
                        onChange={(e) => setPositions(e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'in_active')}>
                      <SelectTrigger id="status" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Enter job description..."
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-none">
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9"
                      onClick={() => router.push('/hrm/recruitment?tab=jobs')}
                    >
                      Batal
                    </Button>
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
