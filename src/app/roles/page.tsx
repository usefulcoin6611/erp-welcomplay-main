"use client"

import { useEffect, useRef, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Pencil, Trash } from 'lucide-react'
import { REFERENCE_PERMISSIONS } from '@/lib/reference-permissions'
import { useAuth } from '@/contexts/auth-context'
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

const ACTIONS = [
  'view',
  'add',
  'move',
  'manage',
  'create',
  'edit',
  'delete',
  'show',
  'send',
  'create payment',
  'delete payment',
  'income',
  'expense',
  'income vs expense',
  'loss & profit',
  'tax',
  'invoice',
  'bill',
  'duplicate',
  'balance sheet',
  'ledger',
  'trial balance',
  'convert',
  'copy',
]

const STAFF_MODULES_BASE = [
  'user',
  'role',
  'client',
  'product & service',
  'constant unit',
  'constant tax',
  'constant category',
  'zoom meeting',
  'company settings',
  'permission',
  'language',
]

const CRM_MODULES = [
  'crm dashboard',
  'lead',
  'convert',
  'pipeline',
  'lead stage',
  'source',
  'label',
  'lead email',
  'lead call',
  'deal',
  'stage',
  'task',
  'form builder',
  'form response',
  'form field',
  'contract',
  'contract type',
]

const PROJECT_MODULES = [
  'project dashboard',
  'project',
  'milestone',
  'grant chart',
  'project stage',
  'timesheet',
  'project expense',
  'project task',
  'activity',
  'CRM activity',
  'project task stage',
  'bug report',
  'bug status',
]

const HRM_MODULES = [
  'hrm dashboard',
  'employee',
  'employee profile',
  'department',
  'designation',
  'branch',
  'document type',
  'document',
  'payslip type',
  'allowance',
  'commission',
  'allowance option',
  'loan option',
  'deduction option',
  'loan',
  'saturation deduction',
  'other payment',
  'overtime',
  'set salary',
  'pay slip',
  'company policy',
  'appraisal',
  'goal tracking',
  'goal type',
  'indicator',
  'event',
  'meeting',
  'training',
  'trainer',
  'training type',
  'award',
  'award type',
  'resignation',
  'travel',
  'promotion',
  'complaint',
  'warning',
  'termination',
  'termination type',
  'job application',
  'job application note',
  'job onBoard',
  'job category',
  'job',
  'job stage',
  'custom question',
  'interview schedule',
  'career',
  'estimation',
  'holiday',
  'transfer',
  'announcement',
  'leave',
  'leave type',
  'attendance',
]

const ACCOUNT_MODULES = [
  'account dashboard',
  'proposal',
  'invoice',
  'bill',
  'revenue',
  'payment',
  'proposal product',
  'invoice product',
  'bill product',
  'goal',
  'credit note',
  'debit note',
  'bank account',
  'bank transfer',
  'transaction',
  'customer',
  'vender',
  'constant custom field',
  'assets',
  'chart of account',
  'journal entry',
  'report',
]

const POS_MODULES = [
  'pos dashboard',
  'warehouse',
  'quotation',
  'purchase',
  'pos',
  'barcode',
]

const getStaffModules = (isCompany: boolean, isEdit: boolean) => {
  const baseModules = [
    'user',
    'role',
    'client',
    'product & service',
    'constant unit',
    'constant tax',
    'constant category',
    'zoom meeting',
    'company settings',
  ]
  if (!isCompany) return baseModules
  const modules = [...baseModules, 'permission']
  if (isEdit) modules.push('language')
  return modules
}

type PermissionItem = Permission & {
  action: string
  moduleLabel: string
}

const referencePermissionLookup = new Map(
  REFERENCE_PERMISSIONS.map((permission) => [permission.toLowerCase(), permission])
)

const buildPermissionsForModules = (modules: string[], category: Permission['category']) => {
  const permissions: PermissionItem[] = []
  modules.forEach((moduleLabel) => {
    ACTIONS.forEach((action) => {
      const rawPermission = `${action} ${moduleLabel}`
      const matchedPermission = referencePermissionLookup.get(rawPermission.toLowerCase())
      if (!matchedPermission) return
      permissions.push({
        id: matchedPermission,
        name: matchedPermission,
        module: moduleLabel,
        moduleLabel,
        category,
        action,
      })
    })
  })
  return permissions
}

const allPermissions: PermissionItem[] = [
  ...buildPermissionsForModules(STAFF_MODULES_BASE, 'staff'),
  ...buildPermissionsForModules(CRM_MODULES, 'crm'),
  ...buildPermissionsForModules(PROJECT_MODULES, 'project'),
  ...buildPermissionsForModules(HRM_MODULES, 'hrm'),
  ...buildPermissionsForModules(ACCOUNT_MODULES, 'account'),
  ...buildPermissionsForModules(POS_MODULES, 'pos'),
]

const permissionById = new Map(allPermissions.map((permission) => [permission.id, permission]))

const normalizePermissions = (permissions: string[]) =>
  Array.from(new Set(permissions.filter((permissionId) => permissionById.has(permissionId))))

const actionOrder = ACTIONS

const sortPermissionsByAction = (permissions: PermissionItem[]) =>
  [...permissions].sort((a, b) => {
    const idxA = actionOrder.indexOf(a.action)
    const idxB = actionOrder.indexOf(b.action)
    if (idxA === idxB) return a.action.localeCompare(b.action)
    if (idxA === -1) return 1
    if (idxB === -1) return -1
    return idxA - idxB
  })

const formatActionLabel = (action: string) => {
  if (action === 'income vs expense') return 'Income VS Expense'
  if (action === 'loss & profit') return 'Loss & Profit'
  if (action === 'create payment') return 'Create Payment'
  if (action === 'delete payment') return 'Delete Payment'
  if (action === 'balance sheet') return 'Balance Sheet'
  if (action === 'trial balance') return 'Trial Balance'
  return action
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    permissions: ['manage user', 'create user', 'edit user', 'delete user'],
  },
  {
    id: '2',
    name: 'HR',
    permissions: ['manage employee', 'view employee', 'edit employee'],
  },
  {
    id: '3',
    name: 'Manager',
    permissions: ['view project', 'edit project', 'view employee'],
  },
]

export default function RolesPage() {
  const { user } = useAuth()
  const isCompany = user?.type === 'company'
  const [roles, setRoles] = useState<Role[]>(
    mockRoles.map((role) => ({
      ...role,
      permissions: normalizePermissions(role.permissions),
    }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
  })
  const [selectedCategory, setSelectedCategory] = useState<'staff' | 'crm' | 'project' | 'hrm' | 'account' | 'pos'>('staff')
  const permissionsScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (permissionsScrollRef.current) {
      permissionsScrollRef.current.scrollTop = 0
    }
  }, [selectedCategory])

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
    const nextCategory =
      role.permissions
        .map((permissionId) => permissionById.get(permissionId)?.category)
        .find((category): category is Permission['category'] => Boolean(category)) ?? 'staff'
    setEditRole(role)
    setFormData({
      name: role.name,
      permissions: role.permissions,
    })
    setSelectedCategory(nextCategory)
    setDialogOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editRole) {
      setRoles(
        roles.map((r) =>
          r.id === editRole.id
            ? { ...r, name: formData.name, permissions: formData.permissions }
            : r
        )
      )
    } else {
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

  const toggleModulePermissions = (moduleLabel: string, category: Permission['category']) => {
    const modulePermissions = allPermissions.filter(
      (p) => p.module === moduleLabel && p.category === category
    )
    if (modulePermissions.length === 0) return
    const allSelected = modulePermissions.every((p) => formData.permissions.includes(p.id))

    if (allSelected) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(
          (p) => !modulePermissions.some((mp) => mp.id === p)
        ),
      })
    } else {
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
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(
          (p) => !categoryPermissions.some((cp) => cp.id === p)
        ),
      })
    } else {
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

  const getCategoryPermissions = (category: Permission['category']) =>
    allPermissions.filter((p) => p.category === category)

  const renderPermissionTable = (category: Permission['category'], modules: string[]) => {
    const categoryPermissions = getCategoryPermissions(category)
    const allCategorySelected =
      categoryPermissions.length > 0 && categoryPermissions.every((p) => formData.permissions.includes(p.id))

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
          <div className="overflow-visible">
            <Table containerClassName="overflow-visible">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allCategorySelected}
                      onCheckedChange={() => toggleCategoryPermissions(category)}
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                  </TableHead>
                  <TableHead className="min-w-[200px]">Module</TableHead>
                  <TableHead className="min-w-[600px]">Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((moduleLabel) => {
                  const modulePermissions = sortPermissionsByAction(
                    categoryPermissions.filter((p) => p.module === moduleLabel)
                  )
                  const allModuleSelected =
                    modulePermissions.length > 0 &&
                    modulePermissions.every((p) => formData.permissions.includes(p.id))

                  return (
                    <TableRow key={moduleLabel}>
                      <TableCell>
                        <Checkbox
                          checked={allModuleSelected}
                          onCheckedChange={() => toggleModulePermissions(moduleLabel, category)}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{moduleLabel}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {modulePermissions.map((permission) => {
                                const permissionName = formatActionLabel(permission.action)
                                return (
                                  <div key={permission.id} className="flex items-center gap-2 border rounded-md px-2 py-1">
                                    <Checkbox
                                      id={permission.id}
                                      checked={formData.permissions.includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                    />
                                    <Label
                                      htmlFor={permission.id}
                                      className="text-xs font-normal cursor-pointer"
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Manage Role</CardTitle>
                  <CardDescription>
                    Create and manage roles in your system. Assign permissions to control access to modules and features.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant="blue" size="sm" className="shadow-none h-7 w-7 p-0" title="Create Role">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!max-w-[85vw] w-[85vw] h-[90vh] max-h-[95vh] overflow-hidden p-0 flex flex-col">
                      <div className="border-b px-6 py-4">
                        <DialogHeader>
                          <DialogTitle>{editRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
                        </DialogHeader>
                      </div>
                      <form onSubmit={handleCreateSubmit} className="flex flex-1 flex-col overflow-hidden px-6 pb-5">
                        <div ref={permissionsScrollRef} className="grid flex-1 gap-4 overflow-y-auto content-start">
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
                              {renderPermissionTable('staff', getStaffModules(isCompany, Boolean(editRole)))}
                            </TabsContent>
                            <TabsContent value="crm" className="mt-4">
                              {renderPermissionTable('crm', CRM_MODULES)}
                            </TabsContent>
                            <TabsContent value="project" className="mt-4">
                              {renderPermissionTable('project', PROJECT_MODULES)}
                            </TabsContent>
                            <TabsContent value="hrm" className="mt-4">
                              {renderPermissionTable('hrm', HRM_MODULES)}
                            </TabsContent>
                            <TabsContent value="account" className="mt-4">
                              {renderPermissionTable('account', ACCOUNT_MODULES)}
                            </TabsContent>
                            <TabsContent value="pos" className="mt-4">
                              {renderPermissionTable('pos', POS_MODULES)}
                            </TabsContent>
                          </Tabs>
                        </div>
                        <DialogFooter className="pt-4">
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
              </CardHeader>
            </Card>

            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Role</TableHead>
                        <TableHead className="px-6">Permissions</TableHead>
                        <TableHead className="px-6 w-[150px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="px-6 font-medium">{role.name}</TableCell>
                          <TableCell className="px-6">
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map((permissionId) => (
                                <Badge key={permissionId} className="text-xs bg-blue-100 text-blue-700 border-blue-100">
                                  {permissionById.get(permissionId)?.name ?? permissionId}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                                onClick={() => handleEdit(role)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              {role.name !== 'Employee' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  onClick={() => handleDelete(role.id)}
                                >
                                  <Trash className="h-3 w-3" />
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
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
