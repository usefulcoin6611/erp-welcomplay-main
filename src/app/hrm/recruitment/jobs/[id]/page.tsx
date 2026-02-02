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
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getJobById } from '@/lib/recruitment-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const job = getJobById(id)

  if (!job) notFound()

  const statusClass = job.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-100 text-red-700 border-red-100'
  const statusLabel = job.status === 'active' ? 'Active' : 'In Active'

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
                  <CardTitle className="text-base font-semibold text-foreground">Job Details</CardTitle>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => router.push(`/hrm/recruitment/jobs/${id}/edit`)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="h-7" onClick={() => router.push('/hrm/recruitment?tab=jobs')}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Kembali ke Job
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <div className="table-responsive">
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground w-[140px]">Job Title</TableCell>
                              <TableCell>{job.title}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Branch</TableCell>
                              <TableCell>{job.branch}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Job Category</TableCell>
                              <TableCell>{job.category || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Positions</TableCell>
                              <TableCell>{job.positions}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Status</TableCell>
                              <TableCell><Badge className={statusClass}>{statusLabel}</Badge></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Created Date</TableCell>
                              <TableCell>{formatDate(job.createdAt)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Start Date</TableCell>
                              <TableCell>{formatDate(job.startDate)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">End Date</TableCell>
                              <TableCell>{formatDate(job.endDate)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground align-top">Skill</TableCell>
                              <TableCell>
                                {job.skill && job.skill.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {job.skill.map((s, i) => (
                                      <Badge key={i} variant="secondary" className="font-normal">{s}</Badge>
                                    ))}
                                  </div>
                                ) : '-'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    {(job.applicant && job.applicant.length > 0) && (
                      <div>
                        <h6 className="text-sm font-semibold text-foreground mb-1">Need to ask ?</h6>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {job.applicant.map((a, i) => (
                            <li key={i} className="capitalize">{a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(job.visibility && job.visibility.length > 0) && (
                      <div>
                        <h6 className="text-sm font-semibold text-foreground mb-1">Need to show option ?</h6>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {job.visibility.map((v, i) => (
                            <li key={i} className="capitalize">{v}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(job.customQuestionTitles && job.customQuestionTitles.length > 0) && (
                      <div>
                        <h6 className="text-sm font-semibold text-foreground mb-1">Custom Question</h6>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {job.customQuestionTitles.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {job.description && (
                      <div>
                        <h6 className="text-sm font-semibold text-foreground mb-1">Job Description</h6>
                        <div className="text-sm text-foreground whitespace-pre-wrap">{job.description}</div>
                      </div>
                    )}
                    {job.requirement && (
                      <div>
                        <h6 className="text-sm font-semibold text-foreground mb-1">Job Requirement</h6>
                        <div className="text-sm text-foreground whitespace-pre-wrap">{job.requirement}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
