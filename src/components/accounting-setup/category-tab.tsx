'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Plus, Pencil, Trash2, Search, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Category = {
  id: string
  name: string
  type:
    | 'Product & Service'
    | 'Income'
    | 'Expense'
    | 'Asset'
    | 'Liability'
    | 'Equity'
    | 'Costs of Goods Sold'
  account: string | null
  color?: string | null
}

type ChartAccount = {
  id: string
  name: string
  code: string
  type: string
}

const categoryTypes = [
  { value: 'Product & Service', label: 'Product & Service' },
  { value: 'Income', label: 'Income' },
  { value: 'Expense', label: 'Expense' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Costs of Goods Sold', label: 'Costs of Goods Sold' },
] as const

export function CategoryTab() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartAccounts, setChartAccounts] = useState<ChartAccount[]>([])
  const [isAccountsLoading, setIsAccountsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState<{ name: string; type: string; account: string; color: string }>({
    name: '',
    type: '',
    account: '',
    color: 'FFFFFF',
  })

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      } else {
        toast.error(result.message || 'Gagal memuat data category')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchChartAccounts = useCallback(async () => {
    setIsAccountsLoading(true)
    try {
      const response = await fetch('/api/chart-of-accounts')
      const result = await response.json()
      if (result.success) {
        setChartAccounts(result.data)
      } else {
        toast.error(result.message || 'Gagal memuat Chart of Accounts')
      }
    } catch (error) {
      console.error('Error fetching chart of accounts:', error)
      toast.error('Terjadi kesalahan saat memuat akun')
    } finally {
      setIsAccountsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchChartAccounts()
  }, [fetchCategories, fetchChartAccounts])

  const filteredData = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.trim().toLowerCase()
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.account && c.account.toLowerCase().includes(q)),
    )
  }, [categories, search])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const needsAccount = formData.type !== '' && formData.type !== 'Product & Service'

  const availableAccounts = useMemo(() => {
    if (!needsAccount) return []
    if (!formData.type) return []

    switch (formData.type) {
      case 'Income':
        return chartAccounts.filter((a) => a.type === 'Income')
      case 'Expense':
        return chartAccounts.filter((a) => a.type === 'Expenses')
      case 'Asset':
        return chartAccounts.filter((a) => a.type === 'Assets')
      case 'Liability':
        return chartAccounts.filter((a) => a.type === 'Liabilities')
      case 'Equity':
        return chartAccounts.filter((a) => a.type === 'Equity')
      case 'Costs of Goods Sold':
        return chartAccounts.filter((a) => a.type === 'Costs of Goods Sold')
      default:
        return []
    }
  }, [chartAccounts, formData.type, needsAccount])

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.type.trim().length > 0 &&
    (!needsAccount || formData.account.trim().length > 0) &&
    formData.color.trim().length > 0

  const handleCreate = async () => {
    if (!isFormValid || isSubmitting) return
    setIsSubmitting(true)
    try {
      const accountName =
        needsAccount
          ? availableAccounts.find((a) => a.id === formData.account)?.name || null
          : null
      
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          account: accountName,
          color: formData.color,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Category berhasil dibuat')
        fetchCategories()
        setFormData({ name: '', type: '', account: '', color: 'FFFFFF' })
        setCreateDialogOpen(false)
      } else {
        toast.error(result.message || 'Gagal membuat category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategoryId(category.id)
    const matchedAccount = category.account
      ? chartAccounts.find((a) => a.name === category.account)
      : undefined
    setFormData({
      name: category.name,
      type: category.type,
      account: matchedAccount ? matchedAccount.id : '',
      color: category.color || 'FFFFFF',
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (editingCategoryId == null || !isFormValid || isSubmitting) return
    setIsSubmitting(true)
    try {
      const accountName =
        needsAccount
          ? availableAccounts.find((a) => a.id === formData.account)?.name || null
          : null
      
      const response = await fetch(`/api/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          account: accountName,
          color: formData.color,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Category diperbarui')
        fetchCategories()
        setEditDialogOpen(false)
        setEditingCategoryId(null)
        setFormData({ name: '', type: '', account: '', color: 'FFFFFF' })
      } else {
        toast.error(result.message || 'Gagal memperbarui category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (deletingCategoryId == null) return
    
    try {
      const response = await fetch(`/api/categories/${deletingCategoryId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Category berhasil dihapus')
        fetchCategories()
      } else {
        toast.error(result.message || 'Gagal menghapus category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setDeleteDialogOpen(false)
      setDeletingCategoryId(null)
    }
  }

  const confirmDelete = (id: string) => {
    setDeletingCategoryId(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Category</CardTitle>
            <CardDescription>Manage accounting categories.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create">
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name<span className="text-red-500">*</span></Label>
                <Input
                  id="category-name"
                  placeholder="Enter Category Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-type">Category Type<span className="text-red-500">*</span></Label>
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
                      <SelectValue placeholder={isAccountsLoading ? 'Loading accounts...' : 'Select Account'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAccounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.code} - {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="category-color">
                  Category Color <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-color"
                  placeholder="FFFFFF"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-muted-foreground">For chart representation</p>
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
        </CardHeader>
      </Card>

      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Categories</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => {
                    setSearch('')
                    setCurrentPage(1)
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6">Name</TableHead>
                  <TableHead className="px-6">Type</TableHead>
                  <TableHead className="px-6">Account</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((c) => (
                    <TableRow key={c.id} className="font-style">
                      <TableCell className="px-6">{c.name}</TableCell>
                      <TableCell className="px-6">{c.type}</TableCell>
                      <TableCell className="px-6">{c.account}</TableCell>
                      <TableCell className="px-6">
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
                            onClick={() => confirmDelete(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="px-6 text-center py-8 text-muted-foreground">
                      No categories found
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

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) {
            setEditingCategoryId(null)
            setFormData({ name: '', type: '', account: '', color: 'FFFFFF' })
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
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-category-name"
                placeholder="Enter Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-type">
                Category Type <span className="text-red-500">*</span>
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
                    <SelectValue placeholder={isAccountsLoading ? 'Loading accounts...' : 'Select Account'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-category-color">
                Category Color <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-category-color"
                placeholder="FFFFFF"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-muted-foreground">For chart representation</p>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are You Sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
