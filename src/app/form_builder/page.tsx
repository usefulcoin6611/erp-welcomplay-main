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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

const forms = [
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

export default function FormBuilderPage() {
  const totalForms = forms.length
  const totalResponses = forms.reduce((sum, f) => sum + f.responses, 0)

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
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Form Builder</h1>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Form
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>Create Form</DialogTitle>
                    <DialogDescription>
                      Definisikan form baru untuk menangkap data lead atau feedback.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="formName">Form Name</Label>
                      <Input
                        id="formName"
                        placeholder="Website Lead Form"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="formCode">Form Code</Label>
                      <Input
                        id="formCode"
                        placeholder="lead_web_01"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      className="shadow-none"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      className="bg-blue-500 hover:bg-blue-600 shadow-none"
                    >
                      Save Form
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Forms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalForms}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Responses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalResponses}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Cari form berdasarkan nama atau code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1 min-w-0">
                    <label className="mb-1 block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search forms..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form List</CardTitle>
                <CardDescription>
                  Daftar form builder seperti modul FormBuilder ERP.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Convert to Lead</TableHead>
                      <TableHead className="text-right">
                        Responses
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell>
                          <div className="font-semibold">
                            <Link
                              href={`/form_builder/${form.id}`}
                              className="text-primary hover:underline"
                            >
                              {form.name}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {form.id}
                          </div>
                        </TableCell>
                        <TableCell>{form.code}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              form.isActive
                                ? 'bg-green-100 text-green-700 border-none'
                                : 'bg-gray-100 text-gray-700 border-none'
                            }
                          >
                            {form.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              form.isLeadActive
                                ? 'bg-blue-100 text-blue-700 border-none'
                                : 'bg-gray-100 text-gray-700 border-none'
                            }
                          >
                            {form.isLeadActive ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {form.responses}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 shadow-none"
                            >
                              <Link href={`/form_builder/${form.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 shadow-none"
                            >
                              Edit
                            </Button>
                          </div>
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

