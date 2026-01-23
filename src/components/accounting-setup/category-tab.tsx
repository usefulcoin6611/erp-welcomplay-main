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

type Category = {
  id: number
  name: string
  type: 'Product & Service' | 'Income' | 'Expense'
  account: string
}

const mockCategories: Category[] = [
  { id: 1, name: 'Product Category', type: 'Product & Service', account: '-' },
  { id: 2, name: 'Income Category', type: 'Income', account: 'Sales Revenue' },
  { id: 3, name: 'Expense Category', type: 'Expense', account: 'Operating Expenses' },
]

const categoryTypes = [
  { value: 'Product & Service', label: 'Product & Service' },
  { value: 'Income', label: 'Income' },
  { value: 'Expense', label: 'Expense' },
] as const

const accounts = [
  { id: 1, name: 'Sales Revenue' },
  { id: 2, name: 'Operating Expenses' },
  { id: 3, name: 'Cost of Goods Sold' },
]

export function CategoryTab() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState<{ name: string; type: string; account: string }>({
    name: '',
    type: '',
    account: '',
  })

  const filteredData = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.trim().toLowerCase()
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.account.toLowerCase().includes(q),
    )
  }, [categories, search])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const needsAccount = formData.type === 'Income' || formData.type === 'Expense'
  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.type.trim().length > 0 &&
    (!needsAccount || formData.account.trim().length > 0)

  const handleCreate = () => {
    if (!isFormValid) return
    const accountName =
      needsAccount ? accounts.find((a) => String(a.id) === formData.account)?.name || '-' : '-'
    const newCategory: Category = {
      id: categories.length + 1,
      name: formData.name.trim(),
      type: formData.type as Category['type'],
      account: accountName,
    }
    setCategories([...categories, newCategory])
    setFormData({ name: '', type: '', account: '' })
    setCreateDialogOpen(false)
  }

  const startEdit = (category: Category) => {
    setEditingCategoryId(category.id)
    setFormData({
      name: category.name,
      type: category.type,
      account: category.account === '-' ? '' : String(accounts.find((a) => a.name === category.account)?.id || ''),
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (editingCategoryId == null) return
    if (!isFormValid) return
    const accountName =
      needsAccount ? accounts.find((a) => String(a.id) === formData.account)?.name || '-' : '-'
    setCategories(
      categories.map((c) =>
        c.id === editingCategoryId
          ? {
              ...c,
              name: formData.name.trim(),
              type: formData.type as Category['type'],
              account: accountName,
            }
          : c,
      ),
    )
    setEditDialogOpen(false)
    setEditingCategoryId(null)
    setFormData({ name: '', type: '', account: '' })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setCategories(categories.filter((c) => c.id !== id))
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
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-type">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value, account: '' })}
                >
                  <SelectTrigger id="category-type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {needsAccount && (
                <div className="space-y-2">
                  <Label htmlFor="category-account">
                    Account <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.account} onValueChange={(value) => setFormData({ ...formData, account: value })}>
                    <SelectTrigger id="category-account">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                placeholder="Search categories..."
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
                  <TableHead className="px-4 py-3">Account</TableHead>
                  <TableHead className="px-4 py-3">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((c) => (
                    <TableRow key={c.id} className="font-style">
                      <TableCell className="px-4 py-3">{c.name}</TableCell>
                      <TableCell className="px-4 py-3">{c.type}</TableCell>
                      <TableCell className="px-4 py-3">{c.account}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => startEdit(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDelete(c.id)}
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
                      No categories found
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
            setEditingCategoryId(null)
            setFormData({ name: '', type: '', account: '' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-category-name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value, account: '' })}
              >
                <SelectTrigger id="edit-category-type">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(formData.type === 'Income' || formData.type === 'Expense') && (
              <div className="space-y-2">
                <Label htmlFor="edit-category-account">
                  Account <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.account} onValueChange={(value) => setFormData({ ...formData, account: value })}>
                  <SelectTrigger id="edit-category-account">
                    <SelectValue placeholder="Select Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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


