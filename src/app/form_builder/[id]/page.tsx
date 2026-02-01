import React from "react"
import Link from "next/link"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconArrowLeft } from '@tabler/icons-react'

const mockForms = [
  {
    id: 'FRM-LEAD-01',
    name: 'Website Lead Form',
    code: 'lead_web_01',
    isActive: true,
    isLeadActive: true,
    responses: 125,
  },
  {
    id: 'FRM-FEEDBACK-01',
    name: 'Customer Feedback',
    code: 'cust_fb_01',
    isActive: true,
    isLeadActive: false,
    responses: 48,
  },
] as const

const mockFields = [
  { name: 'Name', type: 'text', required: true },
  { name: 'Email', type: 'email', required: true },
  { name: 'Phone', type: 'text', required: false },
] as const

interface FormDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function FormDetailPage({ params }: FormDetailPageProps) {
  const { id } = await params
  const form = mockForms.find((f) => f.id === id) ?? mockForms[0]

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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{form.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {form.code} · {form.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  Edit Form
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-3 bg-blue-500 hover:bg-blue-600 shadow-none"
                >
                  Preview
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  <Link href="/form_builder">
                    <IconArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge
                    className={
                      form.isActive
                        ? 'bg-green-100 text-green-700 border-none'
                        : 'bg-gray-100 text-gray-700 border-none'
                    }
                  >
                    {form.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Convert to Lead:{' '}
                    <span className="font-medium">
                      {form.isLeadActive ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {form.responses}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFields.map((field) => (
                      <TableRow key={field.name}>
                        <TableCell>{field.name}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell>
                          {field.required ? (
                            <Badge className="bg-red-100 text-red-700 border-none">
                              Required
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border-none">
                              Optional
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

