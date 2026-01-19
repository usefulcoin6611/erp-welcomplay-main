'use client'

import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  IconPlus,
  IconPencil,
  IconTrash,
  IconChevronRight,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const mockCategories = [
  {
    id: 1,
    name: 'Product Category',
    type: 'Product & Service',
    account: '-',
  },
  {
    id: 2,
    name: 'Income Category',
    type: 'Income',
    account: 'Sales Revenue',
  },
  {
    id: 3,
    name: 'Expense Category',
    type: 'Expense',
    account: 'Operating Expenses',
  },
  {
    id: 4,
    name: 'Service Category',
    type: 'Product & Service',
    account: '-',
  },
  {
    id: 5,
    name: 'Revenue Category',
    type: 'Income',
    account: 'Service Revenue',
  },
  {
    id: 6,
    name: 'Cost Category',
    type: 'Expense',
    account: 'Cost of Goods Sold',
  },
]

const categoryTypes = [
  { value: 'Product & Service', label: 'Product & Service' },
  { value: 'Income', label: 'Income' },
  { value: 'Expense', label: 'Expense' },
]

const accounts = [
  { id: 1, name: 'Sales Revenue' },
  { id: 2, name: 'Operating Expenses' },
  { id: 3, name: 'Cost of Goods Sold' },
]

const sidebarItems = [
  {
    title: 'Taxes',
    url: '/accounting/setup',
    route: 'taxes.index',
  },
  {
    title: 'Category',
    url: '/accounting/setup/category',
    route: 'product-category.index',
  },
  {
    title: 'Unit',
    url: '/accounting/setup/unit',
    route: 'product-unit.index',
  },
  {
    title: 'Custom Field',
    url: '/accounting/setup/custom-field',
    route: 'custom-field.index',
  },
]

export default function CategoryPage() {
  const pathname = usePathname()
  const [categories, setCategories] = useState(mockCategories)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    account: '',
    color: '#000000',
  })

  // Filter data
  const filteredData = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.trim().toLowerCase()
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        category.type.toLowerCase().includes(q) ||
        category.account.toLowerCase().includes(q)
    )
  }, [categories, search])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const isActive = (url: string) => {
    if (url === '/accounting/setup') {
      return pathname === '/accounting/setup'
    }
    return pathname?.startsWith(url)
  }

  const handleCreate = () => {
    const newCategory = {
      id: categories.length + 1,
      name: formData.name,
      type: formData.type,
      account: formData.type === 'Product & Service' ? '-' : accounts.find(a => a.id.toString() === formData.account)?.name || '-',
    }
    setCategories([...categories, newCategory])
    setFormData({ name: '', type: '', account: '', color: '#000000' })
    setCreateDialogOpen(false)
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      account: category.account === '-' ? '' : accounts.find(a => a.name === category.account)?.id.toString() || '',
      color: '#000000',
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    setCategories(
      categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: formData.name,
              type: formData.type,
              account: formData.type === 'Product & Service' ? '-' : accounts.find(a => a.id.toString() === formData.account)?.name || '-',
            }
          : c
      )
    )
    setEditDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', type: '', account: '', color: '#000000' })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setCategories(categories.filter((c) => c.id !== id))
    }
  }

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
            <div className="grid gap-4 md:grid-cols-4">
              {/* Sidebar */}
              <div className="md:col-span-1">
                <Card className="sticky top-8">
                  <CardContent className="p-0">
                    <div className="list-group list-group-flush">
                      {sidebarItems.map((item) => (
                        <Link
                          key={item.url}
                          href={item.url}
                          className={cn(
                            'list-group-item list-group-item-action border-0 flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors',
                            isActive(item.url) && 'bg-accent font-semibold'
                          )}
                        >
                          <span>{item.title}</span>
                          <IconChevronRight className="h-4 w-4" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="md:col-span-3">
                {/* Header with Create Button */}
                <div className="flex items-center justify-end mb-4">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="blue" size="sm" className="shadow-none h-7">
                        <IconPlus className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                        <DialogDescription>
                          Add a new product-service or income-expense category.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-name">
                            Category Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="category-name"
                            placeholder="Enter Category Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category-type">
                            Category Type <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value, account: value === 'Product & Service' ? '' : formData.account })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {formData.type && formData.type !== 'Product & Service' && (
                          <div className="space-y-2">
                            <Label htmlFor="category-account">Account</Label>
                            <Select
                              value={formData.account}
                              onValueChange={(value) => setFormData({ ...formData, account: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Account" />
                              </SelectTrigger>
                              <SelectContent>
                                {accounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    {account.name}
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
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            required
                          />
                          <small className="text-muted-foreground">For chart representation</small>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="secondary"
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button variant="blue" onClick={handleCreate}>
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Search */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search categories by name, type, or account..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pl-10 pr-10"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('')
                            setCurrentPage(1)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                        >
                          <IconX className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Categories Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.length > 0 ? (
                            paginatedData.map((category) => (
                              <TableRow key={category.id} className="font-style">
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.type}</TableCell>
                                <TableCell>{category.account}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 justify-start">
                                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                                        title="Edit"
                                        onClick={() => handleEdit(category)}
                                      >
                                        <IconPencil className="h-3 w-3" />
                                      </Button>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Edit Category</DialogTitle>
                                          <DialogDescription>
                                            Update the category details.
                                          </DialogDescription>
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
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-category-type">
                                              Category Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                              value={formData.type}
                                              onValueChange={(value) => setFormData({ ...formData, type: value, account: value === 'Product & Service' ? '' : formData.account })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select Category Type" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {categoryTypes.map((type) => (
                                                  <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          {formData.type && formData.type !== 'Product & Service' && (
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-category-account">Account</Label>
                                              <Select
                                                value={formData.account}
                                                onValueChange={(value) => setFormData({ ...formData, account: value })}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select Account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {accounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id.toString()}>
                                                      {account.name}
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
                                              type="color"
                                              value={formData.color}
                                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                              required
                                            />
                                            <small className="text-muted-foreground">For chart representation</small>
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button
                                            variant="secondary"
                                            onClick={() => setEditDialogOpen(false)}
                                          >
                                            Cancel
                                          </Button>
                                          <Button variant="blue" onClick={handleUpdate}>
                                            Update
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="shadow-none h-7"
                                      title="Delete"
                                      onClick={() => handleDelete(category.id)}
                                    >
                                      <IconTrash className="h-3 w-3" />
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
                    <div className="mt-4 px-4 pb-4">
                      <SimplePagination
                        totalCount={totalRecords}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
