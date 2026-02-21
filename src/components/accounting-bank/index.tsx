'use client'

import { useMemo, useState, useEffect } from 'react'
import { Pencil, Plus, RefreshCw, Trash2, Search, X, FileDown } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { SimplePagination } from '@/components/ui/simple-pagination'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'

export function AccountTab() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<BankAccountRow | null>(null)
  const [formData, setFormData] = useState({
    chartOfAccount: '',
    paymentGateway: '',
    holderName: '',
    bank: '',
    accountNumber: '',
    openingBalance: '',
    contactNumber: '',
    bankAddress: '',
  })

  type CoaOption = {
    code: string
    name: string
    type: string
    subType: string
  }

  type CoaGroup = {
    type: string
    subTypes: {
      subType: string
      accounts: CoaOption[]
    }[]
  }

  const [chartOfAccountGroups, setChartOfAccountGroups] = useState<CoaGroup[]>([])
  const [accountSearch, setAccountSearch] = useState('')
  const [paymentGatewayOptions, setPaymentGatewayOptions] = useState<
    { value: string; label: string }[]
  >([
    { value: 'none', label: 'Tidak menggunakan gateway' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'midtrans', label: 'Midtrans' },
    { value: 'xendit', label: 'Xendit' },
  ])

  useEffect(() => {
    let cancelled = false

    const loadGateways = async () => {
      try {
        const res = await fetch('/api/settings/payment-gateways')
        if (!res.ok || cancelled) return
        const json = await res.json()
        const data = json?.data as {
          cash_enabled?: boolean
          bank_transfer_enabled?: boolean
          midtrans_enabled?: boolean
          xendit_enabled?: boolean
          paypal_enabled?: boolean
          custom?: { code: string; label: string }[]
        }
        if (!data) return

        const options: { value: string; label: string }[] = [
          { value: 'none', label: 'Tidak menggunakan gateway' },
        ]
        if (data.cash_enabled) options.push({ value: 'cash', label: 'Cash' })
        if (data.bank_transfer_enabled)
          options.push({ value: 'bank_transfer', label: 'Bank Transfer' })
        if (data.midtrans_enabled) options.push({ value: 'midtrans', label: 'Midtrans' })
        if (data.xendit_enabled) options.push({ value: 'xendit', label: 'Xendit' })
        if (data.paypal_enabled) options.push({ value: 'paypal', label: 'PayPal' })
        if (data.custom && Array.isArray(data.custom)) {
          data.custom.forEach((g) => {
            if (g.code && g.label) {
              options.push({ value: g.code, label: g.label })
            }
          })
        }

        if (!cancelled && options.length > 0) {
          setPaymentGatewayOptions(options)
        }
      } catch {
        return
      }
    }

    loadGateways()

    return () => {
      cancelled = true
    }
  }, [])

  type BankAccountRow = {
    id: string
    chartOfAccount: string
    name: string
    bank: string
    accountNumber: string
    currentBalance: string
    contactNumber: string
    bankAddress: string
    paymentGateway: string
  }

  const formatRupiah = (amount: number) =>
    `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`

  const parseRupiahToNumber = (value: string) => {
    const digits = value.replace(/[^\d]/g, '')
    return digits ? Number(digits) : 0
  }

  const flattenAccounts = useMemo(
    () =>
      chartOfAccountGroups.flatMap((group) =>
        group.subTypes.flatMap((sub) => sub.accounts),
      ),
    [chartOfAccountGroups],
  )

  const filteredAccountGroups = useMemo(() => {
    const query = accountSearch.trim().toLowerCase()
    if (!query) return chartOfAccountGroups
    return chartOfAccountGroups
      .map((group) => {
        const subTypes = group.subTypes
          .map((sub) => {
            const accounts = sub.accounts.filter((acc) => {
              const code = acc.code.toLowerCase()
              const name = acc.name.toLowerCase()
              return (
                code.includes(query) ||
                name.includes(query)
              )
            })
            return { ...sub, accounts }
          })
          .filter((sub) => sub.accounts.length > 0)
        return { ...group, subTypes }
      })
      .filter((group) => group.subTypes.length > 0)
  }, [chartOfAccountGroups, accountSearch])

  const coaLabelFromValue = (value: string) => {
    const found =
      flattenAccounts.find((c) => String(c.code) === String(value)) ?? null
    return found ? `${found.code} - ${found.name}` : value
  }

  const normalizePaymentGatewayValue = (value: string) => {
    if (!value) return 'none'
    const trimmed = value.trim()
    const lowered = trimmed.toLowerCase()
    return lowered.replace(/\s+/g, '_')
  }

  const getPaymentGatewayLabel = (value: string) => {
    if (!value) return '-'
    const option = paymentGatewayOptions.find((o) => o.value === value)
    if (option) return option.label
    const readable = value.replace(/_/g, ' ').trim()
    if (!readable) return '-'
    return readable.charAt(0).toUpperCase() + readable.slice(1)
  }

  const coaValueFromLabel = (label: string) => {
    const code = label.split(' - ')[0]?.trim()
    const found =
      flattenAccounts.find((c) => String(c.code) === String(code)) ?? null
    return found ? String(found.code) : ''
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        chartOfAccount: '',
        paymentGateway: '',
        holderName: '',
        bank: '',
        accountNumber: '',
        openingBalance: '',
        contactNumber: '',
        bankAddress: '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      chartCode: formData.chartOfAccount,
      holderName: formData.holderName,
      bank: formData.bank,
      accountNumber: formData.accountNumber,
      openingBalance: formData.openingBalance ? Number(formData.openingBalance) : 0,
      contactNumber: formData.contactNumber || null,
      bankAddress: formData.bankAddress || null,
      paymentGateway: formData.paymentGateway,
    }

    const isEdit = Boolean(editingId)

    try {
      const res = await fetch(
        isEdit ? `/api/bank-accounts/${editingId}` : '/api/bank-accounts',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.success) {
        toast.error(json?.message || (isEdit ? 'Gagal memperbarui akun bank' : 'Gagal membuat akun bank'))
        return
      }

      toast.success(isEdit ? 'Akun bank berhasil diperbarui' : 'Akun bank berhasil dibuat')
      await loadAccounts()
      handleDialogOpenChange(false)
    } catch {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const [accounts, setAccounts] = useState<BankAccountRow[]>([])

  const loadAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      if (!json?.success || !Array.isArray(json.data)) return
      setAccounts(json.data as BankAccountRow[])
    } catch {}
  }

  const loadCOA = async () => {
    try {
      const res = await fetch('/api/chart-of-accounts', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      const list = Array.isArray(json?.data) ? (json.data as any[]) : []

      const filtered = list
        .filter((a) => a.status === 'Active')
        .map((a) => ({
          code: String(a.code),
          name: String(a.name),
          type: String(a.type),
          subType: String(a.subType),
        }))

      const groupedByType = filtered.reduce<Record<string, CoaOption[]>>(
        (acc, account) => {
          if (!acc[account.type]) acc[account.type] = []
          acc[account.type].push(account)
          return acc
        },
        {},
      )

      const typeOrder = [
        'Assets',
        'Liabilities',
        'Equity',
        'Income',
        'Costs of Goods Sold',
        'Expenses',
      ]

      const groups: CoaGroup[] = typeOrder
        .filter((type) => groupedByType[type]?.length)
        .map((type) => {
          const accountsForType = groupedByType[type]
          const bySubType = accountsForType.reduce<
            Record<string, CoaOption[]>
          >((acc, account) => {
            const key = account.subType || 'Other'
            if (!acc[key]) acc[key] = []
            acc[key].push(account)
            return acc
          }, {})

          const entries = Object.entries(bySubType)

          if (type === 'Expenses') {
            const subTypeOrder = [
              'Payroll Expenses',
              'General and Administrative expenses',
            ]
            entries.sort(([a], [b]) => {
              const ia = subTypeOrder.indexOf(a)
              const ib = subTypeOrder.indexOf(b)
              if (ia !== -1 || ib !== -1) {
                if (ia === -1) return 1
                if (ib === -1) return -1
                return ia - ib
              }
              return a.localeCompare(b)
            })
          } else {
            entries.sort(([a], [b]) => a.localeCompare(b))
          }

          const subTypes = entries.map(([subType, accounts]) => ({
            subType,
            accounts: accounts.sort((a, b) => a.code.localeCompare(b.code)),
          }))

          return {
            type,
            subTypes,
          }
        })

      setChartOfAccountGroups(groups)
    } catch {}
  }

  useEffect(() => {
    loadAccounts()
    loadCOA()
  }, [])

  const handleEdit = (row: BankAccountRow) => {
    setEditingId(row.id)
    setFormData({
      chartOfAccount: coaValueFromLabel(row.chartOfAccount),
      paymentGateway: normalizePaymentGatewayValue(row.paymentGateway),
      holderName: row.name,
      bank: row.bank,
      accountNumber: row.accountNumber,
      openingBalance: `${parseRupiahToNumber(row.currentBalance)}`,
      contactNumber: row.contactNumber,
      bankAddress: row.bankAddress,
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    const row = accounts.find((a) => a.id === id) ?? null
    setAccountToDelete(row)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return

    try {
      const res = await fetch(`/api/bank-accounts/${accountToDelete.id}`, {
        method: 'DELETE',
      })

      const json = await res.json().catch(() => null)

      if (!res.ok || !json?.success) {
        toast.error(json?.message || 'Gagal menghapus akun bank')
        return
      }

      toast.success('Akun bank berhasil dihapus')
      await loadAccounts()
    } catch {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setAccountToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return accounts
    
    const q = search.trim().toLowerCase()
    return accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(q) ||
        account.bank.toLowerCase().includes(q) ||
        account.accountNumber.toLowerCase().includes(q) ||
        account.chartOfAccount.toLowerCase().includes(q) ||
        account.paymentGateway.toLowerCase().includes(q)
    )
  }, [search, accounts])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleExport = () => {
    const headers = ['Chart of Account', 'Name', 'Bank', 'Account Number', 'Current Balance', 'Contact Number', 'Payment Gateway']
    const rows = filteredData.map(account => [
      account.chartOfAccount,
      account.name,
      account.bank,
      account.accountNumber,
      account.currentBalance,
      account.contactNumber,
      getPaymentGatewayLabel(account.paymentGateway)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `bank_accounts_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Bank Account</CardTitle>
            <CardDescription>
              Daftar akun bank beserta saldo dan informasi gateway pembayaran.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
               variant="outline"
               size="sm"
               className="shadow-none h-8 px-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
               title="Export"
               onClick={handleExport}
             >
               <FileDown className="mr-2 h-3.5 w-3.5" />
               <span className="text-xs">Export CSV</span>
             </Button>
            <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="blue"
                  className="shadow-none h-7"
                  onClick={() => {
                    setEditingId(null)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Akun Bank
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Akun Bank' : 'Buat Akun Bank'}</DialogTitle>
                  <DialogDescription>
                    {editingId ? 'Perbarui informasi akun bank.' : 'Tambahkan akun bank baru ke sistem.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  {/* Row 1: Chart of Account | Payment Gateway */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chartOfAccount" className="form-label">
                        Account <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.chartOfAccount}
                        onValueChange={(value) =>
                          setFormData({ ...formData, chartOfAccount: value })
                        }
                        required
                      >
                        <SelectTrigger id="chartOfAccount" className="w-full">
                          <SelectValue placeholder="Select Chart of Account" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                          <div className="px-2 pb-1">
                            <input
                              className="w-full rounded-sm border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-[2px] focus-visible:ring-ring/40"
                              placeholder="Cari akun..."
                              value={accountSearch}
                              onChange={(e) => setAccountSearch(e.target.value)}
                            />
                          </div>
                          {filteredAccountGroups.map((group) => (
                            <div key={group.type}>
                              <div className="px-3 pt-2 pb-1 text-xs font-bold text-slate-900">
                                {group.type}
                              </div>
                              {group.subTypes.map((sub) => (
                                <div key={sub.subType}>
                                  <div className="px-4 py-1 text-xs font-semibold text-slate-700">
                                    {sub.subType}
                                  </div>
                                  {sub.accounts.map((acc) => (
                                    <SelectItem
                                      key={acc.code}
                                      value={acc.code}
                                      className="pl-8"
                                    >
                                      {acc.code} - {acc.name}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentGateway" className="form-label">
                        Payment Gateway <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.paymentGateway}
                        onValueChange={(value) => setFormData({ ...formData, paymentGateway: value })}
                        required
                      >
                        <SelectTrigger id="paymentGateway" className="w-full">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentGatewayOptions.map((gateway) => (
                            <SelectItem key={gateway.value} value={gateway.value}>
                              {gateway.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Row 2: Bank Holder Name | Bank Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="holderName" className="form-label">
                        Bank Holder Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="holderName"
                        value={formData.holderName}
                        onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                        placeholder="Enter Bank Holder Name"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank" className="form-label">
                        Bank Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bank"
                        value={formData.bank}
                        onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                        placeholder="Enter Bank Name"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  {/* Row 3: Account Number | Opening Balance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="form-label">
                        Account Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Enter Account Number"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openingBalance" className="form-label">
                        Opening Balance
                      </Label>
                      <Input
                        id="openingBalance"
                        type="number"
                        step="0.01"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                        placeholder="Enter Opening Balance"
                        className="w-full"
                      />
                    </div>
                  </div>
                  {/* Row 4: Contact Number (col-md-6) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber" className="form-label">
                        Contact Number
                      </Label>
                      <Input
                        id="contactNumber"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder="Enter Contact Number"
                        className="w-full"
                      />
                    </div>
                    <div></div>
                  </div>
                  {/* Row 5: Bank Address (col-md-12 mb-0) */}
                  <div className="space-y-2 mb-0">
                    <Label htmlFor="bankAddress" className="form-label">
                      Bank Address
                    </Label>
                    <Textarea
                      id="bankAddress"
                      value={formData.bankAddress}
                      onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                      placeholder="Enter Bank Address"
                      rows={3}
                      className="w-full"
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

      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle>Semua Akun</CardTitle>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
              />
              {search.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Chart of Account</TableHead>
                <TableHead className="px-6">Nama</TableHead>
                <TableHead className="px-6">Bank</TableHead>
                <TableHead className="px-6">No. Rekening</TableHead>
                <TableHead className="px-6 text-right">Saldo Saat Ini</TableHead>
                <TableHead className="px-6">Kontak</TableHead>
                <TableHead className="px-6">Payment Gateway</TableHead>
                <TableHead className="px-6 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="px-6">{a.chartOfAccount}</TableCell>
                    <TableCell className="px-6">{a.name}</TableCell>
                    <TableCell className="px-6">{a.bank}</TableCell>
                    <TableCell className="px-6 font-mono text-sm">{a.accountNumber}</TableCell>
                    <TableCell className="px-6 text-right">{a.currentBalance}</TableCell>
                    <TableCell className="px-6">{a.contactNumber}</TableCell>
                    <TableCell className="px-6">
                      <Badge variant="outline">
                        {getPaymentGatewayLabel(a.paymentGateway)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border-cyan-100"
                          aria-label={`Edit ${a.name}`}
                          onClick={() => handleEdit(a)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                          aria-label={`Delete ${a.name}`}
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 text-center py-8 text-muted-foreground">
                    No accounts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bank account? This action cannot be undone.
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

export function TransferTab() {
  type AccountOption = {
    id: string
    label: string
    bankName: string
    holderName: string
  }

  type TransferRow = {
    id: string
    date: string
    amount: number
    reference: string
    description: string
    fromAccount: {
      id: string
      bankName: string
      holderName: string
    }
    toAccount: {
      id: string
      bankName: string
      holderName: string
    }
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    date: '',
    fromAccount: '',
    toAccount: '',
    amount: '',
    reference: '',
    description: '',
  })
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([])
  const [transfers, setTransfers] = useState<TransferRow[]>([])
  const [filters, setFilters] = useState({
    date: '',
    fromAccount: '',
    toAccount: '',
  })

  const loadAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts')
      const json = await res.json()
      if (!res.ok || !json?.success) {
        const message = json?.message || json?.error || 'Gagal memuat bank accounts'
        toast.error(message)
        return
      }
      const rows = (json.data || []) as any[]
      const options: AccountOption[] = rows.map((row) => ({
        id: row.id,
        label: `${row.bank} - ${row.name}`,
        bankName: row.bank,
        holderName: row.name,
      }))
      setAccountOptions(options)
    } catch (error) {
      console.error('Error loading bank accounts:', error)
      toast.error('Gagal memuat daftar bank account')
    }
  }

  const loadTransfers = async () => {
    try {
      const res = await fetch('/api/bank-transfers')
      const json = await res.json()
      if (!res.ok || !json?.success) {
        const message = json?.message || json?.error || 'Gagal memuat bank transfer'
        toast.error(message)
        return
      }
      setTransfers(json.data || [])
    } catch (error) {
      console.error('Error loading bank transfers:', error)
      toast.error('Gagal memuat daftar bank transfer')
    }
  }

  useEffect(() => {
    loadAccounts()
    loadTransfers()
  }, [])

  const filteredTransfers = useMemo(
    () =>
      transfers.filter((transfer) => {
        const matchDate = !filters.date || transfer.date === filters.date
        const matchFrom = !filters.fromAccount || transfer.fromAccount.id === filters.fromAccount
        const matchTo = !filters.toAccount || transfer.toAccount.id === filters.toAccount
        return matchDate && matchFrom && matchTo
      }),
    [filters, transfers],
  )

  // Paginated data
  const paginatedTransfers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredTransfers.slice(startIndex, endIndex)
  }, [filteredTransfers, currentPage, pageSize])

  const totalRecords = filteredTransfers.length

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.date, filters.fromAccount, filters.toAccount])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({
        date: '',
        fromAccount: '',
        toAccount: '',
        amount: '',
        reference: '',
        description: '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNumber = Number(formData.amount)
    if (!formData.date || !formData.fromAccount || !formData.toAccount || !formData.description || !amountNumber) {
      toast.error('Lengkapi semua field wajib')
      return
    }
    if (formData.fromAccount === formData.toAccount) {
      toast.error('From Account dan To Account harus berbeda')
      return
    }
    try {
      const res = await fetch('/api/bank-transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formData.date,
          fromAccountId: formData.fromAccount,
          toAccountId: formData.toAccount,
          amount: amountNumber,
          reference: formData.reference || null,
          description: formData.description,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Gagal membuat bank transfer')
      }
      toast.success('Bank transfer berhasil dibuat')
      handleDialogOpenChange(false)
      await loadTransfers()
    } catch (error) {
      console.error('Error creating bank transfer:', error)
      toast.error('Gagal membuat bank transfer')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Bank Balance Transfer</CardTitle>
            <CardDescription>
              Manage transfers between your bank accounts
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" variant="blue" className="shadow-none h-7">
                <Plus className="mr-2 h-4 w-4" />
                Create Bank Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Bank Transfer</DialogTitle>
                <DialogDescription>
                  Transfer balance between your bank accounts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Row 1: From Account | To Account */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromAccount" className="form-label">
                      From Account <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.fromAccount}
                      onValueChange={(value) => setFormData({ ...formData, fromAccount: value })}
                      required
                    >
                      <SelectTrigger id="fromAccount" className="w-full">
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toAccount" className="form-label">
                      To Account <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.toAccount}
                      onValueChange={(value) => setFormData({ ...formData, toAccount: value })}
                      required
                    >
                      <SelectTrigger id="toAccount" className="w-full">
                        <SelectValue placeholder="Select Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create account here. <span className="font-medium text-primary cursor-pointer">Create account</span>
                    </p>
                  </div>
                </div>
                {/* Row 2: Amount | Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="form-label">
                      Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter Amount"
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transfer-form-date" className="form-label">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      id="transfer-form-date"
                      value={formData.date}
                      onValueChange={(v) => setFormData({ ...formData, date: v })}
                      placeholder="Set a date"
                      className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                    />
                    {/* Keep native required validation without showing a browser date input */}
                    <input
                      tabIndex={-1}
                      aria-hidden="true"
                      className="sr-only"
                      required
                      value={formData.date}
                      onChange={() => {}}
                    />
                  </div>
                </div>
                {/* Row 3: Reference (col-md-6) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="form-label">
                      Reference
                    </Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                      placeholder="Enter Reference"
                      className="w-full"
                    />
                  </div>
                  <div></div>
                </div>
                {/* Row 4: Description (col-md-12 mb-0) */}
                <div className="space-y-2 mb-0">
                  <Label htmlFor="description" className="form-label">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter Description"
                    rows={3}
                    className="w-full"
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
                <Button type="submit" variant="blue" className="shadow-none">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </CardHeader>
      </Card>

      {/* Filter Form */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardContent className="px-6 py-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="transfer-date">Date</Label>
              <DatePicker
                id="transfer-date"
                value={filters.date}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, date: v }))}
                className="h-9 border-0 bg-muted/80 hover:bg-muted shadow-none px-3"
                placeholder="Set a date"
              />
            </div>
            <div className="space-y-2">
              <Label>From Account</Label>
              <Select
                value={filters.fromAccount || undefined}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, fromAccount: value }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Account</Label>
              <Select
                value={filters.toAccount || undefined}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, toAccount: value }))}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => {
                  // Apply filter logic
                  setCurrentPage(1)
                }}
                variant="outline"
                size="sm"
                className="shadow-none h-9 w-9 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                aria-label="Apply filter"
                title="Apply"
              >
                <Search className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Reset filter"
                title="Reset"
                onClick={() => {
                  setFilters({ date: '', fromAccount: '', toAccount: '' })
                  setCurrentPage(1)
                }}
                className="shadow-none h-9 w-9 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Table */}
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <CardTitle>Bank Transfers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Date</TableHead>
                <TableHead className="px-6">From Account</TableHead>
                <TableHead className="px-6">To Account</TableHead>
                <TableHead className="px-6 text-right">Amount</TableHead>
                <TableHead className="px-6">Reference</TableHead>
                <TableHead className="px-6">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransfers.length > 0 ? (
                paginatedTransfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="px-6">{formatDate(transfer.date)}</TableCell>
                    <TableCell className="px-6">
                      {transfer.fromAccount.bankName} {transfer.fromAccount.holderName}
                    </TableCell>
                    <TableCell className="px-6">
                      {transfer.toAccount.bankName} {transfer.toAccount.holderName}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      {formatCurrency(transfer.amount)}
                    </TableCell>
                    <TableCell className="px-6 font-mono text-sm">{transfer.reference}</TableCell>
                    <TableCell className="px-6">{transfer.description}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                    No transfers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalRecords > 0 && (
            <div className="px-6 pb-6 pt-4">
              <SimplePagination
                totalCount={totalRecords}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page)
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
