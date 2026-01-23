"use client"

import { useState } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Notification Template</h1>
                <p className="text-sm text-muted-foreground">
                  Manage notification templates for your system
                </p>
              </div>
            </div>

            {/* Templates Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[150px] text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/notifications/${template.id}`}>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="shadow-none h-7 bg-gray-500 hover:bg-gray-600 text-white"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

