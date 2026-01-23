"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Types
interface Permission {
  id: string
  name: string
}

// Mock data
const mockPermissions: Permission[] = [
  { id: '1', name: 'create user' },
  { id: '2', name: 'edit user' },
  { id: '3', name: 'delete user' },
  { id: '4', name: 'view user' },
  { id: '5', name: 'create role' },
  { id: '6', name: 'edit role' },
  { id: '7', name: 'delete role' },
  { id: '8', name: 'view role' },
]

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPermission, setEditPermission] = useState<Permission | null>(null)
  const [formData, setFormData] = useState({
    name: '',
  })

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditPermission(null)
      setFormData({
        name: '',
      })
    }
  }

  const handleEdit = (permission: Permission) => {
    setEditPermission(permission)
    setFormData({
      name: permission.name,
    })
    setDialogOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editPermission) {
      // Handle update
      setPermissions(
        permissions.map((p) =>
          p.id === editPermission.id ? { ...p, name: formData.name } : p
        )
      )
    } else {
      // Handle create
      const newPermission: Permission = {
        id: String(permissions.length + 1),
        name: formData.name,
      }
      setPermissions([...permissions, newPermission])
    }
    handleDialogOpenChange(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return
    setPermissions(permissions.filter((p) => p.id !== id))
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Manage Permissions</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage permissions in your system
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="blue" className="shadow-none">
                    <Plus className="mr-2 h-4 w-4" /> Create
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editPermission ? 'Update Permission' : 'Create New Permission'}
                    </DialogTitle>
                    <DialogDescription>
                      {editPermission
                        ? 'Update the permission name.'
                        : 'Add a new permission to your system.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Permission Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter Permission Name"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="blue">{editPermission ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Permissions Table */}
            <Card className="shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="w-[200px] text-end">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>{permission.name}</TableCell>
                          <TableCell className="text-end">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="blue"
                                size="sm"
                                className="shadow-none"
                                onClick={() => handleEdit(permission)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="shadow-none"
                                onClick={() => handleDelete(permission.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}



