"use client"

import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Copy, Send } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { SmoothTab } from '@/components/ui/smooth-tab'

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

// Mock data - Harga dalam rupiah
const mockTransactions: ReferralTransaction[] = [
  {
    id: '1',
    company_name: 'Acme Corporation',
    referral_company_name: 'Tech Solutions Inc',
    plan_name: 'Gold',
    plan_price: 750000,
    commission: 10,
    commission_amount: 75000,
  },
  {
    id: '2',
    company_name: 'Global Enterprises',
    referral_company_name: 'Startup Company',
    plan_name: 'Platinum',
    plan_price: 1500000,
    commission: 10,
    commission_amount: 150000,
  },
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

  const handleApprove = (id: string) => {
    console.log('Approve payout request:', id)
  }

  const handleReject = (id: string) => {
    console.log('Reject payout request:', id)
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
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Company Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">
                        Referral Company Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Plan Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Plan Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Commission (%)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">
                        Commission Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((transaction, index) => (
                      <tr key={transaction.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{transaction.company_name}</td>
                        <td className="px-4 py-3">{transaction.referral_company_name}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-blue-100 text-blue-700">
                            {transaction.plan_name}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{formatPrice(transaction.plan_price)}</td>
                        <td className="px-4 py-3">{transaction.commission}%</td>
                        <td className="px-4 py-3">
                          {formatPrice(transaction.commission_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ),
        },
        {
          id: 'payout-request',
          title: 'Payout Request',
          content: (
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Company Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Requested Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">
                        Requested Amount
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayoutRequests.map((request, index) => (
                      <tr key={request.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{request.company_name}</td>
                        <td className="px-4 py-3">{formatDate(request.requested_date)}</td>
                        <td className="px-4 py-3">{formatPrice(request.requested_amount)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="blue"
                              size="sm"
                              className="shadow-none h-7"
                              onClick={() => handleApprove(request.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="shadow-none h-7"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ),
        },
        {
          id: 'settings',
          title: 'Settings',
          content: (
            <form onSubmit={handleSaveSettings}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Settings</CardTitle>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="is_enable">Enable</Label>
                  <Switch
                    id="is_enable"
                    checked={settings.is_enable}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, is_enable: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentage">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum_threshold_amount">
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
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guideline">GuideLines</Label>
                  <Textarea
                    id="guideline"
                    value={settings.guideline}
                    onChange={(e) => setSettings({ ...settings, guideline: e.target.value })}
                    placeholder="Enter guidelines"
                    rows={6}
                    disabled={!settings.is_enable}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  variant="blue"
                  className="shadow-none"
                  disabled={!settings.is_enable}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </form>
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
                    <h4 className="font-semibold mb-2">
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
                    <h4 className="font-semibold mb-4">Share Your Link</h4>
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
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Company Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Plan Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Plan Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">Commission (%)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium">
                        Commission Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTransactions.map((transaction, index) => (
                      <tr key={transaction.id} className="border-t hover:bg-muted/50">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{transaction.referral_company_name}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-blue-100 text-blue-700">
                            {transaction.plan_name}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{formatPrice(transaction.plan_price)}</td>
                        <td className="px-4 py-3">{transaction.commission}%</td>
                        <td className="px-4 py-3">
                          {formatPrice(transaction.commission_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                <CardTitle>Payout</CardTitle>
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
                          <h2 className="text-lg font-semibold mb-0">Commission Amount</h2>
                        </div>
                        <h3 className="text-xl font-semibold">
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
                          <h2 className="text-lg font-semibold mb-0">Paid Amount</h2>
                        </div>
                        <h3 className="text-xl font-semibold">
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Company Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Requested Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Requested Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPayoutRequests.map((request, index) => (
                        <tr key={request.id} className="border-t hover:bg-muted/50">
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3">{user?.name || 'Company'}</td>
                          <td className="px-4 py-3">{formatDate(request.requested_date)}</td>
                          <td className="px-4 py-3">
                            {request.status !== undefined && getStatusBadge(request.status)}
                          </td>
                          <td className="px-4 py-3">{formatPrice(request.requested_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Referral Program</h1>
                <p className="text-sm text-muted-foreground">
                  Manage referral program settings and transactions
                </p>
              </div>
            </div>

            {/* Tabs */}
            <Card>
              <CardContent className="p-0">
                <div className="px-4 pt-4">
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
