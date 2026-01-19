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

const mockUnits = [
  {
    id: 1,
    name: 'Piece',
  },
  {
    id: 2,
    name: 'Kilogram',
  },
  {
    id: 3,
    name: 'Liter',
  },
  {
    id: 4,
    name: 'Meter',
  },
  {
    id: 5,
    name: 'Box',
  },
  {
    id: 6,
    name: 'Pack',
  },
  {
    id: 7,
    name: 'Set',
  },
  {
    id: 8,
    name: 'Dozen',
  },
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

export default function UnitPage() {
  const pathname = usePathname()
  const [units, setUnits] = useState(mockUnits)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    name: '',
  })

  // Filter data
  const filteredData = useMemo(() => {
    if (!search.trim()) return units
    const q = search.trim().toLowerCase()
    return units.filter((unit) => unit.name.toLowerCase().includes(q))
  }, [units, search])

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
    const newUnit = {
      id: units.length + 1,
      name: formData.name,
    }
    setUnits([...units, newUnit])
    setFormData({ name: '' })
    setCreateDialogOpen(false)
  }

  const handleEdit = (unit: any) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    setUnits(
      units.map((u) =>
        u.id === editingUnit.id
          ? {
              ...u,
              name: formData.name,
            }
          : u
      )
    )
    setEditDialogOpen(false)
    setEditingUnit(null)
    setFormData({ name: '' })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setUnits(units.filter((u) => u.id !== id))
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
                        <DialogTitle>Create New Unit</DialogTitle>
                        <DialogDescription>
                          Add a new product or service unit.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="unit-name">
                            Unit Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="unit-name"
                            placeholder="Enter Unit Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
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
                        placeholder="Search units by name..."
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

                {/* Units Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.length > 0 ? (
                            paginatedData.map((unit) => (
                              <TableRow key={unit.id}>
                                <TableCell>{unit.name}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 justify-start">
                                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                                        title="Edit"
                                        onClick={() => handleEdit(unit)}
                                      >
                                        <IconPencil className="h-3 w-3" />
                                      </Button>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Edit Unit</DialogTitle>
                                          <DialogDescription>
                                            Update the unit details.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="space-y-2">
                                            <Label htmlFor="edit-unit-name">
                                              Unit Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                              id="edit-unit-name"
                                              placeholder="Enter Unit Name"
                                              value={formData.name}
                                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                              required
                                            />
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
                                      onClick={() => handleDelete(unit.id)}
                                    >
                                      <IconTrash className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                No units found
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
