'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Eye, Trash2, Pencil, Check } from 'lucide-react'
import { toast } from 'sonner'

const cardClass = 'rounded-lg border bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

type SimpleOption = {
  id: string
  name: string
}

type BankAccountOption = {
  id: string
  name: string
  bank: string
  accountNumber: string
}

interface AllowanceItem {
  id: string
  employeeName: string
  allowanceOption: string
  title: string
  type: string
  amount: number
}

interface CommissionItem {
  id: string
  employeeName: string
  title: string
  type: string
  amount: number
}

interface LoanItem {
  id: string
  employeeName: string
  loanOption: string
  title: string
  type: string
  amount: number
  reason: string
}

interface SaturationItem {
  id: string
  employeeName: string
  deductionOptionId: string
  title: string
  type: string
  amount: number
}

interface OtherItem {
  id: string
  employeeName: string
  title: string
  type: string
  amount: number
}

interface OvertimeItem {
  id: string
  employeeName: string
  title: string
  days: number
  hours: number
  rate: number
  amount: number
}

export default function EditSalaryCards({ employee }: { employee: any }) {
  // Dialog visibility states
  const [showSalaryDialog, setShowSalaryDialog] = useState(false)
  const [showAllowanceForm, setShowAllowanceForm] = useState(false)
  const [showCommissionForm, setShowCommissionForm] = useState(false)
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [showSaturationForm, setShowSaturationForm] = useState(false)
  const [showOtherForm, setShowOtherForm] = useState(false)
  const [showOvertimeForm, setShowOvertimeForm] = useState(false)

  // Form states
  const [payrollType, setPayrollType] = useState(employee.salaryType || employee.payrollType || 'Monthly')
  const [baseSalary, setBaseSalary] = useState(
    employee.basicSalary != null ? String(employee.basicSalary) : String(employee.salary || 0),
  )
  const [bankAccount, setBankAccount] = useState('')

  // Allowance states
  const [allowanceOption, setAllowanceOption] = useState('')
  const [allowanceTitle, setAllowanceTitle] = useState('')
  const [allowanceAmount, setAllowanceAmount] = useState('')
  const [allowanceType, setAllowanceType] = useState('Fixed')

  // Commission states
  const [commissionTitle, setCommissionTitle] = useState('')
  const [commissionAmount, setCommissionAmount] = useState('')
  const [commissionType, setCommissionType] = useState('Fixed')

  // Loan states
  const [loanOption, setLoanOption] = useState('')
  const [loanTitle, setLoanTitle] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [loanType, setLoanType] = useState('Fixed')
  const [loanStartDate, setLoanStartDate] = useState('')
  const [loanEndDate, setLoanEndDate] = useState('')
  const [loanReason, setLoanReason] = useState('')

  // Saturation states
  const [saturationOption, setSaturationOption] = useState('')
  const [saturationTitle, setSaturationTitle] = useState('')
  const [saturationAmount, setSaturationAmount] = useState('')
  const [saturationType, setSaturationType] = useState('Fixed')

  // Other payment states
  const [otherTitle, setOtherTitle] = useState('')
  const [otherAmount, setOtherAmount] = useState('')
  const [otherType, setOtherType] = useState('Fixed')

  // Overtime states
  const [overtimeTitle, setOvertimeTitle] = useState('')
  const [overtimeDays, setOvertimeDays] = useState('')
  const [overtimeHours, setOvertimeHours] = useState('')
  const [overtimeRate, setOvertimeRate] = useState('')

  // Row edit/delete states
  const [editingAllowanceId, setEditingAllowanceId] = useState<string | null>(null)
  const [editingCommissionId, setEditingCommissionId] = useState<string | null>(null)
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null)
  const [editingSaturationId, setEditingSaturationId] = useState<string | null>(null)
  const [editingOtherId, setEditingOtherId] = useState<string | null>(null)
  const [editingOvertimeId, setEditingOvertimeId] = useState<string | null>(null)

  const [deleteConfirmAllowanceId, setDeleteConfirmAllowanceId] = useState<string | null>(null)
  const [deleteConfirmCommissionId, setDeleteConfirmCommissionId] = useState<string | null>(null)
  const [deleteConfirmLoanId, setDeleteConfirmLoanId] = useState<string | null>(null)
  const [deleteConfirmSaturationId, setDeleteConfirmSaturationId] = useState<string | null>(null)
  const [deleteConfirmOtherId, setDeleteConfirmOtherId] = useState<string | null>(null)
  const [deleteConfirmOvertimeId, setDeleteConfirmOvertimeId] = useState<string | null>(null)

  // Master options from HRM setup
  const [payslipTypes, setPayslipTypes] = useState<SimpleOption[]>([])
  const [allowanceOptions, setAllowanceOptions] = useState<SimpleOption[]>([])
  const [loanOptions, setLoanOptions] = useState<SimpleOption[]>([])
  const [deductionOptions, setDeductionOptions] = useState<SimpleOption[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccountOption[]>([])

  // Mock data for tables (placeholder until backend wiring)
  const [allowances, setAllowances] = useState<AllowanceItem[]>([])
  const [commissions, setCommissions] = useState<CommissionItem[]>([])
  const [loans, setLoans] = useState<LoanItem[]>([])
  const [saturations, setSaturations] = useState<SaturationItem[]>([])
  const [others, setOthers] = useState<OtherItem[]>([])
  const [overtimes, setOvertimes] = useState<OvertimeItem[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    let cancelled = false

    const loadMasterData = async () => {
      try {
        const [payslipRes, allowanceRes, loanRes, deductionRes, bankRes] = await Promise.all([
          fetch('/api/payslip-types'),
          fetch('/api/allowance-options'),
          fetch('/api/loan-options'),
          fetch('/api/deduction-options'),
          fetch('/api/bank-accounts'),
        ])

        const [payslipJson, allowanceJson, loanJson, deductionJson, bankJson] =
          await Promise.all([
            payslipRes.json().catch(() => null),
            allowanceRes.json().catch(() => null),
            loanRes.json().catch(() => null),
            deductionRes.json().catch(() => null),
            bankRes.json().catch(() => null),
          ])

        if (!cancelled && payslipJson?.success && Array.isArray(payslipJson.data)) {
          setPayslipTypes(
            payslipJson.data.map((pt: any) => ({
              id: String(pt.id),
              name: String(pt.name ?? ''),
            })),
          )
        }

        if (!cancelled && allowanceJson?.success && Array.isArray(allowanceJson.data)) {
          setAllowanceOptions(
            allowanceJson.data.map((opt: any) => ({
              id: String(opt.id),
              name: String(opt.name ?? ''),
            })),
          )
        }

        if (!cancelled && loanJson?.success && Array.isArray(loanJson.data)) {
          setLoanOptions(
            loanJson.data.map((opt: any) => ({
              id: String(opt.id),
              name: String(opt.name ?? ''),
            })),
          )
        }

        if (!cancelled && deductionJson?.success && Array.isArray(deductionJson.data)) {
          setDeductionOptions(
            deductionJson.data.map((opt: any) => ({
              id: String(opt.id),
              name: String(opt.name ?? ''),
            })),
          )
        }

        if (!cancelled && bankJson?.success && Array.isArray(bankJson.data)) {
          const PAYROLL_BANK_COA_CODES = ['1120', '1121']

          const payrollBanks = bankJson.data.filter((acc: any) =>
            PAYROLL_BANK_COA_CODES.includes(String(acc.chartCode)),
          )

          setBankAccounts(
            payrollBanks.map((acc: any) => ({
              id: String(acc.id),
              name: String(acc.name ?? acc.bank ?? ''),
              bank: String(acc.bank ?? ''),
              accountNumber: String(acc.accountNumber ?? ''),
            })),
          )
        }
      } catch {
        // abaikan error master data, UI tetap jalan dengan opsi kosong
      }
    }

    loadMasterData()

    return () => {
      cancelled = true
    }
  }, [])

  // Sync initial values from employee (useful jika reload dari server)
  useEffect(() => {
    if (!employee) return

    if (employee.salaryType) {
      setPayrollType(employee.salaryType)
    }
    if (employee.basicSalary != null) {
      setBaseSalary(String(employee.basicSalary))
    }

    // Inisialisasi tabel dari data yang sudah ada di DB
    setAllowances(
      (employee.allowances || []).map((a: any) => ({
        id: String(a.id),
        employeeName: employee.name,
        allowanceOption: String(a.allowanceOptionId),
        title: String(a.title),
        type: String(a.type),
        amount: Number(a.amount ?? 0),
      })),
    )

    setCommissions(
      (employee.commissions || []).map((c: any) => ({
        id: String(c.id),
        employeeName: employee.name,
        title: String(c.title),
        type: String(c.type),
        amount: Number(c.amount ?? 0),
      })),
    )

    setLoans(
      (employee.loans || []).map((l: any) => ({
        id: String(l.id),
        employeeName: employee.name,
        loanOption: String(l.loanOptionId),
        title: String(l.title),
        type: String(l.type),
        amount: Number(l.amount ?? 0),
        reason: String(l.reason ?? ''),
      })),
    )

    setSaturations(
      (employee.saturationDeductions || []).map((s: any) => ({
        id: String(s.id),
        employeeName: employee.name,
        deductionOptionId: String(s.deductionOptionId),
        title: String(s.title),
        type: String(s.type),
        amount: Number(s.amount ?? 0),
      })),
    )

    setOthers(
      (employee.otherPayments || []).map((o: any) => ({
        id: String(o.id),
        employeeName: employee.name,
        title: String(o.title),
        type: String(o.type),
        amount: Number(o.amount ?? 0),
      })),
    )

    setOvertimes(
      (employee.overtimes || []).map((o: any) => ({
        id: String(o.id),
        employeeName: employee.name,
        title: String(o.title),
        days: Number(o.days ?? 0),
        hours: Number(o.hours ?? 0),
        rate: Number(o.rate ?? 0),
        amount: Number(o.days ?? 0) * Number(o.hours ?? 0) * Number(o.rate ?? 0),
      })),
    )
  }, [employee])

  // Preselect bank account berdasarkan data employee (accountNumber) jika ada
  useEffect(() => {
    if (bankAccount || bankAccounts.length === 0) {
      return
    }

    if (employee?.accountNumber) {
      const matched = bankAccounts.find(
        (acc) => acc.accountNumber === String(employee.accountNumber),
      )
      if (matched) {
        setBankAccount(matched.id)
        return
      }
    }

    // Fallback: select first payroll bank when employee has no account
    setBankAccount(bankAccounts[0]?.id ?? '')
  }, [bankAccounts, bankAccount, employee?.accountNumber])

  const handleAddAllowance = () => {
    if (!allowanceOption || !allowanceTitle || !allowanceType || !allowanceAmount) {
      toast.error('Semua field Allowance wajib diisi.')
      return
    }
    const newItem: AllowanceItem = {
      id: editingAllowanceId ?? Date.now().toString(),
      employeeName: employee.name,
      allowanceOption,
      title: allowanceTitle,
      type: allowanceType,
      amount: parseFloat(allowanceAmount),
    }

    const nextAllowances =
      editingAllowanceId == null
        ? [...allowances, newItem]
        : allowances.map((a) => (a.id === editingAllowanceId ? newItem : a))

    setAllowances(nextAllowances)
    setAllowanceOption('')
    setAllowanceTitle('')
    setAllowanceAmount('')
    setAllowanceType('Fixed')
    setShowAllowanceForm(false)
    setEditingAllowanceId(null)
    void handleSaveAll({ allowances: nextAllowances })
  }

  const handleAddCommission = () => {
    if (!commissionTitle || !commissionType || !commissionAmount) {
      toast.error('Semua field Commission wajib diisi.')
      return
    }
    const newItem: CommissionItem = {
      id: editingCommissionId ?? Date.now().toString(),
      employeeName: employee.name,
      title: commissionTitle,
      type: commissionType,
      amount: parseFloat(commissionAmount),
    }
    const nextCommissions =
      editingCommissionId == null
        ? [...commissions, newItem]
        : commissions.map((c) => (c.id === editingCommissionId ? newItem : c))
    setCommissions(nextCommissions)
    setCommissionTitle('')
    setCommissionAmount('')
    setCommissionType('Fixed')
    setShowCommissionForm(false)
    setEditingCommissionId(null)
    void handleSaveAll({ commissions: nextCommissions })
  }

  const handleAddLoan = () => {
    if (!loanOption || !loanTitle || !loanType || !loanAmount || !loanReason) {
      toast.error('Semua field Loan wajib diisi.')
      return
    }
    const newItem: LoanItem = {
      id: editingLoanId ?? Date.now().toString(),
      employeeName: employee.name,
      loanOption,
      title: loanTitle,
      type: loanType,
      amount: parseFloat(loanAmount),
      reason: loanReason,
    }
    const nextLoans =
      editingLoanId == null
        ? [...loans, newItem]
        : loans.map((l) => (l.id === editingLoanId ? newItem : l))
    setLoans(nextLoans)
    setLoanTitle('')
    setLoanAmount('')
    setLoanOption('')
    setLoanType('Fixed')
    setLoanReason('')
    setShowLoanForm(false)
    setEditingLoanId(null)
    void handleSaveAll({ loans: nextLoans })
  }

  const handleAddSaturation = () => {
    if (!saturationOption || !saturationTitle || !saturationType || !saturationAmount) {
      toast.error('Semua field Saturation Deduction wajib diisi.')
      return
    }
    const newItem: SaturationItem = {
      id: editingSaturationId ?? Date.now().toString(),
      employeeName: employee.name,
      deductionOptionId: saturationOption,
      title: saturationTitle,
      type: saturationType,
      amount: parseFloat(saturationAmount),
    }
    const nextSaturations =
      editingSaturationId == null
        ? [...saturations, newItem]
        : saturations.map((s) => (s.id === editingSaturationId ? newItem : s))
    setSaturations(nextSaturations)
    setSaturationOption('')
    setSaturationTitle('')
    setSaturationAmount('')
    setSaturationType('Fixed')
    setShowSaturationForm(false)
    setEditingSaturationId(null)
    void handleSaveAll({ saturations: nextSaturations })
  }

  const handleAddOther = () => {
    if (!otherTitle || !otherType || !otherAmount) {
      toast.error('Semua field Other Payment wajib diisi.')
      return
    }
    const newItem: OtherItem = {
      id: editingOtherId ?? Date.now().toString(),
      employeeName: employee.name,
      title: otherTitle,
      type: otherType,
      amount: parseFloat(otherAmount),
    }
    const nextOthers =
      editingOtherId == null
        ? [...others, newItem]
        : others.map((o) => (o.id === editingOtherId ? newItem : o))
    setOthers(nextOthers)
    setOtherTitle('')
    setOtherAmount('')
    setOtherType('Fixed')
    setShowOtherForm(false)
    setEditingOtherId(null)
    void handleSaveAll({ others: nextOthers })
  }

  const handleAddOvertime = () => {
    if (!overtimeTitle || !overtimeDays || !overtimeHours || !overtimeRate) {
      toast.error('Semua field Overtime wajib diisi.')
      return
    }
    const days = parseFloat(overtimeDays)
    const hours = parseFloat(overtimeHours)
    const rate = parseFloat(overtimeRate)
    const newItem: OvertimeItem = {
      id: editingOvertimeId ?? Date.now().toString(),
      employeeName: employee.name,
      title: overtimeTitle,
      days,
      hours,
      rate,
      amount: days * hours * rate,
    }
    const nextOvertimes =
      editingOvertimeId == null
        ? [...overtimes, newItem]
        : overtimes.map((o) => (o.id === editingOvertimeId ? newItem : o))
    setOvertimes(nextOvertimes)
    setOvertimeTitle('')
    setOvertimeDays('')
    setOvertimeHours('')
    setOvertimeRate('')
    setShowOvertimeForm(false)
    setEditingOvertimeId(null)
    void handleSaveAll({ overtimes: nextOvertimes })
  }

  const handleDeleteAllowance = (id: string) => {
    const next = allowances.filter((a) => a.id !== id)
    setAllowances(next)
    void handleSaveAll({ allowances: next })
  }

  const handleDeleteCommission = (id: string) => {
    const next = commissions.filter((c) => c.id !== id)
    setCommissions(next)
    void handleSaveAll({ commissions: next })
  }

  const handleDeleteLoan = (id: string) => {
    const next = loans.filter((l) => l.id !== id)
    setLoans(next)
    void handleSaveAll({ loans: next })
  }

  const handleDeleteSaturation = (id: string) => {
    const next = saturations.filter((s) => s.id !== id)
    setSaturations(next)
    void handleSaveAll({ saturations: next })
  }

  const handleDeleteOther = (id: string) => {
    const next = others.filter((o) => o.id !== id)
    setOthers(next)
    void handleSaveAll({ others: next })
  }

  const handleDeleteOvertime = (id: string) => {
    const next = overtimes.filter((o) => o.id !== id)
    setOvertimes(next)
    void handleSaveAll({ overtimes: next })
  }

  const handleSaveSalary = () => {
    if (!payrollType || !baseSalary || !bankAccount) {
      toast.error('Payslip Type, Salary, dan Bank Account wajib diisi.')
      return
    }
    setShowSalaryDialog(false)
    void handleSaveAll()
  }

  type SaveOverrides = {
    allowances?: AllowanceItem[]
    commissions?: CommissionItem[]
    loans?: LoanItem[]
    saturations?: SaturationItem[]
    others?: OtherItem[]
    overtimes?: OvertimeItem[]
  }

  const handleSaveAll = async (overrides?: SaveOverrides) => {
    if (!employee?.id) {
      toast.error('Data employee tidak valid.')
      return
    }
    if (!payrollType || !baseSalary) {
      toast.error('Payslip Type dan Salary wajib diisi.')
      return
    }
    if (!bankAccount) {
      toast.error('Bank Account wajib dipilih.')
      return
    }

    const basicSalaryNumber = Number(baseSalary)
    if (Number.isNaN(basicSalaryNumber) || basicSalaryNumber <= 0) {
      toast.error('Salary harus berupa angka lebih dari 0.')
      return
    }

    const allowList = overrides?.allowances ?? allowances
    const commList = overrides?.commissions ?? commissions
    const loanList = overrides?.loans ?? loans
    const satList = overrides?.saturations ?? saturations
    const otherList = overrides?.others ?? others
    const otList = overrides?.overtimes ?? overtimes

    const payload = {
      basicSalary: basicSalaryNumber,
      salaryType: payrollType,
      bankAccountId: bankAccount,
      allowances: allowList.map((a) => ({
        allowanceOptionId: a.allowanceOption,
        title: a.title,
        amount: a.amount,
        type: a.type,
      })),
      commissions: commList.map((c) => ({
        title: c.title,
        amount: c.amount,
        type: c.type,
      })),
      loans: loanList.map((l) => {
        const now = new Date()
        const end = new Date()
        end.setMonth(now.getMonth() + 6)
        return {
          loanOptionId: l.loanOption,
          title: l.title,
          amount: l.amount,
          startDate: now.toISOString(),
          endDate: end.toISOString(),
          reason: l.reason ?? '',
        }
      }),
      saturationDeductions: satList.map((s) => ({
        deductionOptionId: s.deductionOptionId,
        title: s.title,
        amount: s.amount,
        type: s.type,
      })),
      otherPayments: otherList.map((o) => ({
        title: o.title,
        amount: o.amount,
        type: o.type,
      })),
      overtimes: otList.map((o) => ({
        title: o.title,
        days: o.days,
        hours: o.hours,
        rate: o.rate,
      })),
    }

    try {
      const res = await fetch(`/api/hrm/payroll/set-salary/${employee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        const msg = json?.message ?? json?.error ?? `Gagal menyimpan (${res.status})`
        toast.error(msg)
        return
      }
      if (!json?.success) {
        toast.error(json?.message ?? 'Gagal menyimpan Set Salary.')
        return
      }

      toast.success('Data berhasil disimpan.')
    } catch (e) {
      console.error('Set salary save error:', e)
      toast.error('Terjadi kesalahan saat menyimpan.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Salary Card */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee Salary</CardTitle>
            <Button
              size="sm"
              className="p-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowSalaryDialog(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-start gap-4 text-sm">
              <div className="md:w-1/3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Payslip Type</p>
                <p className="text-sm text-foreground">{payrollType || '--'}</p>
              </div>
              <div className="md:w-1/3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Salary</p>
                <p className="text-sm text-foreground">
                  {baseSalary && Number(baseSalary) > 0
                    ? formatCurrency(Number(baseSalary))
                    : '--'}
                </p>
              </div>
              <div className="md:w-1/3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Account</p>
                <p className="text-sm text-foreground">
                  {bankAccount
                    ? (() => {
                        const acc = bankAccounts.find((a) => a.id === bankAccount)
                        if (!acc) return bankAccount
                        return `${acc.bank || acc.name} • ${acc.accountNumber}`
                      })()
                    : '--'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Create bank account {' '}
                  <a href="/accounting/bank-account?tab=account" className="font-medium text-blue-600">
                    here
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allowance Card */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Allowance</CardTitle>
            <Button
              size="sm"
              className="p-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingAllowanceId(null)
                setAllowanceOption('')
                setAllowanceTitle('')
                setAllowanceAmount('')
                setAllowanceType('Fixed')
                setShowAllowanceForm(true)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allowances.length > 0 ? allowances.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setEditingAllowanceId(item.id)
                              setAllowanceOption(item.allowanceOption)
                              setAllowanceTitle(item.title)
                              setAllowanceAmount(String(item.amount))
                              setAllowanceType(item.type)
                              setShowAllowanceForm(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            title={
                              deleteConfirmAllowanceId === item.id
                                ? 'Klik lagi untuk konfirmasi hapus'
                                : 'Hapus'
                            }
                            onClick={() =>
                              deleteConfirmAllowanceId === item.id
                                ? handleDeleteAllowance(item.id)
                                : setDeleteConfirmAllowanceId(item.id)
                            }
                          >
                            {deleteConfirmAllowanceId === item.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No Allowance Found!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Commission Card */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commission</CardTitle>
            <Button
              size="sm"
              className="p-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingCommissionId(null)
                setCommissionTitle('')
                setCommissionAmount('')
                setCommissionType('Fixed')
                setShowCommissionForm(true)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.length > 0 ? commissions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setEditingCommissionId(item.id)
                              setCommissionTitle(item.title)
                              setCommissionAmount(String(item.amount))
                              setCommissionType(item.type)
                              setShowCommissionForm(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            title={
                              deleteConfirmCommissionId === item.id
                                ? 'Klik lagi untuk konfirmasi hapus'
                                : 'Hapus'
                            }
                            onClick={() =>
                              deleteConfirmCommissionId === item.id
                                ? handleDeleteCommission(item.id)
                                : setDeleteConfirmCommissionId(item.id)
                            }
                          >
                            {deleteConfirmCommissionId === item.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No Commission Found!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Loan Card */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Loan</CardTitle>
            <Button
              size="sm"
              className="p-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingLoanId(null)
                setLoanOption('')
                setLoanTitle('')
                setLoanAmount('')
                setLoanType('Fixed')
                setLoanReason('')
                setShowLoanForm(true)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.length > 0 ? loans.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setEditingLoanId(item.id)
                              setLoanOption(item.loanOption)
                              setLoanTitle(item.title)
                              setLoanAmount(String(item.amount))
                              setLoanType(item.type)
                              setLoanReason(item.reason)
                              setShowLoanForm(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            title={
                              deleteConfirmLoanId === item.id
                                ? 'Klik lagi untuk konfirmasi hapus'
                                : 'Hapus'
                            }
                            onClick={() =>
                              deleteConfirmLoanId === item.id
                                ? handleDeleteLoan(item.id)
                                : setDeleteConfirmLoanId(item.id)
                            }
                          >
                            {deleteConfirmLoanId === item.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No Loan Data Found!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Saturation Deduction Card */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Saturation Deduction</CardTitle>
            <Button
              size="sm"
              className="p-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingSaturationId(null)
                setSaturationOption('')
                setSaturationTitle('')
                setSaturationAmount('')
                setSaturationType('Fixed')
                setShowSaturationForm(true)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saturations.length > 0 ? saturations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setEditingSaturationId(item.id)
                              setSaturationOption(item.deductionOptionId)
                              setSaturationTitle(item.title)
                              setSaturationAmount(String(item.amount))
                              setSaturationType(item.type)
                              setShowSaturationForm(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            title={
                              deleteConfirmSaturationId === item.id
                                ? 'Klik lagi untuk konfirmasi hapus'
                                : 'Hapus'
                            }
                            onClick={() =>
                              deleteConfirmSaturationId === item.id
                                ? handleDeleteSaturation(item.id)
                                : setDeleteConfirmSaturationId(item.id)
                            }
                          >
                            {deleteConfirmSaturationId === item.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No Saturation Deduction Found!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Other Payment Card */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Other Payment</CardTitle>
            <Button
              size="sm"
              className="p-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingOtherId(null)
                setOtherTitle('')
                setOtherAmount('')
                setOtherType('Fixed')
                setShowOtherForm(true)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {others.length > 0 ? others.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setEditingOtherId(item.id)
                              setOtherTitle(item.title)
                              setOtherAmount(String(item.amount))
                              setOtherType(item.type)
                              setShowOtherForm(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            title={
                              deleteConfirmOtherId === item.id
                                ? 'Klik lagi untuk konfirmasi hapus'
                                : 'Hapus'
                            }
                            onClick={() =>
                              deleteConfirmOtherId === item.id
                                ? handleDeleteOther(item.id)
                                : setDeleteConfirmOtherId(item.id)
                            }
                          >
                            {deleteConfirmOtherId === item.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No Other Payment Data Found!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Overtime Card */}
        <Card className={cardClass}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Overtime</CardTitle>
            <Button
              size="sm"
              className="p-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setEditingOvertimeId(null)
                setOvertimeTitle('')
                setOvertimeDays('')
                setOvertimeHours('')
                setOvertimeRate('')
                setShowOvertimeForm(true)
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overtimes.length > 0 ? overtimes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              setEditingOvertimeId(item.id)
                              setOvertimeTitle(item.title)
                              setOvertimeDays(String(item.days))
                              setOvertimeHours(String(item.hours))
                              setOvertimeRate(String(item.rate))
                              setShowOvertimeForm(true)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            title={
                              deleteConfirmOvertimeId === item.id
                                ? 'Klik lagi untuk konfirmasi hapus'
                                : 'Hapus'
                            }
                            onClick={() =>
                              deleteConfirmOvertimeId === item.id
                                ? handleDeleteOvertime(item.id)
                                : setDeleteConfirmOvertimeId(item.id)
                            }
                          >
                            {deleteConfirmOvertimeId === item.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No Overtime Data Found!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <Dialog open={showSalaryDialog} onOpenChange={setShowSalaryDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Set Employee Salary</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
            <div className="space-y-2">
              <Label>Payslip Type <span className="text-red-500">*</span></Label>
              <Select value={payrollType} onValueChange={setPayrollType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select payslip type" />
                </SelectTrigger>
                <SelectContent>
                  {payslipTypes.map((pt) => (
                    <SelectItem key={pt.id} value={pt.name}>
                      {pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Salary <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className="h-9"
                placeholder="Enter salary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Bank Account <span className="text-red-500">*</span></Label>
              <Select value={bankAccount} onValueChange={setBankAccount}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.bank || acc.name} — {acc.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowSalaryDialog(false)}
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveSalary}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAllowanceForm} onOpenChange={setShowAllowanceForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Allowance</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Allowance Options <span className="text-red-500">*</span></Label>
              <Select value={allowanceOption} onValueChange={setAllowanceOption}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select allowance option" />
                </SelectTrigger>
                <SelectContent>
                  {allowanceOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={allowanceTitle}
                onChange={(e) => setAllowanceTitle(e.target.value)}
                className="h-9"
                placeholder="Enter Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type <span className="text-red-500">*</span></Label>
              <Select value={allowanceType} onValueChange={setAllowanceType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={allowanceAmount}
                onChange={(e) => setAllowanceAmount(e.target.value)}
                className="h-9"
                placeholder="Enter Amount"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowAllowanceForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddAllowance}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommissionForm} onOpenChange={setShowCommissionForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Commission</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={commissionTitle}
                onChange={(e) => setCommissionTitle(e.target.value)}
                className="h-9"
                placeholder="Enter Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type <span className="text-red-500">*</span></Label>
              <Select value={commissionType} onValueChange={setCommissionType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={commissionAmount}
                onChange={(e) => setCommissionAmount(e.target.value)}
                className="h-9"
                placeholder="Enter Amount"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowCommissionForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddCommission}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoanForm} onOpenChange={setShowLoanForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Loan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input
                  value={loanTitle}
                  onChange={(e) => setLoanTitle(e.target.value)}
                  className="h-9"
                  placeholder="Enter Title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Loan Options <span className="text-red-500">*</span></Label>
                <Select
                  value={loanOption}
                  onValueChange={setLoanOption}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Loan Option" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type <span className="text-red-500">*</span></Label>
                <Select value={loanType} onValueChange={setLoanType}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fixed">Fixed</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loan Amount <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="h-9"
                  placeholder="Enter Amount"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason <span className="text-red-500">*</span></Label>
              <textarea
                value={loanReason}
                onChange={(e) => setLoanReason(e.target.value)}
                className="min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                rows={2}
                placeholder="Enter Reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowLoanForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddLoan}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaturationForm} onOpenChange={setShowSaturationForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Saturation Deduction</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Deduction Options <span className="text-red-500">*</span></Label>
              <Select
                value={saturationOption}
                onValueChange={setSaturationOption}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Deduction Option" />
                </SelectTrigger>
                <SelectContent>
                  {deductionOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={saturationTitle}
                onChange={(e) => setSaturationTitle(e.target.value)}
                className="h-9"
                placeholder="Enter Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type <span className="text-red-500">*</span></Label>
              <Select value={saturationType} onValueChange={setSaturationType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={saturationAmount}
                onChange={(e) => setSaturationAmount(e.target.value)}
                className="h-9"
                placeholder="Enter Amount"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowSaturationForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddSaturation}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOtherForm} onOpenChange={setShowOtherForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Other Payment</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={otherTitle}
                onChange={(e) => setOtherTitle(e.target.value)}
                className="h-9"
                placeholder="Enter Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type <span className="text-red-500">*</span></Label>
              <Select value={otherType} onValueChange={setOtherType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                  <SelectItem value="Percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={otherAmount}
                onChange={(e) => setOtherAmount(e.target.value)}
                className="h-9"
                placeholder="Enter Amount"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowOtherForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddOther}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOvertimeForm} onOpenChange={setShowOvertimeForm}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Overtime</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Overtime Title <span className="text-red-500">*</span></Label>
              <Input
                value={overtimeTitle}
                onChange={(e) => setOvertimeTitle(e.target.value)}
                className="h-9"
                placeholder="Enter Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Number of days <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={overtimeDays}
                onChange={(e) => setOvertimeDays(e.target.value)}
                className="h-9"
                placeholder="Enter Number of days"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hours <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
                className="h-9"
                placeholder="Enter Hours"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Rate <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(e.target.value)}
                className="h-9"
                placeholder="Enter Rate"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => setShowOvertimeForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddOvertime}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}