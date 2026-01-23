"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import SimplePagination from '@/components/ui/simple-pagination'

// Types
interface PlanRequest {
  id: string
  user_name: string
  plan_name: string
  total_users: number
  total_customers: number
  total_vendors: number
  total_clients: number
  duration: 'year' | 'month' | 'lifetime'
  date: string
}

// Mock data - Plan names sesuai dengan 4 plan yang ada: Free Plan, Silver, Gold, Platinum
// Ditambahkan lebih banyak data untuk demo pagination
const generateMockPlanRequests = (): PlanRequest[] => {
  const companies = [
    'Acme Corporation',
    'Tech Solutions Inc',
    'Global Enterprises',
    'Startup Company',
    'Digital Innovations',
    'Cloud Services Ltd',
    'Future Tech Corp',
    'Smart Solutions',
    'Innovation Hub',
    'Tech Ventures',
    'Digital Dynamics',
    'Modern Systems',
    'NextGen Technologies',
    'Advanced Solutions',
    'Elite Enterprises',
    'Prime Corporation',
    'Apex Industries',
    'Summit Business',
    'Peak Performance',
    'Top Tier Corp',
  ]
  
  const plans = ['Free Plan', 'Silver', 'Gold', 'Platinum']
  const durations: ('year' | 'month' | 'lifetime')[] = ['year', 'month', 'lifetime']
  
  return companies.map((company, index) => {
    const planIndex = index % plans.length
    const durationIndex = index % durations.length
    const planName = plans[planIndex]
    
    // Generate limits based on plan
    let total_users = 20
    let total_customers = 100
    let total_vendors = 50
    let total_clients = 25
    
    if (planName === 'Gold') {
      total_users = 50
      total_customers = 500
      total_vendors = 100
      total_clients = 50
    } else if (planName === 'Platinum') {
      total_users = -1
      total_customers = -1
      total_vendors = -1
      total_clients = -1
    } else if (planName === 'Free Plan') {
      total_users = 5
      total_customers = 5
      total_vendors = 5
      total_clients = 5
    }
    
    // Generate date (decreasing by day)
    const date = new Date('2024-01-15')
    date.setDate(date.getDate() - index)
    date.setHours(10 + (index % 12), 30 + (index % 30), 0)
    
    return {
      id: `${index + 1}`,
      user_name: company,
      plan_name: planName,
      total_users,
      total_customers,
      total_vendors,
      total_clients,
      duration: durations[durationIndex],
      date: date.toISOString().replace('T', ' ').substring(0, 19),
    }
  })
}

const mockPlanRequests = generateMockPlanRequests()

const formatLimit = (limit: number) => {
  if (limit === -1) return 'Unlimited'
  return limit.toString()
}

const formatDuration = (duration: string) => {
  switch (duration) {
    case 'year':
      return 'Yearly'
    case 'month':
      return 'Monthly'
    case 'lifetime':
      return 'Lifetime'
    default:
      return duration
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PlanRequestPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [planRequests, setPlanRequests] = useState<PlanRequest[]>(mockPlanRequests)
  
  // Calculate pagination
  const totalCount = planRequests.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedRequests = planRequests.slice(startIndex, endIndex)

  const handleApprove = (id: string) => {
    if (confirm('Are you sure you want to approve this plan request?')) {
      console.log('Approve plan request:', id)
      // Remove approved request from list
      setPlanRequests(planRequests.filter((r) => r.id !== id))
    }
  }

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this plan request?')) {
      console.log('Reject plan request:', id)
      // Remove rejected request from list
      setPlanRequests(planRequests.filter((r) => r.id !== id))
    }
  }
  
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
                <h1 className="text-2xl font-semibold">Plan Request</h1>
                <p className="text-sm text-muted-foreground">
                  Manage plan requests from companies
                </p>
              </div>
            </div>

            {/* Plan Requests Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Plan Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Total Users</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Total Customers</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Total Vendors</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Total Clients</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">Date</th>
                        <th className="px-4 py-3 text-center text-xs font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRequests.length > 0 ? (
                        paginatedRequests.map((request) => (
                          <tr key={request.id} className="border-t hover:bg-muted/50">
                            <td className="px-4 py-3">
                              <div className="font-medium">{request.user_name}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className="bg-blue-100 text-blue-700">
                                {request.plan_name}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatLimit(request.total_users)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatLimit(request.total_customers)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatLimit(request.total_vendors)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatLimit(request.total_clients)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {formatDuration(request.duration)}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {formatDate(request.date)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  title="Approve"
                                  onClick={() => handleApprove(request.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Reject"
                                  onClick={() => handleReject(request.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                            No plan requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="border-t px-4 py-3">
                  <SimplePagination
                    totalCount={totalCount}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size)
                      setCurrentPage(1) // Reset to first page when changing page size
                    }}
                    sizes={[5, 10, 25, 50]}
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

