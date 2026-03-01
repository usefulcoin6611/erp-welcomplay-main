'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IconDownload,
  IconFileImport,
  IconPlus,
} from '@tabler/icons-react'
import { Search as SearchIcon, Eye, Pencil, Trash, LayoutList, FileBarChart2 } from 'lucide-react'
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
  const router = useRouter()
  const [forms, setForms] = useState<FormItem[]>(formsData)
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createFormName, setCreateFormName] = useState('')
  const [createFormActive, setCreateFormActive] = useState(true)
  const [createFormLeadActive, setCreateFormLeadActive] = useState(false)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Edit form state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<FormItem | null>(null)
  const [editFormName, setEditFormName] = useState('')
  const [editFormCode, setEditFormCode] = useState('')
  const [editFormActive, setEditFormActive] = useState(true)
  const [editFormLeadActive, setEditFormLeadActive] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete state
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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
      const code = `frm_${Date.now()}`
      const response = await fetch('/api/form-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createFormName.trim(),
          code,
          isActive: createFormActive,
          isLeadActive: createFormLeadActive,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Failed to create form')
        return
      }

      const created: FormItem = result.data
      setForms((prev) => [created, ...prev])
      setCreateFormName('')
      setCreateFormActive(true)
      setCreateFormLeadActive(false)
      setCreateDialogOpen(false)
      toast.success('Form created successfully')
    } catch (error) {
      toast.error('Error creating form')
    } finally {
      setCreating(false)
    }
  }

  const openEditDialog = (form: FormItem) => {
    setEditingForm(form)
    setEditFormName(form.name)
    setEditFormCode(form.code)
    setEditFormActive(form.isActive)
    setEditFormLeadActive(form.isLeadActive)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingForm || !editFormName.trim() || savingEdit) return

    try {
      setSavingEdit(true)
      const response = await fetch(`/api/form-builder/${editingForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editFormName.trim(),
          code: editFormCode.trim(),
          isActive: editFormActive,
          isLeadActive: editFormLeadActive,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Failed to update form')
        return
      }

      const updated: FormItem = result.data
      setForms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      setEditingForm(null)
      setEditDialogOpen(false)
      toast.success('Form updated successfully')
    } catch (error) {
      toast.error('Error updating form')
    } finally {
      setSavingEdit(false)
    }
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteFormId(id)
    setDeleteAlertOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteFormId || deleteLoading) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`/api/form-builder/${deleteFormId}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        toast.error(result.message || 'Failed to delete form')
        return
      }

      setForms((prev) => prev.filter((f) => f.id !== deleteFormId))
      setDeleteFormId(null)
      setDeleteAlertOpen(false)
      toast.success('Form deleted successfully')
    } catch (error) {
      toast.error('Error deleting form')
    } finally {
      setDeleteLoading(false)
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
                                id="create-on"
                                name="create-status"
                                className="w-4 h-4"
                                checked={createFormActive}
                                onChange={() => setCreateFormActive(true)}
                              />
                              <Label htmlFor="create-on" className="font-normal cursor-pointer">On</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="radio"
                                id="create-off"
                                name="create-status"
                                className="w-4 h-4"
                                checked={!createFormActive}
                                onChange={() => setCreateFormActive(false)}
                              />
                              <Label htmlFor="create-off" className="font-normal cursor-pointer">Off</Label>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="create-lead-active"
                            checked={createFormLeadActive}
                            onCheckedChange={(v) => setCreateFormLeadActive(!!v)}
                          />
                          <Label htmlFor="create-lead-active" className="font-normal cursor-pointer">Lead active</Label>
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

                  {/* Edit Form Dialog */}
                  <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) setEditingForm(null); setEditDialogOpen(open); }}>
                    <DialogContent className="sm:max-w-[520px]">
                      <DialogHeader>
                        <DialogTitle>Edit Form</DialogTitle>
                        <DialogDescription>
                          Update form name, code, and status.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="editFormName">Form Name</Label>
                          <Input
                            id="editFormName"
                            placeholder="Form name"
                            value={editFormName}
                            onChange={(e) => setEditFormName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="editFormCode">Code</Label>
                          <Input
                            id="editFormCode"
                            placeholder="Form code"
                            value={editFormCode}
                            onChange={(e) => setEditFormCode(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Input
                                type="radio"
                                id="edit-on"
                                name="edit-status"
                                className="w-4 h-4"
                                checked={editFormActive}
                                onChange={() => setEditFormActive(true)}
                              />
                              <Label htmlFor="edit-on" className="font-normal cursor-pointer">On</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="radio"
                                id="edit-off"
                                name="edit-status"
                                className="w-4 h-4"
                                checked={!editFormActive}
                                onChange={() => setEditFormActive(false)}
                              />
                              <Label htmlFor="edit-off" className="font-normal cursor-pointer">Off</Label>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="edit-lead-active"
                            checked={editFormLeadActive}
                            onCheckedChange={(v) => setEditFormLeadActive(!!v)}
                          />
                          <Label htmlFor="edit-lead-active" className="font-normal cursor-pointer">Lead active</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" className="shadow-none" onClick={() => setEditDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 shadow-none"
                          onClick={handleSaveEdit}
                          disabled={!editFormName.trim() || !editFormCode.trim() || savingEdit}
                        >
                          {savingEdit ? 'Saving...' : 'Save'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete confirmation */}
                  <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete form</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the form and its fields.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="shadow-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-rose-600 hover:bg-rose-700 shadow-none"
                          onClick={(e) => { e.preventDefault(); handleDelete(); }}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
            </Card>

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
                          <TableHead className="px-6 font-medium">Form Name</TableHead>
                          <TableHead className="px-6 font-medium">Code</TableHead>
                          <TableHead className="px-6 font-medium">Status</TableHead>
                          <TableHead className="px-6 font-medium text-right">Responses</TableHead>
                          <TableHead className="px-6 font-medium text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="px-6 py-8 text-center text-muted-foreground"
                            >
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : paginatedData.length > 0 ? (
                          paginatedData.map((form) => (
                            <TableRow key={form.id}>
                              <TableCell className="px-6 font-medium text-sm">
                                {form.name}
                              </TableCell>
                              <TableCell className="px-6 font-mono text-sm">{form.code}</TableCell>
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
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                                    title="View"
                                    onClick={() => router.push(`/form_builder/${form.id}`)}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                    title="Edit"
                                    onClick={() => openEditDialog(form)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                                    title="Form Fields"
                                    onClick={() => router.push(`/form_builder/${form.id}`)}
                                  >
                                    <LayoutList className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
                                    title="Responses"
                                    onClick={() => router.push(`/form_builder/${form.id}/response`)}
                                  >
                                    <FileBarChart2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
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
                              colSpan={5}
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
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
