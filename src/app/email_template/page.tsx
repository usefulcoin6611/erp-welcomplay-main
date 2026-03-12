"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Types
interface EmailTemplate {
  id: string
  name: string
  is_active?: boolean
}

// Mock data
const mockEmailTemplates: EmailTemplate[] = [
  { id: '1', name: 'New User', is_active: true },
  { id: '2', name: 'New Invoice', is_active: false },
  { id: '3', name: 'Payment Reminder', is_active: true },
  { id: '4', name: 'Payment Success', is_active: true },
  { id: '5', name: 'Invoice Sent', is_active: false },
  { id: '6', name: 'New Proposal', is_active: true },
  { id: '7', name: 'Proposal Accepted', is_active: true },
  { id: '8', name: 'Proposal Rejected', is_active: false },
  { id: '9', name: 'New Task', is_active: true },
  { id: '10', name: 'Task Completed', is_active: true },
]

export default function EmailTemplatePage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  const isCompany = user?.type === 'company'

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
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Name</TableHead>
                          <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockEmailTemplates.length > 0 ? (
                        mockEmailTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="px-6">{template.name}</TableCell>
                            <TableCell className="px-6">
                              {(isSuperAdmin || isCompany) && (
                                <Link href={`/email_template/${template.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            className="px-6 py-8 text-center text-muted-foreground"
                          >
                            No email templates found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}


