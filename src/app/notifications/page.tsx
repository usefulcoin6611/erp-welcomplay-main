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

// Mock data
const mockTemplates: NotificationTemplate[] = [
  { id: '1', name: 'New User Registration' },
  { id: '2', name: 'Invoice Created' },
  { id: '3', name: 'Payment Received' },
  { id: '4', name: 'Project Assigned' },
  { id: '5', name: 'Task Completed' },
  { id: '6', name: 'Leave Request' },
  { id: '7', name: 'Meeting Reminder' },
  { id: '8', name: 'Password Reset' },
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
            <Card className="shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[150px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>
                            <Link href={`/notifications/${template.id}`}>
                              <Button variant="default" size="sm" className="shadow-none bg-warning hover:bg-warning/90">
                                <Eye className="mr-2 h-4 w-4" /> View
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


