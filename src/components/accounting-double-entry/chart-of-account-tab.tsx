'use client'

import { useMemo, useState, Fragment, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  id: string
  code: string
  name: string
  type: string
  subType: string
  parentAccountName: string
  parentId?: string | null
  balance: number
  isEnabled: boolean
  description?: string
  status: string
}

const accountTypeOptions: { group: string; items: string[] }[] = [
  { group: 'Assets', items: ['Accounts Receivable', 'Current Asset', 'Inventory Asset', 'Non-current Asset'] },
  { group: 'Liabilities', items: ['Accounts Payable', 'Current Liabilities', 'Long Term Liabilities'] },
  { group: 'Equity', items: ['Owners Equity', 'Share Capital', 'Retained Earnings'] },
  { group: 'Income', items: ['Sales Revenue', 'Other Revenue'] },
  { group: 'Costs of Goods Sold', items: ['Costs of Goods Sold'] },
  { group: 'Expenses', items: ['Payroll Expenses', 'General and Administrative expenses'] },
]

function getEnabledBadge(isEnabled: boolean) {
  if (isEnabled) {
    return <Badge className="bg-blue-500 text-white border-transparent">Enabled</Badge>
  }
  return <Badge className="bg-red-500 text-white border-transparent">Disabled</Badge>
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
  const [groups, setGroups] = useState<{ type: string; accounts: ChartAccount[] }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; groupType: string } | null>(null)
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')
  const [search, setSearch] = useState('')

  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/chart-of-accounts')
      const result = await res.json()
      if (result.success) {
        const rawAccounts = result.data
        const transformed: ChartAccount[] = rawAccounts.map((acc: any) => ({
          id: acc.id,
          code: acc.code,
          name: acc.name,
          type: acc.type,
          subType: acc.subType,
          parentAccountName: acc.parent?.name || '-',
          parentId: acc.parentId,
          balance: acc.balance,
          isEnabled: acc.status === 'Active',
          description: acc.description,
          status: acc.status
        }))

        const grouped: { [key: string]: ChartAccount[] } = {}
        transformed.forEach(acc => {
          if (!grouped[acc.type]) grouped[acc.type] = []
          grouped[acc.type].push(acc)
        })

        const groupList = Object.keys(grouped).map(type => ({
          type,
          accounts: grouped[type]
        }))
        
        // Define desired order
        const typeOrder = ["Assets", "Liabilities", "Equity", "Income", "Costs of Goods Sold", "Expenses"]
        groupList.sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type))
        
        setGroups(groupList)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
      toast.error('Gagal mengambil data Chart of Accounts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

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
      description: account.description ?? '',
    })
    setCreateDialogOpen(true)
  }

  const handleDeleteClick = (account: ChartAccount, groupType: string) => {
    setAccountToDelete({ id: account.id, groupType })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return
    try {
      const res = await fetch(`/api/chart-of-accounts/${accountToDelete.id}`, {
        method: 'DELETE',
      })
      const result = await res.json()
      if (result.success) {
        toast.success('Chart of Account berhasil dihapus')
        fetchAccounts()
      } else {
        toast.error(result.message || 'Gagal menghapus Chart of Account')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Gagal menghapus Chart of Account')
    } finally {
      setAccountToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Title Tab */}
          <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const groupType = groupTypeFromSubType(createForm.subType)
                    
                    const payload = {
                      name: createForm.name,
                      code: createForm.code,
                      type: groupType,
                      subType: createForm.subType,
                      description: createForm.description,
                      isSubAccount: createForm.makeSubAccount,
                      parentId: createForm.makeSubAccount ? createForm.parent : null,
                      status: createForm.isEnabled ? 'Active' : 'Inactive',
                    }

                    try {
                      let res;
                      if (editingId) {
                        res = await fetch(`/api/chart-of-accounts/${editingId}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })
                      } else {
                        res = await fetch('/api/chart-of-accounts', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })
                      }

                      const result = await res.json()
                      if (result.success) {
                        toast.success(`Chart of Account berhasil ${editingId ? 'diperbarui' : 'dibuat'}`)
                        handleDialogOpenChange(false)
                        fetchAccounts()
                      } else {
                        toast.error(result.message || 'Gagal menyimpan data')
                      }
                    } catch (error) {
                      console.error('Submit failed:', error)
                      toast.error('Gagal menyimpan data')
                    }
                  }}
                >
              <div className="grid gap-4 py-4">
                {editingId ? (
                  // Edit Modal Layout matching reference edit.blade.php
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coa-name">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="coa-name"
                          value={createForm.name}
                          onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                          placeholder="Enter Name"
                          className="focus-visible:ring-[#10b981] focus-visible:border-[#10b981]"
                          required
                        />
                      </div>
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
                          className="focus-visible:ring-[#10b981] focus-visible:border-[#10b981]"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="coa-enabled">Is Enabled</Label>
                      <div className="flex items-center pt-2">
                        <Switch
                          checked={createForm.isEnabled}
                          onCheckedChange={(checked) => setCreateForm({ ...createForm, isEnabled: checked })}
                          id="coa-enabled"
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Create Modal Layout matching reference create.blade.php
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="coa-name">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="coa-name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="Enter Name"
                        className="focus-visible:ring-[#10b981] focus-visible:border-[#10b981]"
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
                          className="focus-visible:ring-[#10b981] focus-visible:border-[#10b981]"
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
                          <SelectTrigger 
                            id="coa-subtype" 
                            className="border-[#10b981] focus:ring-[#10b981] focus:border-[#10b981] transition-all"
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="none" disabled className="hidden">Select</SelectItem>
                            {accountTypeOptions.map((group) => (
                              <SelectGroup key={group.group}>
                                <SelectLabel className="px-2 py-1.5 text-sm font-bold text-slate-900">
                                  {group.group}
                                </SelectLabel>
                                {group.items.map((item) => (
                                  <SelectItem 
                                    key={item} 
                                    value={item}
                                    className="pl-6 py-2 cursor-pointer hover:bg-slate-100 focus:bg-slate-100"
                                  >
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="coa-enabled" className="whitespace-nowrap">Is Enabled</Label>
                        <div className="flex items-center h-10">
                          <Switch
                            checked={createForm.isEnabled}
                            onCheckedChange={(checked) => setCreateForm({ ...createForm, isEnabled: checked })}
                            id="coa-enabled"
                            className="data-[state=checked]:bg-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center h-10 gap-3 md:col-span-4">
                        <input
                          id="coa-subaccount"
                          type="checkbox"
                          className="h-4 w-4"
                          checked={createForm.makeSubAccount}
                          onChange={(e) => setCreateForm({ ...createForm, makeSubAccount: e.target.checked })}
                          disabled={!createForm.subType}
                        />
                        <Label htmlFor="coa-subaccount" className="cursor-pointer whitespace-nowrap">Make this a sub-account</Label>
                      </div>
                      {createForm.makeSubAccount && (
                        <div className="space-y-2 md:col-span-5">
                          <Label htmlFor="coa-parent" className="whitespace-nowrap">
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
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="coa-desc">Description</Label>
                  <textarea
                    id="coa-desc"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter Description"
                    rows={2}
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
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
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
        <CardContent className="p-6">
          <div className="flex justify-end">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Handle date filter
                console.log('Apply filter:', { startDate, endDate })
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[14rem_14rem_auto] w-full md:w-auto"
            >
              <div className="space-y-2">
                <Label htmlFor="coa-filter-start-date" className="text-sm font-medium">
                  Start Date
                </Label>
                <DatePicker
                  id="coa-filter-start-date"
                  value={startDate}
                  onValueChange={setStartDate}
                  placeholder="Set a date"
                  className="!h-9 px-3"
                  iconPlacement="right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coa-filter-end-date" className="text-sm font-medium">
                  End Date
                </Label>
                <DatePicker
                  id="coa-filter-end-date"
                  value={endDate}
                  onValueChange={setEndDate}
                  placeholder="Set a date"
                  className="!h-9 px-3"
                  iconPlacement="right"
                />
              </div>
              <div className="flex items-center gap-2 md:pt-6">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                  title="Apply"
                >
                  <Search className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Accounts</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
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
        <CardContent className="p-0">
          {filteredGroups.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">No accounts found</div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map((group, idx) => (
                <div key={group.type} className={idx === 0 ? '' : 'pt-6 border-t'}>
                  <div className="px-6 pb-2 text-sm font-semibold text-muted-foreground">
                    {group.type}
                  </div>
                  <div className="overflow-x-auto w-full">
                    <Table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-[100px]" />
                        <col className="w-[250px]" />
                        <col className="w-[180px]" />
                        <col className="w-[200px]" />
                        <col className="w-[180px]" />
                        <col className="w-[120px]" />
                        <col className="w-[160px]" />
                      </colgroup>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6">Code</TableHead>
                          <TableHead className="px-6">Name</TableHead>
                          <TableHead className="px-6">Type</TableHead>
                          <TableHead className="px-6">Parent Account Name</TableHead>
                          <TableHead className="px-6">Balance</TableHead>
                          <TableHead className="px-6">Status</TableHead>
                          <TableHead className="px-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.accounts.map((account) => {
                          const isSubAccount = account.parentAccountName && account.parentAccountName !== '-'
                          return (
                            <TableRow key={account.id}>
                              <TableCell className={cn("px-6 font-mono", isSubAccount && "pl-12")}>
                                {account.code}
                              </TableCell>
                              <TableCell className={cn("px-6", isSubAccount && "pl-12")}>
                                <Link
                                  className="text-sm font-medium text-primary hover:underline"
                                  href={`/accounting/double-entry?tab=ledger&account=${account.id}`}
                                >
                                  {account.name}
                                </Link>
                              </TableCell>
                              <TableCell className="px-6">{account.subType}</TableCell>
                              <TableCell className="px-6 text-muted-foreground">{account.parentAccountName || '-'}</TableCell>
                              <TableCell className="px-6 font-medium">{formatPrice(account.balance)}</TableCell>
                              <TableCell className="px-6">{getEnabledBadge(account.isEnabled)}</TableCell>
                              <TableCell className="px-6">
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
                          )
                        })}
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
        </>
      )}
    </div>
  )
}

