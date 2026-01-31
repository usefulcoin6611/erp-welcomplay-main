'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Activity,
  Plus,
  RefreshCw,
  Search,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'

type ChartAccount = {
  id: number
  code: string
  name: string
  subType: string
  parentAccountName: string
  balance: number
  isEnabled: boolean
}

const accountTypeOptions: { group: string; items: string[] }[] = [
  { group: 'Assets', items: ['Current Assets', 'Fixed Assets'] },
  { group: 'Liabilities', items: ['Current Liabilities', 'Long Term Liabilities'] },
  { group: 'Equity', items: ['Equity'] },
  { group: 'Income', items: ['Income'] },
  { group: 'Expenses', items: ['Expenses'] },
  { group: 'Costs of Goods Sold', items: ['Costs of Goods Sold'] },
]

const chartAccountsByType: { type: string; accounts: ChartAccount[] }[] = [
  {
    type: 'Assets',
    accounts: [
      {
        id: 1,
        code: '1000',
        name: 'Cash & Bank',
        subType: 'Current Assets',
        parentAccountName: '-',
        balance: 250_000_000,
        isEnabled: true,
      },
      {
        id: 2,
        code: '1100',
        name: 'Accounts Receivable',
        subType: 'Current Assets',
        parentAccountName: 'Cash & Bank',
        balance: 125_000_000,
        isEnabled: true,
      },
      {
        id: 3,
        code: '1200',
        name: 'Inventory',
        subType: 'Current Assets',
        parentAccountName: 'Cash & Bank',
        balance: 80_000_000,
        isEnabled: true,
      },
    ],
  },
  {
    type: 'Liabilities',
    accounts: [
      {
        id: 4,
        code: '2000',
        name: 'Accounts Payable',
        subType: 'Current Liabilities',
        parentAccountName: '-',
        balance: 75_000_000,
        isEnabled: true,
      },
      {
        id: 5,
        code: '2100',
        name: 'Taxes Payable',
        subType: 'Current Liabilities',
        parentAccountName: 'Accounts Payable',
        balance: 20_000_000,
        isEnabled: false,
      },
    ],
  },
  {
    type: 'Equity',
    accounts: [
      {
        id: 6,
        code: '3000',
        name: 'Owner Equity',
        subType: 'Equity',
        parentAccountName: '-',
        balance: 250_000_000,
        isEnabled: true,
      },
    ],
  },
  {
    type: 'Income',
    accounts: [
      {
        id: 7,
        code: '4000',
        name: 'Sales Revenue',
        subType: 'Income',
        parentAccountName: '-',
        balance: 420_000_000,
        isEnabled: true,
      },
      {
        id: 8,
        code: '4100',
        name: 'Service Revenue',
        subType: 'Income',
        parentAccountName: 'Sales Revenue',
        balance: 80_000_000,
        isEnabled: true,
      },
    ],
  },
  {
    type: 'Costs of Goods Sold',
    accounts: [
      {
        id: 9,
        code: '5000',
        name: 'Cost of Goods Sold',
        subType: 'Costs of Goods Sold',
        parentAccountName: '-',
        balance: 220_000_000,
        isEnabled: true,
      },
    ],
  },
  {
    type: 'Expenses',
    accounts: [
      {
        id: 10,
        code: '6000',
        name: 'Operating Expenses',
        subType: 'Expenses',
        parentAccountName: '-',
        balance: 90_000_000,
        isEnabled: true,
      },
      {
        id: 11,
        code: '6100',
        name: 'Marketing Expenses',
        subType: 'Expenses',
        parentAccountName: 'Operating Expenses',
        balance: 25_000_000,
        isEnabled: true,
      },
    ],
  },
]

function getEnabledBadge(isEnabled: boolean) {
  if (isEnabled) {
    return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Enabled</Badge>
  }
  return <Badge className="bg-red-100 text-red-700 border-red-200">Disabled</Badge>
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ChartOfAccountTab() {
  const [groups, setGroups] = useState(() => chartAccountsByType)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<{ id: number; groupType: string } | null>(null)
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')
  const [search, setSearch] = useState('')

  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    subType: '',
    isEnabled: true,
    makeSubAccount: false,
    parent: '',
    description: '',
  })

  const allAccounts = useMemo(
    () => groups.flatMap((g) => g.accounts),
    [groups],
  )

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups
    const q = search.trim().toLowerCase()
    return groups
      .map((g) => ({
        ...g,
        accounts: g.accounts.filter((a) => {
          const hay = [
            a.code,
            a.name,
            a.subType,
            a.parentAccountName ?? '',
          ]
            .join(' ')
            .toLowerCase()
          return hay.includes(q)
        }),
      }))
      .filter((g) => g.accounts.length > 0)
  }, [groups, search])

  const parentAccountsForSelectedType = useMemo(() => {
    if (!createForm.subType) return []
    return allAccounts.filter((a) => a.subType === createForm.subType && a.id !== editingId)
  }, [allAccounts, createForm.subType, editingId])

  const dialogTitle = editingId ? 'Edit Account' : 'Create New Account'

  const resetForm = () => {
    setEditingId(null)
    setCreateForm({
      name: '',
      code: '',
      subType: '',
      isEnabled: true,
      makeSubAccount: false,
      parent: '',
      description: '',
    })
  }

  const handleDialogOpenChange = (open: boolean) => {
    setCreateDialogOpen(open)
    if (!open) resetForm()
  }

  const groupTypeFromSubType = (subType: string) =>
    accountTypeOptions.find((g) => g.items.includes(subType))?.group ?? 'Other'

  const handleEdit = (account: ChartAccount) => {
    setEditingId(account.id)
    const parent = allAccounts.find((a) => a.name === account.parentAccountName)
    setCreateForm({
      name: account.name,
      code: account.code,
      subType: account.subType,
      isEnabled: account.isEnabled,
      makeSubAccount: Boolean(account.parentAccountName && account.parentAccountName !== '-'),
      parent: parent ? String(parent.id) : '',
      description: '',
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (account: ChartAccount, groupType: string) => {
    setAccountToDelete({ id: account.id, groupType })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!accountToDelete) return
    setGroups((prev) =>
      prev.map((g) =>
        g.type !== accountToDelete.groupType
          ? g
          : { ...g, accounts: g.accounts.filter((a) => a.id !== accountToDelete.id) },
      ),
    )
    setAccountToDelete(null)
    setDeleteDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Title Tab */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Chart of Accounts</CardTitle>
            <CardDescription>Manage accounts and organize your financial structure.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={createDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="blue"
                size="sm"
                className="shadow-none h-7 px-4"
                title="Create"
                onClick={() => setEditingId(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const groupType = groupTypeFromSubType(createForm.subType)
                const parentName = createForm.makeSubAccount
                  ? (allAccounts.find((a) => String(a.id) === createForm.parent)?.name ?? '-')
                  : '-'

                if (editingId) {
                  setGroups((prev) =>
                    prev.map((g) => ({
                      ...g,
                      accounts: g.accounts.map((a) =>
                        a.id === editingId
                          ? {
                              ...a,
                              code: createForm.code,
                              name: createForm.name,
                              subType: createForm.subType,
                              isEnabled: createForm.isEnabled,
                              parentAccountName: parentName,
                            }
                          : a,
                      ),
                    })),
                  )
                } else {
                  const nextId = allAccounts.length > 0 ? Math.max(...allAccounts.map((a) => a.id)) + 1 : 1
                  const newAccount: ChartAccount = {
                    id: nextId,
                    code: createForm.code,
                    name: createForm.name,
                    subType: createForm.subType,
                    parentAccountName: parentName,
                    balance: 0,
                    isEnabled: createForm.isEnabled,
                  }
                  setGroups((prev) =>
                    prev.map((g) =>
                      g.type === groupType ? { ...g, accounts: [newAccount, ...g.accounts] } : g,
                    ),
                  )
                }

                handleDialogOpenChange(false)
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="coa-name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="coa-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter Name"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coa-code">
                      Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="coa-code"
                      type="number"
                      value={createForm.code}
                      onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                      placeholder="Enter Code"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coa-subtype">
                      Account Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={createForm.subType}
                      onValueChange={(value) => setCreateForm({ ...createForm, subType: value, makeSubAccount: false, parent: '' })}
                      required
                    >
                      <SelectTrigger id="coa-subtype">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypeOptions.map((group) => (
                          <div key={group.group}>
                            <SelectItem value={`__group_${group.group}`} disabled className="font-semibold">
                              {group.group}
                            </SelectItem>
                            {group.items.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={createForm.isEnabled}
                    onCheckedChange={(checked) => setCreateForm({ ...createForm, isEnabled: checked })}
                    id="coa-enabled"
                  />
                  <Label htmlFor="coa-enabled">Is Enabled</Label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="coa-subaccount"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={createForm.makeSubAccount}
                    onChange={(e) => setCreateForm({ ...createForm, makeSubAccount: e.target.checked })}
                    disabled={!createForm.subType}
                  />
                  <Label htmlFor="coa-subaccount">Make this a sub-account</Label>
                </div>

                {createForm.makeSubAccount && (
                  <div className="space-y-2">
                    <Label htmlFor="coa-parent">
                      Parent Account <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={createForm.parent}
                      onValueChange={(value) => setCreateForm({ ...createForm, parent: value })}
                      required
                    >
                      <SelectTrigger id="coa-parent">
                        <SelectValue placeholder="Select Parent Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentAccountsForSelectedType.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.code} - {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="coa-desc">Description</Label>
                  <Input
                    id="coa-desc"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="Enter Description"
                  />
                </div>
              </div>
            <DialogFooter>
              <Button type="button" variant="secondary" className="shadow-none" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // mock apply
              console.log('Apply filter:', { startDate, endDate })
            }}
            className="flex flex-col gap-4 md:flex-row md:items-end"
          >
            <div className="w-full md:w-44">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
            </div>
            <div className="w-full md:w-44">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" variant="outline" size="sm" className="shadow-none h-9 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" title="Apply">
                <Search className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shadow-none h-9 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                title="Reset"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pl-8 pr-6">
          <CardTitle>Accounts</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredGroups.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No accounts found</div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map((group, idx) => (
                <div key={group.type} className={idx === 0 ? '' : 'pt-6 border-t'}>
                  <div className="px-2 pb-2 text-sm font-semibold text-muted-foreground">
                    {group.type}
                  </div>
                  <div className="overflow-x-auto w-full">
                    <Table className="w-full min-w-full table-auto">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Parent Account Name</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>{account.code}</TableCell>
                            <TableCell>
                              <Link
                                className="text-sm font-medium text-primary hover:underline"
                                href={`/accounting/double-entry?tab=ledger&account=${account.id}`}
                              >
                                {account.name}
                              </Link>
                            </TableCell>
                            <TableCell>{account.subType}</TableCell>
                            <TableCell className="text-muted-foreground">{account.parentAccountName || '-'}</TableCell>
                            <TableCell className="font-medium">{formatPrice(account.balance)}</TableCell>
                            <TableCell>{getEnabledBadge(account.isEnabled)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-start">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                  title="Transaction Summary"
                                >
                                  <Activity className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                                  title="Edit"
                                  onClick={() => handleEdit(account)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => handleDeleteClick(account, group.type)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAccountToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

