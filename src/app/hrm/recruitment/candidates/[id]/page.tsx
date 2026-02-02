'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Star } from 'lucide-react'
import { toast } from 'sonner'
import { getCandidateById } from '@/lib/recruitment-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'Shortlisted': return 'bg-blue-100 text-blue-800'
    case 'Interviewed': return 'bg-yellow-100 text-yellow-800'
    case 'Selected': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

interface CandidateDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const candidate = getCandidateById(id)

  if (!candidate) notFound()

  const handleDownloadResume = () => {
    if (candidate.resume) {
      toast.success('Download started')
    }
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3 w-full">
                <div className="flex items-center justify-between w-full gap-4">
                  <CardTitle className="text-base font-semibold text-foreground shrink-0">Detail Candidate</CardTitle>
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    {candidate.resume && (
                      <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={handleDownloadResume} title="Download CV">
                        <Download className="h-4 w-4 mr-1" />
                        Download CV
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-7" onClick={() => router.push('/hrm/recruitment?tab=candidates')}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Kembali ke Job Candidate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={cardClass}>
                    <CardHeader className="px-5 pt-5 pb-3">
                      <CardTitle className="text-base font-semibold text-foreground">Informasi Kandidat</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Nama</span>
                          <p className="text-sm text-foreground">{candidate.name}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Position</span>
                          <p className="text-sm text-foreground">{candidate.position}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Email</span>
                          <p className="text-sm text-foreground">{candidate.email}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Phone</span>
                          <p className="text-sm text-foreground">{candidate.phone}</p>
                        </div>
                        {candidate.appliedAt && (
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground">Applied at</span>
                            <p className="text-sm text-foreground">{candidate.appliedAt}</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Experience</span>
                          <p className="text-sm text-foreground">{candidate.experience}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <p className="text-sm text-foreground"><Badge className={getStatusBadgeColor(candidate.status)}>{candidate.status}</Badge></p>
                        </div>
                        {candidate.rating != null && (
                          <div className="space-y-1 col-span-2 flex items-center gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Rating</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((v) => (
                                <Star key={v} className={`h-4 w-4 ${v <= candidate.rating! ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className={cardClass}>
                    <CardHeader className="px-5 pt-5 pb-3">
                      <CardTitle className="text-base font-semibold text-foreground">Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-0">
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, i) => (
                          <Badge key={i} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
