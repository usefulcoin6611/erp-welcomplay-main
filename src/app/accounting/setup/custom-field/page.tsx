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

const mockCustomFields = [
  {
    id: 1,
    name: 'Custom Field 1',
    type: 'Text',
    module: 'Invoice',
  },
  {
    id: 2,
    name: 'Custom Field 2',
    type: 'Number',
    module: 'Bill',
  },
  {
    id: 3,
    name: 'Custom Field 3',
    type: 'Date',
    module: 'Customer',
  },
  {
    id: 4,
    name: 'Custom Field 4',
    type: 'Select',
    module: 'Vendor',
  },
  {
    id: 5,
    name: 'Custom Field 5',
    type: 'Text',
    module: 'Product',
  },
  {
    id: 6,
    name: 'Custom Field 6',
    type: 'Number',
    module: 'Invoice',
  },
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

export default function CustomFieldPage() {
  const pathname = usePathname()
  const [customFields, setCustomFields] = useState(mockCustomFields)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingField, setEditingField] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    module: '',
  })

  // Filter data
  const filteredData = useMemo(() => {
    if (!search.trim()) return customFields
    const q = search.trim().toLowerCase()
    return customFields.filter(
      (field) =>
        field.name.toLowerCase().includes(q) ||
        field.type.toLowerCase().includes(q) ||
        field.module.toLowerCase().includes(q)
    )
  }, [customFields, search])

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
    const newField = {
      id: customFields.length + 1,
      name: formData.name,
      type: formData.type,
      module: formData.module,
    }
    setCustomFields([...customFields, newField])
    setFormData({ name: '', type: '', module: '' })
    setCreateDialogOpen(false)
  }

  const handleEdit = (field: any) => {
    setEditingField(field)
    setFormData({
      name: field.name,
      type: field.type,
      module: field.module,
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    setCustomFields(
      customFields.map((f) =>
        f.id === editingField.id
          ? {
              ...f,
              name: formData.name,
              type: formData.type,
              module: formData.module,
            }
          : f
      )
    )
    setEditDialogOpen(false)
    setEditingField(null)
    setFormData({ name: '', type: '', module: '' })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setCustomFields(customFields.filter((f) => f.id !== id))
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
                        <DialogTitle>Create New Custom Field</DialogTitle>
                        <DialogDescription>
                          Add a new custom field for your modules.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="field-name">
                            Custom Field Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="field-name"
                            placeholder="Enter Custom Field Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="field-type">
                            Type <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="field-module">
                            Module <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.module}
                            onValueChange={(value) => setFormData({ ...formData, module: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent>
                              {modules.map((module) => (
                                <SelectItem key={module.value} value={module.value}>
                                  {module.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                        placeholder="Search custom fields by name, type, or module..."
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

                {/* Custom Fields Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Custom Field</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.length > 0 ? (
                            paginatedData.map((field) => (
                              <TableRow key={field.id}>
                                <TableCell>{field.name}</TableCell>
                                <TableCell>{field.type}</TableCell>
                                <TableCell>{field.module}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 justify-start">
                                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                                        title="Edit"
                                        onClick={() => handleEdit(field)}
                                      >
                                        <IconPencil className="h-3 w-3" />
                                      </Button>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Edit Custom Field</DialogTitle>
                                          <DialogDescription>
                                            Update the custom field details.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-field-name">
                                              Custom Field Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              id="edit-field-name"
                                              placeholder="Enter Custom Field Name"
                                              value={formData.name}
                                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                              required
                                            />
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-field-type">
                                              Type <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                              value={formData.type}
                                              onValueChange={(value) => setFormData({ ...formData, type: value })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {fieldTypes.map((type) => (
                                                  <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-field-module">
                                              Module <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                              value={formData.module}
                                              onValueChange={(value) => setFormData({ ...formData, module: value })}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select Module" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {modules.map((module) => (
                                                  <SelectItem key={module.value} value={module.value}>
                                                    {module.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
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
                                      onClick={() => handleDelete(field.id)}
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
                                No custom fields found
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
