'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
import { SimplePagination } from '@/components/ui/simple-pagination'
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

const formsData: FormItem[] = []

export default function FormBuilderPage() {
  const [forms, setForms] = useState<FormItem[]>(formsData)
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createFormName, setCreateFormName] = useState('')
  const [createFormActive, setCreateFormActive] = useState(true)
  const [creating, setCreating] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/form-builder')
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setForms(result.data)
        } else {
          toast.error(result.message || 'Gagal memuat data form')
        }
      } catch (error) {
        toast.error('Terjadi kesalahan saat memuat data form')
      } finally {
        setLoading(false)
      }
    }

    fetchForms()
  }, [])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleCreateForm = async () => {
    if (!createFormName.trim() || creating) {
      return
    }

    try {
      setCreating(true)
      const code = `frm_${Date.now()}` // Generate code automatically
      const response = await fetch('/api/form-builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createFormName.trim(),
          code: code,
          isActive: createFormActive
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Gagal membuat form')
        return
      }

      const created: FormItem = result.data
      setForms((prev) => [created, ...prev])
      setCreateFormName('')
      setCreateFormActive(true)
      setCreateDialogOpen(false)
      toast.success('Form berhasil dibuat')
    } catch (error) {
      toast.error('Terjadi kesalahan saat membuat form')
    } finally {
      setCreating(false)
    }
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
            {/* Title Page */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Form Builder</CardTitle>
                  <CardDescription>
                    Kelola dan buat form kustom Anda.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="inline-flex rounded-md bg-muted p-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
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
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                    title="Import"
                    disabled
                  >
                    <IconFileImport className="mr-2 h-3 w-3" />
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                    title="Export"
                    disabled
                  >
                    <IconDownload className="mr-2 h-3 w-3" />
                    Export
                  </Button>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="blue" className="shadow-none h-7 px-4">
                        <IconPlus className="mr-2 h-3 w-3" />
                        Create Form
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                        <DialogTitle>Create Form</DialogTitle>
                        <DialogDescription>
                          Buat form baru.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="formName">Form Name</Label>
                          <Input
                            id="formName"
                            placeholder="Website Lead Form"
                            value={createFormName}
                            onChange={(e) => setCreateFormName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Input 
                                type="radio" 
                                id="on" 
                                name="status" 
                                className="w-4 h-4"
                                checked={createFormActive} 
                                onChange={() => setCreateFormActive(true)} 
                              />
                              <Label htmlFor="on" className="font-normal cursor-pointer">On</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="radio" 
                                id="off" 
                                name="status" 
                                className="w-4 h-4"
                                checked={!createFormActive} 
                                onChange={() => setCreateFormActive(false)} 
                              />
                              <Label htmlFor="off" className="font-normal cursor-pointer">Off</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" className="shadow-none" onClick={() => setCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 shadow-none"
                          onClick={handleCreateForm}
                          disabled={!createFormName.trim() || creating}
                        >
                          Save Form
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* List view */}
            {viewMode === 'list' ? (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Form List</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search forms..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 h-9 w-[250px] bg-gray-50 border-gray-200 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6 font-medium">Nama form</TableHead>
                          <TableHead className="px-6 font-medium">On/Off</TableHead>
                          <TableHead className="px-6 font-medium text-right">Jumlah Response</TableHead>
                          <TableHead className="px-6 font-medium text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="px-6 py-8 text-center text-muted-foreground"
                            >
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length > 0 ? (
                          paginatedData.map((form) => (
                            <TableRow key={form.id}>
                              <TableCell className="px-6">
                                <div>
                                  <Link
                                    href={`/form_builder/${form.id}`}
                                    className="font-medium text-sm text-blue-600 hover:underline block"
                                  >
                                    {form.name}
                                  </Link>
                                </div>
                              </TableCell>
                              <TableCell className="px-6">
                                <Badge
                                  variant="outline"
                                  className={
                                    form.isActive
                                      ? 'bg-green-100 text-green-700 border-none'
                                      : 'bg-gray-100 text-gray-700 border-none'
                                  }
                                >
                                  {form.isActive ? 'On' : 'Off'}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 text-right">{form.responses}</TableCell>
                              <TableCell className="px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                    title="Form Field"
                                    asChild
                                  >
                                    <Link href={`/form_builder/${form.id}`}>
                                      <LayoutList className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100"
                                    title="Delete"
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="px-6 py-8 text-center text-muted-foreground"
                            >
                              No forms found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalRecords > 0 && (
                    <div className="px-6 pb-6 pt-4">
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
                 <div className="p-8 text-center text-muted-foreground">
                    Grid view not supported in this simplified version. Please switch to List view.
                 </div>
              </>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
