"use client"

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Search, PiggyBank, Wallet, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { PLAN_DATA } from '@/lib/plan-data'
import { useAuth } from '@/contexts/auth-context'
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

interface Transaction {
  id: string
  company_name: string
  plan_name: string
  plan_price: number
  commission_percent: number
  commission_amount: number
  date: string
}

interface PayoutRequest {
  id: string
  company_name: string
  requested_date: string
  requested_amount: number
  status: 'Approved' | 'Rejected' | 'In Progress'
}

interface ReferralSettings {
  isEnable: boolean
  percentage: number
  minimumThreshold: number
  guideline: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Transaction Component
function TransactionContent({ transactions, isLoading }: { transactions: Transaction[], isLoading: boolean }) {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data
  const filteredData = transactions.filter((transaction) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      transaction.company_name.toLowerCase().includes(q) ||
      transaction.plan_name.toLowerCase().includes(q)
    )
  })

  // Paginated data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  if (isLoading) {
    return (
      <Card className="shadow-none min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Referral Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Page Size Controls */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">entries per page</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 w-64 border-0 focus-visible:border-0 focus-visible:ring-0 bg-gray-50 hover:bg-gray-100 shadow-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>COMPANY NAME</TableHead>
                <TableHead>PLAN NAME</TableHead>
                <TableHead>PLAN PRICE</TableHead>
                <TableHead>COMMISSION (%)</TableHead>
                <TableHead>COMMISSION AMOUNT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((transaction, idx) => {
                  const actualIndex = (currentPage - 1) * pageSize + idx + 1
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{actualIndex}</TableCell>
                      <TableCell>{transaction.company_name}</TableCell>
                      <TableCell>
                        <Badge className={getPlanBadgeColors(transaction.plan_name)}>
                          {transaction.plan_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.plan_price)}</TableCell>
                      <TableCell>{transaction.commission_percent}</TableCell>
                      <TableCell>{formatCurrency(transaction.commission_amount)}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        {filteredData.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{' '}
            entries
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Payout Request Component
function PayoutRequestContent({ payouts, isLoading }: { payouts: PayoutRequest[], isLoading: boolean }) {
  // Calculate totals
  const totalCommissionAmount = payouts.reduce(
    (sum, req) => sum + req.requested_amount,
    0
  )
  const paidAmount = payouts
    .filter((req) => req.status === 'Approved')
    .reduce((sum, req) => sum + req.requested_amount, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Approved
          </span>
        )
      case 'Rejected':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            Rejected
          </span>
        )
      case 'In Progress':
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
            In Progress
          </span>
        )
      default:
        return <span>{status}</span>
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-none min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Commission Amount Card */}
        <Card className="bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Commission Amount</p>
                <p className="text-3xl font-bold text-pink-700 dark:text-pink-300">
                  {formatCurrency(totalCommissionAmount)}
                </p>
              </div>
              <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-lg">
                <PiggyBank className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paid Amount Card */}
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Paid Amount</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(paidAmount)}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History Table */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>COMPANY NAME</TableHead>
                  <TableHead>REQUESTED DATE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>REQUESTED AMOUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((request, idx) => (
                    <TableRow key={request.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{request.company_name}</TableCell>
                      <TableCell>{new Date(request.requested_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{formatCurrency(request.requested_amount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// GuideLine Component
function ReferralSettingsContent({ settings, isLoading }: { settings: ReferralSettings | null, isLoading: boolean }) {
  const { user } = useAuth()
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user?.name || 'code'}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    alert('Referral link copied to clipboard!')
  }

  if (isLoading || !settings) {
    return (
      <Card className="shadow-none min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <Card className="shadow-none">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Referral Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              Refer and earn {settings.percentage}% per paid signup!
            </h3>
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {settings.guideline}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Minimum payout threshold: {formatCurrency(settings.minimumThreshold)}
            </p>
          </div>

          {/* Right Column - Share Your Link */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Share Your Link</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={referralLink}
                  readOnly
                  className="pr-10 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ReferralProgramContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subTabParam = searchParams.get('subtab')
  const activeSubTab = subTabParam || 'transaction'

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [settings, setSettings] = useState<ReferralSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [transRes, payoutRes, settingsRes] = await Promise.all([
          fetch('/api/referral/transactions'),
          fetch('/api/referral/payouts'),
          fetch('/api/referral/settings')
        ])

        const transJson = await transRes.json()
        const payoutJson = await payoutRes.json()
        const settingsJson = await settingsRes.json()

        if (transJson.success) {
          setTransactions(transJson.data.map((t: any) => ({
            id: t.id,
            company_name: t.refereeCompanyName,
            plan_name: t.planName,
            plan_price: t.planPrice,
            commission_percent: t.commissionPercent,
            commission_amount: t.commissionAmount,
            date: t.date
          })))
        }

        if (payoutJson.success) {
          setPayouts(payoutJson.data.map((p: any) => ({
            id: p.id,
            company_name: p.companyName,
            requested_date: p.requestedDate,
            requested_amount: p.requestedAmount,
            status: p.status
          })))
        }

        if (settingsJson.success) {
          setSettings(settingsJson.data)
        }
      } catch (error) {
        console.error("Error fetching referral data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const referralMenuItems = [
    { id: 'transaction', label: 'Referral Transaction' },
    { id: 'payout', label: 'Payout' },
    { id: 'guideline', label: 'GuideLine' },
  ]

  const handleMenuClick = (itemId: string) => {
    router.push(`/settings?tab=referral-program&subtab=${itemId}`, { scroll: false })
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'transaction':
        return <TransactionContent transactions={transactions} isLoading={isLoading} />
      case 'payout':
        return <PayoutRequestContent payouts={payouts} isLoading={isLoading} />
      case 'guideline':
        return <ReferralSettingsContent settings={settings} isLoading={isLoading} />
      default:
        return <TransactionContent transactions={transactions} isLoading={isLoading} />
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      {/* Vertical Sidebar - col-xl-3 (25%) */}
      <div className="xl:col-span-3">
        <Card className="h-fit xl:sticky xl:top-6 border-r shadow-none">
          <CardContent className="p-0">
            <div className="space-y-0">
              {referralMenuItems.map((item) => {
                const isActive = activeSubTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-0 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="text-blue-600 dark:text-blue-400">→</span>}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Area - col-xl-9 (75%) */}
      <div className="xl:col-span-9 space-y-4">{renderContent()}</div>
    </div>
  )
}

export function ReferralProgramTab() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReferralProgramContent />
    </Suspense>
  )
}
