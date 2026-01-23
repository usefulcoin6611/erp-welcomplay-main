'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Activity,
  Plus,
  RefreshCw,
  Search,
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState('2025-01-01')
  const [endDate, setEndDate] = useState('2025-12-31')

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
    () => chartAccountsByType.flatMap((g) => g.accounts),
    [],
  )

  const parentAccountsForSelectedType = useMemo(() => {
    if (!createForm.subType) return []
    return allAccounts.filter((a) => a.subType === createForm.subType)
  }, [allAccounts, createForm.subType])

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7" title="Create">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                console.log('Create COA:', createForm)
                setCreateDialogOpen(false)
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
              <Button type="button" variant="secondary" className="shadow-none" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none">
                Create
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // mock apply
              console.log('Apply filter:', { startDate, endDate })
            }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-end"
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

      {chartAccountsByType.map((group) => (
        <Card key={group.type} className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] w-full">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-semibold">{group.type}</div>
            </div>
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 py-3">Code</TableHead>
                    <TableHead className="px-4 py-3">Name</TableHead>
                    <TableHead className="px-4 py-3">Type</TableHead>
                    <TableHead className="px-4 py-3">Parent Account Name</TableHead>
                    <TableHead className="px-4 py-3">Balance</TableHead>
                    <TableHead className="px-4 py-3">Status</TableHead>
                    <TableHead className="px-4 py-3">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="px-4 py-3">{account.code}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Link
                          className="text-sm font-medium text-primary hover:underline"
                          href={`/accounting/double-entry?tab=ledger&account=${account.id}`}
                        >
                          {account.name}
                        </Link>
                      </TableCell>
                      <TableCell className="px-4 py-3">{account.subType}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">{account.parentAccountName || '-'}</TableCell>
                      <TableCell className="px-4 py-3 font-medium">{formatPrice(account.balance)}</TableCell>
                      <TableCell className="px-4 py-3">{getEnabledBadge(account.isEnabled)}</TableCell>
                      <TableCell className="px-4 py-3">
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
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            title="Delete"
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

