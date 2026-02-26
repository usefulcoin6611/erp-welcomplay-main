"use client"

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Search, PiggyBank, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { PLAN_DATA } from '@/lib/plan-data'
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
}

interface PayoutRequest {
  id: string
  company_name: string
  requested_date: string
  requested_amount: number
  status: 'Approved' | 'Rejected' | 'In Progress'
}

const planPriceByName = (planName: string) =>
  PLAN_DATA.find((plan) => plan.name === planName)?.price ?? 0

const buildTransaction = (
  id: string,
  companyName: string,
  planName: string,
  commissionPercent: number,
): Transaction => {
  const planPrice = planPriceByName(planName)
  return {
    id,
    company_name: companyName,
    plan_name: planName,
    plan_price: planPrice,
    commission_percent: commissionPercent,
    commission_amount: Math.round((planPrice * commissionPercent) / 100),
  }
}

const mockTransactions: Transaction[] = [
  buildTransaction('1', 'Murray Group', 'Gold', 10),
  buildTransaction('2', 'ABHISHEK DWIVEDI', 'Silver', 10),
  buildTransaction('3', 'Shaine Mcdowell', 'Gold', 10),
  buildTransaction('4', 'Nerea Hart', 'Platinum', 10),
]

const mockPayoutRequests: PayoutRequest[] = [
  {
    id: '1',
    company_name: 'Workdo',
    requested_date: '2024-04-10',
    requested_amount: 50000,
    status: 'Approved',
  },
  {
    id: '2',
    company_name: 'Workdo',
    requested_date: '2024-04-10',
    requested_amount: 25000,
    status: 'Rejected',
  },
  {
    id: '3',
    company_name: 'Workdo',
    requested_date: '2024-04-10',
    requested_amount: 100000,
    status: 'Approved',
  },
  {
    id: '4',
    company_name: 'Workdo',
    requested_date: '2024-04-10',
    requested_amount: 75000,
    status: 'In Progress',
  },
]

// Transaction Component
function TransactionContent() {
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate commission amount: (plan_price * commission_percent) / 100
  const calculateCommissionAmount = (planPrice: number, commissionPercent: number) => {
    return (planPrice * commissionPercent) / 100
  }

  // Filter data
  const filteredData = mockTransactions.filter((transaction) => {
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

  return (
    <Card>
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
                  const commissionAmount = calculateCommissionAmount(
                    transaction.plan_price,
                    transaction.commission_percent
                  )
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
                      <TableCell>{formatCurrency(commissionAmount)}</TableCell>
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
function PayoutRequestContent() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate totals
  const totalCommissionAmount = mockPayoutRequests.reduce(
    (sum, req) => sum + req.requested_amount,
    0
  )
  const paidAmount = mockPayoutRequests
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Commission Amount Card */}
        <Card className="bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800">
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
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
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
      <Card>
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
                {mockPayoutRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No payout requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  mockPayoutRequests.map((request, idx) => (
                    <TableRow key={request.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{request.company_name}</TableCell>
                      <TableCell>{request.requested_date}</TableCell>
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
function ReferralSettingsContent() {
  const [referralLink] = useState('https://welcomplay.com')
  const [commissionPercent] = useState('10')
  const [commissionAmount] = useState('10')

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    alert('Referral link copied to clipboard!')
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Referral Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              Refer Global Exports and earn {commissionPercent}% per paid signup!
            </h3>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-sm">
                Refer new users to us and earn {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(commissionAmount))} for each successful referral.
                (Commission amount in Rupiah - set commission amount)
              </li>
              <li className="text-sm">Share your link and start earning today!</li>
            </ol>
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
        return <TransactionContent />
      case 'payout':
        return <PayoutRequestContent />
      case 'guideline':
        return <ReferralSettingsContent />
      default:
        return <TransactionContent />
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      {/* Vertical Sidebar - col-xl-3 (25%) */}
      <div className="xl:col-span-3">
        <Card className="h-fit xl:sticky xl:top-6 border-r">
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

