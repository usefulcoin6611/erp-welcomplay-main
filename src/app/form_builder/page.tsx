'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import {
  Card,
  CardContent,
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
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  IconDownload,
  IconFileImport,
  IconPlus,
} from '@tabler/icons-react'
import { List, LayoutGrid, Search as SearchIcon, X, Eye, Pencil, Trash, Frame, Copy, ArrowLeftRight, LayoutList } from 'lucide-react'
import { toast } from 'sonner'

type FormItem = {
  id: string
  name: string
  code: string
  isActive: boolean
  isLeadActive: boolean
  responses: number
}

const formsData: FormItem[] = [
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
  {
    id: 'FRM-CONTACT-01',
    name: 'Contact Us',
    code: 'contact_01',
    isActive: true,
    isLeadActive: true,
    responses: 89,
  },
  {
    id: 'FRM-SURVEY-01',
    name: 'Product Survey',
    code: 'survey_01',
    isActive: false,
    isLeadActive: false,
    responses: 32,
  },
]

function getFormPublicUrl(code: string) {
  if (typeof window === 'undefined') return `/form/${code}`
  return `${window.location.origin}/form/${code}`
}

function getFormIframeHtml(name: string, code: string) {
  const url = typeof window === 'undefined' ? `/form/${code}` : `${window.location.origin}/form/${code}`
  return `<iframe src='${url}' title='${name.replace(/'/g, "\\'")}'></iframe>`
}

export default function FormBuilderPage() {
  const [forms, setForms] = useState<FormItem[]>(formsData)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [convertForm, setConvertForm] = useState<FormItem | null>(null)

  const handleCopyLink = (form: FormItem) => {
    const url = getFormPublicUrl(form.code)
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard'))
  }

  const handleCopyIframe = (form: FormItem) => {
    const html = getFormIframeHtml(form.name, form.code)
    navigator.clipboard.writeText(html).then(() => toast.success('Iframe link copied to clipboard'))
  }

  const openConvertDialog = (form: FormItem) => {
    setConvertForm(form)
    setConvertDialogOpen(true)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleDelete = (id: string) => {
    setForms((prev) => prev.filter((f) => f.id !== id))
    setDeleteFormId(null)
    setDeleteAlertOpen(false)
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteFormId(id)
    setDeleteAlertOpen(true)
  }

  const filteredData = useMemo(() => {
    if (!search.trim()) return forms
    const q = search.trim().toLowerCase()
    return forms.filter(
      (form) =>
        form.name.toLowerCase().includes(q) ||
        form.code.toLowerCase().includes(q) ||
        form.id.toLowerCase().includes(q)
    )
  }, [search, forms])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

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
            {/* Header - view toggle, Import, Export, Create Form (sesuai reference-erp) */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-md bg-muted p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 shadow-none p-0 ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <List className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                    title="Import"
                  >
                    <IconFileImport className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shadow-none h-7"
                    title="Export"
                  >
                    <IconDownload className="h-3 w-3" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="blue" className="shadow-none h-7">
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
                          <Input id="formName" placeholder="Website Lead Form" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="formCode">Form Code</Label>
                          <Input id="formCode" placeholder="lead_web_01" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" className="shadow-none">
                          Cancel
                        </Button>
                        <Button type="button" className="bg-blue-500 hover:bg-blue-600 shadow-none">
                          Save Form
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* List view - tanpa statistics cards, langsung card list */}
            {viewMode === 'list' ? (
              <Card className="rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-0">
                  <div className="px-4 py-3 border-b flex items-center justify-between gap-4">
                    <CardTitle className="text-base font-medium">Form List</CardTitle>
                    <div className="relative w-full max-w-sm">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search forms..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                      />
                      {search.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => handleSearchChange('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3 font-normal">Form</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Code</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Status</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Convert to Lead</TableHead>
                          <TableHead className="px-4 py-3 font-normal text-right">Responses</TableHead>
                          <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.length > 0 ? (
                          paginatedData.map((form) => (
                            <TableRow key={form.id}>
                              <TableCell className="px-4 py-3">
                                <div>
                                  <Link
                                    href={`/form_builder/${form.id}`}
                                    className="font-normal text-sm hover:underline block"
                                  >
                                    {form.name}
                                  </Link>
                                  <span className="text-xs text-muted-foreground">{form.id}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-3">{form.code}</TableCell>
                              <TableCell className="px-4 py-3">
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
                              <TableCell className="px-4 py-3">
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
                              <TableCell className="px-4 py-3 text-right">{form.responses}</TableCell>
                              <TableCell className="px-4 py-3">
                                <div className="flex flex-wrap items-center justify-end gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                                    title="Copy iframe link"
                                    onClick={() => handleCopyIframe(form)}
                                  >
                                    <Frame className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="Convert into Lead Setting"
                                    onClick={() => openConvertDialog(form)}
                                  >
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-none bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                                    title="Copy link"
                                    onClick={() => handleCopyLink(form)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-none bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                                    title="Form field"
                                    asChild
                                  >
                                    <Link href={`/form_builder/${form.id}`}>
                                      <LayoutList className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                                    title="View Response"
                                    asChild
                                  >
                                    <Link href={`/form_builder/${form.id}/response`}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="Edit"
                                    asChild
                                  >
                                    <Link href={`/form_builder/${form.id}/edit`}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                    title="Delete"
                                    onClick={() => openDeleteConfirm(form.id)}
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              No forms found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalRecords > 0 && (
                    <div className="px-4 py-3 border-t">
                      <SimplePagination
                        totalCount={totalRecords}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                          setPageSize(size)
                          setCurrentPage(1)
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Grid view */
              <>
                <div className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between mb-4 border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardTitle className="text-base font-medium mb-0">Form List</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search forms..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                    />
                    {search.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => handleSearchChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((form) => (
                      <Card
                        key={form.id}
                        className="flex flex-col rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]"
                      >
                        <CardContent className="p-4 flex flex-col flex-1">
                          <div className="flex flex-1 items-start gap-3 border-b pb-3 mb-3">
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/form_builder/${form.id}`}
                                className="font-medium text-sm hover:underline block truncate"
                              >
                                {form.name}
                              </Link>
                              <span className="text-xs text-muted-foreground">{form.id}</span>
                              <span className="text-xs text-muted-foreground block">{form.code}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3 text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              className={
                                form.isActive
                                  ? 'bg-green-100 text-green-700 border-none'
                                  : 'bg-gray-100 text-gray-700 border-none'
                              }
                            >
                              {form.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-muted-foreground">Lead:</span>
                            <Badge
                              className={
                                form.isLeadActive
                                  ? 'bg-blue-100 text-blue-700 border-none'
                                  : 'bg-gray-100 text-gray-700 border-none'
                              }
                            >
                              {form.isLeadActive ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3 text-sm">
                            <span className="text-muted-foreground">Responses:</span>
                            <span className="font-medium">{form.responses}</span>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-1 mt-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 w-7 p-0 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                              title="Copy iframe link"
                              onClick={() => handleCopyIframe(form)}
                            >
                              <Frame className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 w-7 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              title="Convert into Lead Setting"
                              onClick={() => openConvertDialog(form)}
                            >
                              <ArrowLeftRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 w-7 p-0 bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                              title="Copy link"
                              onClick={() => handleCopyLink(form)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 w-7 p-0 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                              title="Form field"
                              asChild
                            >
                              <Link href={`/form_builder/${form.id}`}>
                                <LayoutList className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 w-7 p-0 bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                              title="View Response"
                              asChild
                            >
                              <Link href={`/form_builder/${form.id}/response`}>
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 w-7 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              title="Edit"
                              asChild
                            >
                              <Link href={`/form_builder/${form.id}/edit`}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-none h-7 w-7 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                              title="Delete"
                              onClick={() => openDeleteConfirm(form.id)}
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground rounded-lg border border-dashed">
                      No forms found
                    </div>
                  )}
                </div>
                {totalRecords > 0 && (
                  <div className="mt-4">
                    <SimplePagination
                      totalCount={totalRecords}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Convert into Lead Setting dialog */}
            <Dialog open={convertDialogOpen} onOpenChange={(open) => { setConvertDialogOpen(open); if (!open) setConvertForm(null) }}>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Convert into Lead Setting</DialogTitle>
                  <DialogDescription>
                    {convertForm ? `Form: ${convertForm.name}` : ''} — Atur mapping field ke lead dan pipeline.
                  </DialogDescription>
                </DialogHeader>
                {convertForm && (
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <Label htmlFor="convert-lead" className="cursor-pointer flex-1">Enable Convert to Lead</Label>
                      <input
                        id="convert-lead"
                        type="checkbox"
                        defaultChecked={convertForm.isLeadActive}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pilih field form yang akan di-map ke Subject, Name, Email, Phone. Pilih User dan Pipeline untuk lead baru.
                    </p>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setConvertDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 shadow-none"
                    onClick={() => {
                      if (convertForm) {
                        setForms((prev) => prev.map((f) => f.id === convertForm.id ? { ...f, isLeadActive: !f.isLeadActive } : f))
                        toast.success('Setting saved successfully!')
                      }
                      setConvertDialogOpen(false)
                      setConvertForm(null)
                    }}
                  >
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Form</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus form ini? Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteFormId(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => deleteFormId && handleDelete(deleteFormId)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
