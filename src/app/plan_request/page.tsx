"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

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
const mockPlanRequests: PlanRequest[] = [
  {
    id: '1',
    user_name: 'Acme Corporation',
    plan_name: 'Gold',
    total_users: 50,
    total_customers: 500,
    total_vendors: 100,
    total_clients: 50,
    duration: 'year',
    date: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    user_name: 'Tech Solutions Inc',
    plan_name: 'Platinum',
    total_users: -1,
    total_customers: -1,
    total_vendors: -1,
    total_clients: -1,
    duration: 'month',
    date: '2024-01-14 14:20:00',
  },
  {
    id: '3',
    user_name: 'Global Enterprises',
    plan_name: 'Silver',
    total_users: 20,
    total_customers: 100,
    total_vendors: 50,
    total_clients: 25,
    duration: 'month',
    date: '2024-01-13 09:15:00',
  },
  {
    id: '4',
    user_name: 'Startup Company',
    plan_name: 'Gold',
    total_users: 50,
    total_customers: 500,
    total_vendors: 100,
    total_clients: 50,
    duration: 'month',
    date: '2024-01-12 16:45:00',
  },
]

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
                      {mockPlanRequests.length > 0 ? (
                        mockPlanRequests.map((request) => (
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
                                  variant="blue"
                                  size="sm"
                                  className="shadow-none h-7"
                                  title="Approve"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="shadow-none h-7"
                                  title="Reject"
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
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
