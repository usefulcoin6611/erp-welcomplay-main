'use client'

import { useState, useMemo } from 'react'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { SimplePagination } from '@/components/ui/simple-pagination'
import {
  IconPlus,
  IconSearch,
  IconEye,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react'

const accountTypes = [
  {
    type: 'Assets',
    accounts: [
      {
        code: '1000',
        name: 'Cash & Bank',
        subType: 'Current Assets',
        parentAccountName: '-',
        balance: 250_000_000,
        status: 'Active',
      },
      {
        code: '1100',
        name: 'Accounts Receivable',
        subType: 'Current Assets',
        parentAccountName: 'Cash & Bank',
        balance: 125_000_000,
        status: 'Active',
      },
      {
        code: '1200',
        name: 'Inventory',
        subType: 'Current Assets',
        parentAccountName: 'Cash & Bank',
        balance: 80_000_000,
        status: 'Active',
      },
    ],
  },
  {
    type: 'Liabilities',
    accounts: [
      {
        code: '2000',
        name: 'Accounts Payable',
        subType: 'Current Liabilities',
        parentAccountName: '-',
        balance: 75_000_000,
        status: 'Active',
      },
      {
        code: '2100',
        name: 'Taxes Payable',
        subType: 'Current Liabilities',
        parentAccountName: 'Accounts Payable',
        balance: 20_000_000,
        status: 'Active',
      },
    ],
  },
  {
    type: 'Equity',
    accounts: [
      {
        code: '3000',
        name: 'Owner Equity',
        subType: 'Equity',
        parentAccountName: '-',
        balance: 250_000_000,
        status: 'Active',
      },
    ],
  },
]

function getAccountStatusClasses(status: string) {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-700 border-none'
    case 'Inactive': return 'bg-gray-100 text-gray-700 border-none'
    default: return 'bg-slate-100 text-slate-700 border-none'
  }
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
  const [search, setSearch] = useState('')
  const [accountType, setAccountType] = useState('all')
  const [status, setStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Flatten all accounts for filtering and pagination
  const allAccounts = useMemo(() => {
    return accountTypes.flatMap(group =>
      group.accounts.map(account => ({
        ...account,
        type: group.type,
      }))
    )
  }, [])

  // Filter data
  const filteredData = useMemo(() => {
    return allAccounts.filter((account) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (
          !account.code.toLowerCase().includes(q) &&
          !account.name.toLowerCase().includes(q) &&
          !account.subType.toLowerCase().includes(q)
        ) return false
      }
      if (accountType !== 'all' && account.type.toLowerCase() !== accountType.toLowerCase()) return false
      if (status !== 'all' && account.status.toLowerCase() !== status.toLowerCase()) return false
      return true
    })
  }, [allAccounts, search, accountType, status])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="blue" size="sm" className="shadow-none h-7">
              <IconPlus className="h-3 w-3 mr-2" />
              Create Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>
                Add a new account to the chart of accounts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="code">Account Code</Label>
                <Input id="code" placeholder="e.g. 1000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Account Name</Label>
                <Input id="name" placeholder="e.g. Cash & Bank" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Account Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assets">Assets</SelectItem>
                    <SelectItem value="liabilities">Liabilities</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="shadow-none">Cancel</Button>
              <Button variant="blue" className="shadow-none">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter accounts by type, sub type, and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); }} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Search</label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search account name or code..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-44">
              <label className="mb-1 block text-sm font-medium">Account Type</label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assets">Assets</SelectItem>
                  <SelectItem value="liabilities">Liabilities</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>
            Overview of all accounts in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
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
                {paginatedData.length > 0 ? (
                  paginatedData.map((account) => (
                    <TableRow key={account.code}>
                      <TableCell>
                        <span className="text-sm font-medium">{account.code}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{account.name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{account.subType}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {account.parentAccountName || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(account.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getAccountStatusClasses(account.status)}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-start">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                            title="Transaction Summary"
                          >
                            <IconEye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="shadow-none h-7 bg-cyan-500 hover:bg-cyan-600 text-white"
                            title="Edit"
                          >
                            <IconPencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="shadow-none h-7"
                            title="Delete"
                          >
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
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
  )
}
