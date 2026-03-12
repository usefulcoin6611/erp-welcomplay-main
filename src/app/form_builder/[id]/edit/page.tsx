'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { IconArrowLeft } from '@tabler/icons-react'
import { toast } from 'sonner'

type FormData = {
  id: string
  name: string
  code: string
  isActive: boolean
  isLeadActive: boolean
}

export default function FormBuilderEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isLeadActive, setIsLeadActive] = useState(false)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/form-builder/${id}`)
        const json = await res.json()
        if (json?.success && json.data) {
          const d = json.data
          setName(d.name ?? '')
          setCode(d.code ?? '')
          setIsActive(!!d.isActive)
          setIsLeadActive(!!d.isLeadActive)
        } else {
          toast.error('Form not found')
          router.push('/form_builder')
        }
      } catch {
        toast.error('Failed to load form')
        router.push('/form_builder')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchForm()
  }, [id, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim() || saving) return

    try {
      setSaving(true)
      const res = await fetch(`/api/form-builder/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), code: code.trim(), isActive, isLeadActive }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        toast.error(result.message || 'Failed to update form')
        return
      }

      toast.success('Form updated successfully')
      router.push(`/form_builder/${id}`)
      router.refresh()
    } catch {
      toast.error('Error updating form')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <CardTitle>Edit Form</CardTitle>
                <CardDescription>Form ID: {id}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="formName">Form Name</Label>
                    <Input
                      id="formName"
                      placeholder="e.g. Website Lead Form"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="formCode">Code</Label>
                    <Input
                      id="formCode"
                      placeholder="e.g. lead_web_01"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        id="status-on"
                        name="status"
                        className="w-4 h-4"
                        checked={isActive}
                        onChange={() => setIsActive(true)}
                      />
                      <Label htmlFor="status-on" className="font-normal cursor-pointer">On</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="radio"
                        id="status-off"
                        name="status"
                        className="w-4 h-4"
                        checked={!isActive}
                        onChange={() => setIsActive(false)}
                      />
                      <Label htmlFor="status-off" className="font-normal cursor-pointer">Off</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="leadActive"
                      checked={isLeadActive}
                      onCheckedChange={(v) => setIsLeadActive(!!v)}
                    />
                    <Label htmlFor="leadActive" className="font-normal cursor-pointer">Lead active</Label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" className="shadow-none" asChild>
                      <Link href={`/form_builder/${id}`}>Cancel</Link>
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none" disabled={saving || !name.trim() || !code.trim()}>
                      {saving ? 'Saving...' : 'Save'}
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
