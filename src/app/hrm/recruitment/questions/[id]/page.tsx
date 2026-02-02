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
import { ArrowLeft, Pencil } from 'lucide-react'
import { getQuestionById } from '@/lib/recruitment-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

interface QuestionDetailPageProps {
  params: Promise<{ id: string }>
}

export default function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const q = getQuestionById(id)

  if (!q) notFound()

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
                  <CardTitle className="text-base font-semibold text-foreground">Detail Custom Question</CardTitle>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="outline" size="sm" className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200" onClick={() => router.push(`/hrm/recruitment/questions/${id}/edit`)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="h-7" onClick={() => router.push('/hrm/recruitment?tab=questions')}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Kembali
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Pertanyaan</span>
                  <p className="text-sm text-foreground mt-1">{q.question}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Is Required</span>
                  <p className="text-sm text-foreground mt-1">
                    {q.isRequired === 'yes' ? <Badge className="bg-blue-100 text-blue-800">Required</Badge> : <Badge className="bg-gray-100 text-gray-800">Optional</Badge>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
