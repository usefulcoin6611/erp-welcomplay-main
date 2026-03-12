"use client"

import { useState } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/auth-context'

// Types
interface NotificationTemplate {
  id: string
  name: string
}

// Mock data - based on reference Laravel project
const mockTemplates: NotificationTemplate[] = [
  { id: '1', name: 'New User Registration' },
  { id: '2', name: 'Invoice Created' },
  { id: '3', name: 'Payment Received' },
  { id: '4', name: 'Project Assigned' },
  { id: '5', name: 'Task Completed' },
  { id: '6', name: 'Leave Request' },
  { id: '7', name: 'Meeting Reminder' },
  { id: '8', name: 'Password Reset' },
  { id: '9', name: 'Bill Created' },
  { id: '10', name: 'Expense Created' },
  { id: '11', name: 'Proposal Created' },
  { id: '12', name: 'Invoice Payment Reminder' },
  { id: '13', name: 'Invoice Sent' },
  { id: '14', name: 'Bill Payment Reminder' },
  { id: '15', name: 'Estimate Accepted' },
  { id: '16', name: 'Estimate Rejected' },
  { id: '17', name: 'Contract Sent' },
  { id: '18', name: 'Contract Signed' },
  { id: '19', name: 'Deal Created' },
  { id: '20', name: 'Task Assigned' },
  { id: '21', name: 'Task Comment' },
  { id: '22', name: 'Task Moved' },
  { id: '23', name: 'Bug Assigned' },
  { id: '24', name: 'Bug Status Changed' },
  { id: '25', name: 'Bug Comment' },
  { id: '26', name: 'Timesheet Approved' },
  { id: '27', name: 'Timesheet Rejected' },
  { id: '28', name: 'New Ticket' },
  { id: '29', name: 'Ticket Reply' },
  { id: '30', name: 'Ticket Status Changed' },
]

export default function NotificationTemplatesPage() {
  const { user } = useAuth()
  const isCompany = user?.type === 'company'
  const [templates] = useState<NotificationTemplate[]>(mockTemplates)

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
              <CardHeader className="px-6">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg font-semibold">Notification Template</CardTitle>
                  <CardDescription>
                    Manage notification templates for your system.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <CardTitle>Template List</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Name</TableHead>
                        {isCompany && <TableHead className="px-6 w-[150px]">Action</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="px-6 font-medium">{template.name}</TableCell>
                          {isCompany && (
                            <TableCell className="px-6">
                              <Link href={`/notifications/${template.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </Link>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
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


