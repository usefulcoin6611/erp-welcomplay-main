'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'

type CustomField = {
  id: number
  name: string
  type: string
  module: string
}

const mockCustomFields: CustomField[] = [
  { id: 1, name: 'Custom Field 1', type: 'Text', module: 'Invoice' },
  { id: 2, name: 'Custom Field 2', type: 'Number', module: 'Bill' },
  { id: 3, name: 'Custom Field 3', type: 'Date', module: 'Customer' },
]

const fieldTypes = [
  { value: 'Text', label: 'Text' },
  { value: 'Number', label: 'Number' },
  { value: 'Date', label: 'Date' },
  { value: 'Select', label: 'Select' },
]

const modules = [
  { value: 'Invoice', label: 'Invoice' },
  { value: 'Bill', label: 'Bill' },
  { value: 'Customer', label: 'Customer' },
  { value: 'Vendor', label: 'Vendor' },
  { value: 'Product', label: 'Product' },
]

export function CustomFieldTab() {
  const [customFields, setCustomFields] = useState<CustomField[]>(mockCustomFields)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({ name: '', type: '', module: '' })

  const filteredData = useMemo(() => {
    if (!search.trim()) return customFields
    const q = search.trim().toLowerCase()
    return customFields.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.module.toLowerCase().includes(q),
    )
  }, [customFields, search])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length
  const isFormValid =
    formData.name.trim().length > 0 && formData.type.trim().length > 0 && formData.module.trim().length > 0

  const handleCreate = () => {
    if (!isFormValid) return
    const newField: CustomField = {
      id: customFields.length + 1,
      name: formData.name.trim(),
      type: formData.type,
      module: formData.module,
    }
    setCustomFields([...customFields, newField])
    setFormData({ name: '', type: '', module: '' })
    setCreateDialogOpen(false)
  }

  const startEdit = (field: CustomField) => {
    setEditingFieldId(field.id)
    setFormData({ name: field.name, type: field.type, module: field.module })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (editingFieldId == null) return
    if (!isFormValid) return
    setCustomFields(
      customFields.map((f) =>
        f.id === editingFieldId
          ? { ...f, name: formData.name.trim(), type: formData.type, module: formData.module }
          : f,
      ),
    )
    setEditDialogOpen(false)
    setEditingFieldId(null)
    setFormData({ name: '', type: '', module: '' })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setCustomFields(customFields.filter((f) => f.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Field</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cf-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cf-name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cf-type">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="cf-type">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf-module">
                    Module <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.module}
                    onValueChange={(value) => setFormData({ ...formData, module: value })}
                  >
                    <SelectTrigger id="cf-module">
                      <SelectValue placeholder="Select Module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="blue" onClick={handleCreate} disabled={!isFormValid} className="shadow-none">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search custom fields..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setSearch('')
                    setCurrentPage(1)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">Name</TableHead>
                  <TableHead className="px-4 py-3">Type</TableHead>
                  <TableHead className="px-4 py-3">Module</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((f) => (
                    <TableRow key={f.id} className="font-style">
                      <TableCell className="px-4 py-3">{f.name}</TableCell>
                      <TableCell className="px-4 py-3">{f.type}</TableCell>
                      <TableCell className="px-4 py-3">{f.module}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => startEdit(f)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDelete(f.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No custom fields found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalRecords > 0 && (
            <div className="mt-4 px-4 pb-4">
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

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) {
            setEditingFieldId(null)
            setFormData({ name: '', type: '', module: '' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom Field</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cf-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-cf-name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cf-type">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="edit-cf-type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cf-module">
                  Module <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
                  <SelectTrigger id="edit-cf-module">
                    <SelectValue placeholder="Select Module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="blue" onClick={handleUpdate} disabled={!isFormValid} className="shadow-none">
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


