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

type Unit = {
  id: number
  name: string
}

const mockUnits: Unit[] = [
  { id: 1, name: 'Piece' },
  { id: 2, name: 'Kilogram' },
  { id: 3, name: 'Liter' },
  { id: 4, name: 'Meter' },
]

export function UnitTab() {
  const [units, setUnits] = useState<Unit[]>(mockUnits)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [name, setName] = useState('')

  const filteredData = useMemo(() => {
    if (!search.trim()) return units
    const q = search.trim().toLowerCase()
    return units.filter((u) => u.name.toLowerCase().includes(q))
  }, [units, search])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length
  const isFormValid = name.trim().length > 0

  const handleCreate = () => {
    if (!isFormValid) return
    const newUnit: Unit = { id: units.length + 1, name: name.trim() }
    setUnits([...units, newUnit])
    setName('')
    setCreateDialogOpen(false)
  }

  const startEdit = (unit: Unit) => {
    setEditingUnitId(unit.id)
    setName(unit.name)
    setEditDialogOpen(true)
  }

  const handleUpdate = () => {
    if (editingUnitId == null) return
    if (!isFormValid) return
    setUnits(units.map((u) => (u.id === editingUnitId ? { ...u, name: name.trim() } : u)))
    setEditDialogOpen(false)
    setEditingUnitId(null)
    setName('')
  }

  const handleDelete = (id: number) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setUnits(units.filter((u) => u.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Unit</CardTitle>
            <CardDescription>Manage units for products and services.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title="Create">
                <Plus className="mr-2 h-4 w-4" />
                Create Unit
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Unit</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="unit-name">
                  Unit Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unit-name"
                  placeholder="Enter Unit Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
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
          <CardTitle>Units</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search units..."
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
                  <TableHead className="px-6">Unit Name</TableHead>
                  <TableHead className="px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((unit) => (
                    <TableRow key={unit.id} className="font-style">
                      <TableCell className="px-6">{unit.name}</TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                            title="Edit"
                            onClick={() => startEdit(unit)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
                            onClick={() => handleDelete(unit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="px-6 text-center py-8 text-muted-foreground">
                      No units found
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
            setEditingUnitId(null)
            setName('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Unit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-unit-name">
                Unit Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-unit-name"
                placeholder="Enter Unit Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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


