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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

export default function QuestionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loaded, setLoaded] = useState(false)
  const [found, setFound] = useState(false)
  const [question, setQuestion] = useState('')
  const [isRequired, setIsRequired] = useState('yes')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/hrm/recruitment/questions/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setLoaded(true)
          if (json.success && json.data) {
            setFound(true)
            setQuestion(json.data.question)
            setIsRequired(json.data.isRequired ?? 'yes')
          }
        }
      })
    return () => { cancelled = true }
  }, [id])

  if (!loaded) {
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
  if (loaded && !found) notFound()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hrm/recruitment/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, isRequired }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message ?? 'Pertanyaan berhasil diperbarui')
        router.push(`/hrm/recruitment/questions/${id}`)
      } else {
        toast.error(json.message ?? 'Gagal memperbarui')
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memperbarui')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Edit Custom Question</h1>
              <Button variant="outline" size="sm" onClick={() => router.push('/hrm/recruitment?tab=questions')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            </div>
            <Card className={cardClass}>
              <CardHeader className="px-5 pt-5 pb-3">
                <CardTitle className="text-base font-semibold">Form Edit Question</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Is Required</Label>
                    <Select value={isRequired} onValueChange={setIsRequired}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes (Required)</SelectItem>
                        <SelectItem value="no">No (Optional)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="h-9 bg-blue-600 hover:bg-blue-700 shadow-none" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" className="h-9" onClick={() => router.push('/hrm/recruitment?tab=questions')} disabled={submitting}>Batal</Button>
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
