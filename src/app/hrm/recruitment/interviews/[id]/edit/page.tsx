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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { getInterviewById, updateInterview } from '@/lib/recruitment-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'
const interviewers = ['Sarah Johnson', 'Emily Davis', 'David Lee', 'Michael Brown']
const locations = ['Meeting Room A', 'Meeting Room B', 'Video Call', 'Phone Call']
const statuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']

interface InterviewEditPageProps {
  params: Promise<{ id: string }>
}

export default function InterviewEditPage({ params }: InterviewEditPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const item = getInterviewById(id)

  const [candidateName, setCandidateName] = useState(item?.candidateName ?? '')
  const [position, setPosition] = useState(item?.position ?? '')
  const [interviewDate, setInterviewDate] = useState(item?.interviewDate ?? '')
  const [interviewTime, setInterviewTime] = useState(item?.interviewTime ?? '')
  const [interviewer, setInterviewer] = useState(item?.interviewer ?? '')
  const [location, setLocation] = useState(item?.location ?? '')
  const [status, setStatus] = useState(item?.status ?? '')

  if (!item) notFound()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateInterview(id, { candidateName, position, interviewDate, interviewTime, interviewer, location, status })
    router.push(`/hrm/recruitment/interviews/${id}`)
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Edit Interview - {item.candidateName}</h1>
              <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => router.push('/hrm/recruitment?tab=interviews')}>
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Interview Schedule
              </Button>
            </div>
            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Form Edit Interview</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Candidate Name</Label>
                      <Input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} className="h-9" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Input value={position} onChange={(e) => setPosition(e.target.value)} className="h-9" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interview Date</Label>
                      <Input type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} className="h-9" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Interview Time</Label>
                      <Input type="time" value={interviewTime} onChange={(e) => setInterviewTime(e.target.value)} className="h-9" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Interviewer</Label>
                      <Select value={interviewer} onValueChange={setInterviewer}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select interviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {interviewers.map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((l) => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-none">Simpan</Button>
                    <Button type="button" variant="outline" className="h-9" onClick={() => router.push('/hrm/recruitment?tab=interviews')}>Batal</Button>
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
