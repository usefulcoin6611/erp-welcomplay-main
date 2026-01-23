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
import { Checkbox } from '@/components/ui/checkbox'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface Permission {
  id: string
  name: string
  module: string
  category: 'staff' | 'crm' | 'project' | 'hrm' | 'account' | 'pos'
}

// Mock permissions data based on reference Laravel
const staffModules = [
  'user', 'role', 'client', 'product & service', 'constant unit', 'constant tax', 
  'constant category', 'zoom meeting', 'company settings', 'permission'
]

const crmModules = [
  'crm dashboard', 'lead', 'convert', 'pipeline', 'lead stage', 'source', 
  'label', 'lead email', 'lead call', 'deal', 'stage', 'task', 'form builder', 
  'form response', 'form field', 'contract', 'contract type'
]

const projectModules = [
  'project dashboard', 'project', 'project stage', 'project milestone', 
  'project task', 'project bug', 'project timesheet', 'project expense', 
  'project file', 'project comment', 'project activity', 'project note'
]

const hrmModules = [
  'hrm dashboard', 'employee', 'set salary', 'payslip', 'leave', 'attendance', 
  'performance', 'training', 'recruitment', 'job', 'job application', 
  'job board', 'custom question', 'interview schedule', 'career', 'event', 
  'meeting', 'assets', 'document', 'company policy', 'branch', 'department', 
  'designation', 'leave type', 'document type', 'payslip type', 'allowance option', 
  'loan option', 'deduction option', 'goal type', 'training type', 'award type', 
  'termination type', 'job category', 'job stage', 'performance type', 'competencies'
]

const accountModules = [
  'account dashboard', 'banking', 'account', 'transfer', 'sales', 'customer', 
  'estimate', 'invoice', 'revenue', 'credit note', 'purchases', 'supplier', 
  'bill', 'expense', 'payment', 'debit note', 'double entry', 'chart of account', 
  'journal entry', 'ledger', 'balance sheet', 'profit & loss', 'trial balance', 
  'budget planner', 'financial goal', 'accounting setup'
]

const posModules = [
  'pos dashboard', 'product & services', 'product category', 'product coupon', 
  'brand', 'unit', 'variant', 'purchase', 'purchase return', 'warehouse', 
  'warehouse transfer', 'pos', 'pos return', 'reports'
]

const permissionTypes = ['view', 'add', 'move', 'manage', 'create', 'edit', 'delete', 'show']

// Generate permissions for a module
const generatePermissions = (modules: string[], category: Permission['category']): Permission[] => {
  const permissions: Permission[] = []
  modules.forEach((module) => {
    permissionTypes.forEach((type) => {
      permissions.push({
        id: `${category}-${module}-${type}`,
        name: `${type} ${module}`,
        module,
        category,
      })
    })
  })
  return permissions
}

const allPermissions: Permission[] = [
  ...generatePermissions(staffModules, 'staff'),
  ...generatePermissions(crmModules, 'crm'),
  ...generatePermissions(projectModules, 'project'),
  ...generatePermissions(hrmModules, 'hrm'),
  ...generatePermissions(accountModules, 'account'),
  ...generatePermissions(posModules, 'pos'),
]

// Mock data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: ['view user', 'create user', 'edit user', 'delete user'],
  },
  {
    id: '2',
    name: 'HR',
    permissions: ['view user', 'create user', 'edit user'],
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
  const [selectedCategory, setSelectedCategory] = useState<'staff' | 'crm' | 'project' | 'hrm' | 'account' | 'pos'>('staff')

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditRole(null)
      setFormData({
        name: '',
        permissions: [],
      })
      setSelectedCategory('staff')
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

  const togglePermission = (permissionId: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permissionId)
        ? formData.permissions.filter((p) => p !== permissionId)
        : [...formData.permissions, permissionId],
    })
  }

  const toggleModulePermissions = (module: string, category: Permission['category']) => {
    const modulePermissions = allPermissions.filter(
      (p) => p.module === module && p.category === category
    )
    const allSelected = modulePermissions.every((p) => formData.permissions.includes(p.id))
    
    if (allSelected) {
      // Deselect all
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(
          (p) => !modulePermissions.some((mp) => mp.id === p)
        ),
      })
    } else {
      // Select all
      const newPermissions = [...formData.permissions]
      modulePermissions.forEach((p) => {
        if (!newPermissions.includes(p.id)) {
          newPermissions.push(p.id)
        }
      })
      setFormData({
        ...formData,
        permissions: newPermissions,
      })
    }
  }

  const toggleCategoryPermissions = (category: Permission['category']) => {
    const categoryPermissions = allPermissions.filter((p) => p.category === category)
    const allSelected = categoryPermissions.every((p) => formData.permissions.includes(p.id))
    
    if (allSelected) {
      // Deselect all
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(
          (p) => !categoryPermissions.some((cp) => cp.id === p)
        ),
      })
    } else {
      // Select all
      const newPermissions = [...formData.permissions]
      categoryPermissions.forEach((p) => {
        if (!newPermissions.includes(p.id)) {
          newPermissions.push(p.id)
        }
      })
      setFormData({
        ...formData,
        permissions: newPermissions,
      })
    }
  }

  const getCategoryModules = (category: Permission['category']) => {
    switch (category) {
      case 'staff':
        return staffModules
      case 'crm':
        return crmModules
      case 'project':
        return projectModules
      case 'hrm':
        return hrmModules
      case 'account':
        return accountModules
      case 'pos':
        return posModules
    }
  }

  const getCategoryPermissions = (category: Permission['category']) => {
    return allPermissions.filter((p) => p.category === category)
  }

  const renderPermissionTable = (category: Permission['category'], modules: string[]) => {
    const categoryPermissions = getCategoryPermissions(category)
    const allCategorySelected = categoryPermissions.every((p) => formData.permissions.includes(p.id))

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h6 className="text-sm font-semibold">
            {category === 'staff' && 'Assign General Permission to Roles'}
            {category === 'crm' && 'Assign CRM related Permission to Roles'}
            {category === 'project' && 'Assign Project related Permission to Roles'}
            {category === 'hrm' && 'Assign HRM related Permission to Roles'}
            {category === 'account' && 'Assign Account related Permission to Roles'}
            {category === 'pos' && 'Assign POS related Permission to Roles'}
          </h6>
        </div>
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allCategorySelected}
                      onCheckedChange={() => toggleCategoryPermissions(category)}
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Module</TableHead>
                  <TableHead className="min-w-[600px]">Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => {
                  const modulePermissions = categoryPermissions.filter((p) => p.module === module)
                  const allModuleSelected = modulePermissions.every((p) => formData.permissions.includes(p.id))

                  return (
                    <TableRow key={module}>
                      <TableCell>
                        <Checkbox
                          checked={allModuleSelected}
                          onCheckedChange={() => toggleModulePermissions(module, category)}
                        />
                      </TableCell>
                      <TableCell className="font-medium capitalize">{module}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {modulePermissions.map((permission) => {
                            const permissionName = permission.name.split(' ')[0] // Get first word (view, create, etc)
                            return (
                              <div key={permission.id} className="flex items-center space-x-1">
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <Label
                                  htmlFor={permission.id}
                                  className="text-xs font-normal cursor-pointer capitalize"
                                >
                                  {permissionName}
                                </Label>
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
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
                  <Button size="sm" variant="blue" className="shadow-none">
                    <Plus className="mr-2 h-4 w-4" /> Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="!max-w-[70vw] w-[70vw] max-h-[95vh] overflow-y-auto">
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
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter Role Name"
                          required
                        />
                      </div>
                      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
                        <TabsList className="grid w-full grid-cols-6">
                          <TabsTrigger value="staff">Staff</TabsTrigger>
                          <TabsTrigger value="crm">CRM</TabsTrigger>
                          <TabsTrigger value="project">Project</TabsTrigger>
                          <TabsTrigger value="hrm">HRM</TabsTrigger>
                          <TabsTrigger value="account">Account</TabsTrigger>
                          <TabsTrigger value="pos">POS</TabsTrigger>
                        </TabsList>
                        <TabsContent value="staff" className="mt-4">
                          {renderPermissionTable('staff', staffModules)}
                        </TabsContent>
                        <TabsContent value="crm" className="mt-4">
                          {renderPermissionTable('crm', crmModules)}
                        </TabsContent>
                        <TabsContent value="project" className="mt-4">
                          {renderPermissionTable('project', projectModules)}
                        </TabsContent>
                        <TabsContent value="hrm" className="mt-4">
                          {renderPermissionTable('hrm', hrmModules)}
                        </TabsContent>
                        <TabsContent value="account" className="mt-4">
                          {renderPermissionTable('account', accountModules)}
                        </TabsContent>
                        <TabsContent value="pos" className="mt-4">
                          {renderPermissionTable('pos', posModules)}
                        </TabsContent>
                      </Tabs>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="blue">{editRole ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Roles Table */}
            <Card>
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
                                <Badge key={permission} className="text-xs bg-blue-100 text-blue-700">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="blue"
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

