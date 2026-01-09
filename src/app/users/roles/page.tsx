"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
interface Role {
  id: string
  name: string
  permissions: string[]
}

// Mock data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: ['create user', 'edit user', 'delete user', 'create role', 'edit role'],
  },
  {
    id: '2',
    name: 'HR',
    permissions: ['create user', 'edit user', 'view user'],
  },
  {
    id: '3',
    name: 'Manager',
    permissions: ['view user', 'edit user'],
  },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
  })

  const allPermissions = [
    'create user',
    'edit user',
    'delete user',
    'view user',
    'create role',
    'edit role',
    'delete role',
    'view role',
    'create permission',
    'edit permission',
    'delete permission',
  ]

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditRole(null)
      setFormData({
        name: '',
        permissions: [],
      })
    }
  }

  const handleEdit = (role: Role) => {
    setEditRole(role)
    setFormData({
      name: role.name,
      permissions: role.permissions,
    })
    setDialogOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editRole) {
      // Handle update
      setRoles(
        roles.map((r) =>
          r.id === editRole.id
            ? { ...r, name: formData.name, permissions: formData.permissions }
            : r
        )
      )
    } else {
      // Handle create
      const newRole: Role = {
        id: String(roles.length + 1),
        name: formData.name,
        permissions: formData.permissions,
      }
      setRoles([...roles, newRole])
    }
    handleDialogOpenChange(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    setRoles(roles.filter((r) => r.id !== id))
  }

  const togglePermission = (permission: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permission)
        ? formData.permissions.filter((p) => p !== permission)
        : [...formData.permissions, permission],
    })
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
                <h1 className="text-2xl font-semibold">Manage Role</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage roles in your system
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button size="sm" className="shadow-none">
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
                    <DialogDescription>
                      {editRole
                        ? 'Update role information and permissions.'
                        : 'Add a new role to your system. Select permissions for this role.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Role Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter Role Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                          {allPermissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`permission-${permission}`}
                                checked={formData.permissions.includes(permission)}
                                onChange={() => togglePermission(permission)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label
                                htmlFor={`permission-${permission}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {permission}
                              </Label>
                            </div>
                          ))}
                        </div>
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
                      <Button type="submit">{editRole ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Roles Table */}
            <Card className="shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="w-[150px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map((permission) => (
                                <Badge key={permission} variant="default" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="shadow-none"
                                onClick={() => handleEdit(role)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {role.name !== 'Employee' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="shadow-none"
                                  onClick={() => handleDelete(role.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
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


