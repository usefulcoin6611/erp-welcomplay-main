'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconArrowLeft } from '@tabler/icons-react'

export default function FormBuilderEditPage() {
  const params = useParams()
  const id = params.id as string

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="shadow-none" asChild>
                <Link href="/form_builder">
                  <IconArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader>
                <CardTitle>Form Builder Edit</CardTitle>
                <p className="text-sm text-muted-foreground">Form ID: {id}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="formName">Form Name</Label>
                  <Input id="formName" placeholder="Website Lead Form" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="formCode">Form Code</Label>
                  <Input id="formCode" placeholder="lead_web_01" disabled className="bg-muted" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="shadow-none" asChild>
                    <Link href="/form_builder">Cancel</Link>
                  </Button>
                  <Button className="bg-blue-500 hover:bg-blue-600 shadow-none">Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
