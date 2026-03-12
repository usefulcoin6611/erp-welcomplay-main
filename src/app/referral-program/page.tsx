"use client"

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Copy, Send } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { PLAN_DATA } from '@/lib/plan-data'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

// Types
interface ReferralTransaction {
  id: string
  company_name: string
  referral_company_name: string
  plan_name: string
  plan_price: number
  commission: number
  commission_amount: number
}

interface PayoutRequest {
  id: string
  company_name: string
  requested_date: string
  requested_amount: number
  status?: number
}

interface ReferralSettings {
  is_enable: boolean
  percentage: number
  minimum_threshold_amount: number
  guideline: string
}

const planPriceByName = (planName: string) =>
  PLAN_DATA.find((plan) => plan.name === planName)?.price ?? 0

const buildReferralTransaction = (
  id: string,
  companyName: string,
  referralCompanyName: string,
  planName: string,
  commission: number,
): ReferralTransaction => {
  const planPrice = planPriceByName(planName)
  return {
    id,
    company_name: companyName,
    referral_company_name: referralCompanyName,
    plan_name: planName,
    plan_price: planPrice,
    commission,
    commission_amount: Math.round((planPrice * commission) / 100),
  }
}

// Mock data - Harga dalam rupiah
const mockTransactions: ReferralTransaction[] = [
  buildReferralTransaction('1', 'Acme Corporation', 'Tech Solutions Inc', 'Gold', 10),
  buildReferralTransaction('2', 'Global Enterprises', 'Startup Company', 'Platinum', 10),
]

const mockPayoutRequests: PayoutRequest[] = [
  {
    id: '1',
    company_name: 'Acme Corporation',
    requested_date: '2024-01-15',
    requested_amount: 50000,
    status: 0, // Pending
  },
  {
    id: '2',
    company_name: 'Tech Solutions Inc',
    requested_date: '2024-01-14',
    requested_amount: 100000,
    status: 1, // Approved
  },
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getStatusBadge = (status: number) => {
  switch (status) {
    case 0:
      return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
    case 1:
      return <Badge className="bg-green-100 text-green-700">Approved</Badge>
    case 2:
      return <Badge className="bg-red-100 text-red-700">Rejected</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
  }
}

export default function ReferralProgramPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get active tab from URL or default
  const activeTab = searchParams.get('tab') || (isSuperAdmin ? 'transaction' : 'guideline')

  const [settings, setSettings] = useState<ReferralSettings>({
    is_enable: true,
    percentage: 10,
    minimum_threshold_amount: 50000,
    guideline: 'Refer companies and earn commission on their subscription plans.',
  })

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.name || 'code'}`
    navigator.clipboard.writeText(link)
    alert('Link copied to clipboard!')
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Save settings:', settings)
  }

  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [payoutToAction, setPayoutToAction] = useState<string | null>(null)

  const handleApproveClick = (id: string) => {
    setPayoutToAction(id)
    setApproveDialogOpen(true)
  }

  const handleRejectClick = (id: string) => {
    setPayoutToAction(id)
    setRejectDialogOpen(true)
  }

  const handleConfirmApprove = () => {
    if (payoutToAction) {
      console.log('Approve payout request:', payoutToAction)
      setApproveDialogOpen(false)
      setPayoutToAction(null)
    }
  }

  const handleConfirmReject = () => {
    if (payoutToAction) {
      console.log('Reject payout request:', payoutToAction)
      setRejectDialogOpen(false)
      setPayoutToAction(null)
    }
  }

  // Handle tab change - update URL query params
  const handleTabChange = (tabId: string) => {
    router.push(`/referral-program?tab=${tabId}`, { scroll: false })
  }

  const tabItems = useMemo(() => (isSuperAdmin
    ? [
        {
          id: 'transaction',
          title: 'Transaction',
          content: (
            <div className="pt-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Referral Company Name</TableHead>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Plan Price</TableHead>
                      <TableHead>Commission (%)</TableHead>
                      <TableHead>Commission Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((transaction, index) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{transaction.company_name}</TableCell>
                        <TableCell>{transaction.referral_company_name}</TableCell>
                        <TableCell>
                          <Badge className={getPlanBadgeColors(transaction.plan_name)}>
                            {transaction.plan_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(transaction.plan_price)}</TableCell>
                        <TableCell>{transaction.commission}%</TableCell>
                        <TableCell>{formatPrice(transaction.commission_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ),
        },
        {
          id: 'payout-request',
          title: 'Payout Request',
          content: (
            <div className="pt-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Requested Amount</TableHead>
                      <TableHead className="w-32 text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayoutRequests.map((request, index) => (
                      <TableRow key={request.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{request.company_name}</TableCell>
                        <TableCell>{formatDate(request.requested_date)}</TableCell>
                        <TableCell>{formatPrice(request.requested_amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                              onClick={() => handleApproveClick(request.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                              onClick={() => handleRejectClick(request.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ),
        },
        {
          id: 'settings',
          title: 'Settings',
          content: (
            <Card>
              <form onSubmit={handleSaveSettings}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base font-medium leading-none">Settings</CardTitle>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="is_enable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable
                      </Label>
                      <Switch
                        id="is_enable"
                        checked={settings.is_enable}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, is_enable: checked })
                        }
                        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="percentage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Commission Percentage (%) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="percentage"
                        type="number"
                        value={settings.percentage}
                        onChange={(e) =>
                          setSettings({ ...settings, percentage: parseFloat(e.target.value) })
                        }
                        placeholder="Enter Commission Percentage"
                        required
                        disabled={!settings.is_enable}
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minimum_threshold_amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Minimum Threshold Amount <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="minimum_threshold_amount"
                        type="number"
                        value={settings.minimum_threshold_amount}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            minimum_threshold_amount: parseFloat(e.target.value),
                          })
                        }
                        placeholder="Enter Minimum Payout (Rupiah)"
                        required
                        disabled={!settings.is_enable}
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guideline" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      GuideLines
                    </Label>
                    <Textarea
                      id="guideline"
                      value={settings.guideline}
                      onChange={(e) => setSettings({ ...settings, guideline: e.target.value })}
                      placeholder="Enter guidelines"
                      rows={6}
                      disabled={!settings.is_enable}
                      className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button
                    type="submit"
                    variant="blue"
                    className="shadow-none ml-auto"
                    disabled={!settings.is_enable}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ),
        },
      ]
    : [
        {
          id: 'guideline',
          title: 'GuideLine',
          content: (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">
                      Refer {user?.name || 'Company'} and earn {settings.percentage}% per paid
                      signup!
                    </h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {settings.guideline}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border">
                  <CardContent className="p-4 flex flex-col justify-center h-full">
                    <h4 className="font-medium mb-4">Share Your Link</h4>
                    <div className="flex gap-2">
                      <Input
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${user?.name || 'code'}`}
                        readOnly
                        className="flex-1 text-sm"
                      />
                      <Button
                        type="button"
                        variant="blue"
                        size="sm"
                        className="shadow-none"
                        onClick={handleCopyLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {!settings.is_enable && (
                      <p className="text-sm text-red-500 mt-2 text-right">
                        Note: super admin has disabled the referral program.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ),
        },
        {
          id: 'referral-transaction',
          title: 'Referral Transaction',
          content: (
            <div className="pt-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Plan Price</TableHead>
                      <TableHead>Commission (%)</TableHead>
                      <TableHead>Commission Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((transaction, index) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{transaction.referral_company_name}</TableCell>
                        <TableCell>
                          <Badge className={getPlanBadgeColors(transaction.plan_name)}>
                            {transaction.plan_name}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(transaction.plan_price)}</TableCell>
                        <TableCell>{transaction.commission}%</TableCell>
                        <TableCell>{formatPrice(transaction.commission_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ),
        },
        {
          id: 'payout',
          title: 'Payout',
          content: (
            <div className="p-4 space-y-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium leading-none">Payout</CardTitle>
                <Button variant="blue" size="sm" className="shadow-none">
                  <Send className="h-4 w-4 mr-2" /> Send Request
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M17.2191 4.41309C17.219 4.35677 17.2355 4.30168 17.2667 4.25477C17.2979 4.20786 17.3423 4.17125 17.3942 4.14957C17.4462 4.12789 17.5035 4.12211 17.5587 4.13296C17.614 4.14381 17.6648 4.17081 17.7047 4.21054C17.7447 4.25026 17.7719 4.30094 17.783 4.35615C17.7941 4.41136 17.7886 4.46863 17.7672 4.52072C17.7458 4.5728 17.7094 4.61737 17.6627 4.64878C17.6159 4.68018 17.5609 4.69702 17.5046 4.69716C17.4291 4.69727 17.3566 4.66742 17.3031 4.61417C17.2496 4.56091 17.2194 4.4886 17.2191 4.41309Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Total</span>
                          <h2 className="text-lg font-medium mb-0">Commission Amount</h2>
                        </div>
                        <h3 className="text-xl font-medium">
                          {formatPrice(150000)}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M21.0314 3.18164H4.00171C3.172 3.18164 2.5 3.85364 2.5 4.67993V9.11307C2.5 9.93935 3.172 10.6114 4.00171 10.6114H6.15143V8.22507H5.71943C4.98914 8.22507 4.39257 7.6285 4.39257 6.89821C4.39257 6.54507 4.52971 6.2125 4.78343 5.96221C5.03371 5.71193 5.36629 5.57136 5.71943 5.57136H6.32286H18.7069H19.3069C20.0406 5.57136 20.6371 6.16793 20.6371 6.89821C20.6371 7.25136 20.5 7.58393 20.2463 7.83421C19.996 8.0845 19.66 8.22507 19.3069 8.22507H18.8783V10.6114H21.0349C21.8611 10.6114 22.5331 9.93935 22.5331 9.11307V4.67993C22.5331 3.85364 21.8577 3.18164 21.0314 3.18164Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground block mb-1">Paid</span>
                          <h2 className="text-lg font-medium mb-0">Paid Amount</h2>
                        </div>
                        <h3 className="text-xl font-medium">
                          {formatPrice(50000)}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardContent>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPayoutRequests.map((request, index) => (
                        <TableRow key={request.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{user?.name || 'Company'}</TableCell>
                          <TableCell>{formatDate(request.requested_date)}</TableCell>
                          <TableCell>
                            {request.status !== undefined && getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>{formatPrice(request.requested_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </div>
          ),
        },
      ]), [isSuperAdmin, user?.name, settings])

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
            {/* Tabs */}
            <Card className="rounded-lg">
              <CardContent className="p-0">
                <div className="px-4 pt-4 pb-0">
                  <SmoothTab
                    items={tabItems}
                    defaultTabId={activeTab}
                    onChange={handleTabChange}
                    activeColor="bg-white dark:bg-gray-700 shadow-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>

      {/* Approve Payout Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this payout request? This will process the payment to the company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPayoutToAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApprove}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Payout Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this payout request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPayoutToAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              className="bg-red-500 hover:bg-red-600"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}


