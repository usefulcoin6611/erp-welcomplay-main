'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'

type Tax = {
  id: number
  name: string
  rate: number
}

const mockTaxes: Tax[] = [
  { id: 1, name: 'VAT', rate: 11 },
  { id: 2, name: 'Income Tax', rate: 2.5 },
  { id: 3, name: 'Sales Tax', rate: 10 },
  { id: 4, name: 'Service Tax', rate: 5 },
]

export function TaxesTab() {
  const [taxes, setTaxes] = useState<Tax[]>(mockTaxes)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTaxId, setEditingTaxId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({ name: '', rate: '' })

  const filteredData = useMemo(() => {
    if (!search.trim()) return taxes
    const q = search.trim().toLowerCase()
    return taxes.filter((tax) => tax.name.toLowerCase().includes(q) || tax.rate.toString().includes(q))
  }, [taxes, search])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const isFormValid = formData.name.trim().length > 0 && formData.rate.trim().length > 0

  const handleCreate = () => {
    if (!isFormValid) return
    const newTax: Tax = {
      id: taxes.length + 1,
      name: formData.name.trim(),
      rate: parseFloat(formData.rate),
    }
    setTaxes([...taxes, newTax])
    setFormData({ name: '', rate: '' })
    setCreateDialogOpen(false)
  }

  const startEdit = (tax: Tax) => {
    setEditingTaxId(tax.id)
    setFormData({ name: tax.name, rate: String(tax.rate) })
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (editingTaxId == null) return
    if (!isFormValid) return
    setTaxes(
      taxes.map((t) =>
        t.id === editingTaxId
          ? { ...t, name: formData.name.trim(), rate: parseFloat(formData.rate) }
          : t,
      ),
    )
    setEditDialogOpen(false)
    setEditingTaxId(null)
    setFormData({ name: '', rate: '' })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setTaxes(taxes.filter((t) => t.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Taxes</CardTitle>
            <CardDescription>Manage tax rates for transactions.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create">
                <Plus className="mr-2 h-4 w-4" />
                Create Tax Rate
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tax Rate</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-name">
                    Tax Rate Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tax-name"
                    placeholder="Enter Tax Rate Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">
                    Tax Rate % <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    placeholder="Enter Rate"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  />
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
        </CardHeader>
      </Card>

      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Taxes</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search taxes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
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
                  <TableHead className="px-6">Tax Name</TableHead>
                  <TableHead className="px-6">Rate %</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((tax) => (
                    <TableRow key={tax.id} className="font-style">
                      <TableCell className="px-6">{tax.name}</TableCell>
                      <TableCell className="px-6">{tax.rate}</TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => startEdit(tax)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDelete(tax.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="px-6 text-center py-8 text-muted-foreground">
                      No taxes found
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
            setEditingTaxId(null)
            setFormData({ name: '', rate: '' })
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tax Rate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tax-name">
                  Tax Rate Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-tax-name"
                  placeholder="Enter Tax Rate Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tax-rate">
                  Tax Rate % <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-tax-rate"
                  type="number"
                  step="0.01"
                  placeholder="Enter Rate"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                />
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


