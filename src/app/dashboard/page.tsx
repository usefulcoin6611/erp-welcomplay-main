"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconRocket, IconListCheck, IconEye } from "@tabler/icons-react"
import { Building2, Users, FileText, ShoppingCart, TrendingUp, DollarSign } from "lucide-react"
import dynamic from 'next/dynamic'
import React from 'react'
import { useAuth } from '@/contexts/auth-context'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { EventCalendar } from '@/components/event-calendar'

// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

type SuperAdminDashboard = {
  totalCompanies: number
  paidCompanies: number
  totalOrders: number
  totalRevenue: number
  totalPlans: number
  mostPopularPlan: string
  recentOrdersChart: { labels: string[]; data: number[] }
}

const defaultSuperAdmin: SuperAdminDashboard = {
  totalCompanies: 0,
  paidCompanies: 0,
  totalOrders: 0,
  totalRevenue: 0,
  totalPlans: 0,
  mostPopularPlan: "-",
  recentOrdersChart: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [0, 0, 0, 0, 0, 0, 0] },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === "super admin"
  const isClient = user?.type === "client"
  const [mounted, setMounted] = useState(false)
  const [superAdminData, setSuperAdminData] = useState<SuperAdminDashboard>(defaultSuperAdmin)
  const [superAdminLoading, setSuperAdminLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isSuperAdmin) {
      if (!isSuperAdmin) setSuperAdminLoading(false)
      return
    }
    let cancelled = false
    setSuperAdminLoading(true)
    fetch("/api/dashboard/super-admin", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success || !json.data) return
        setSuperAdminData({
          totalCompanies: json.data.totalCompanies ?? 0,
          paidCompanies: json.data.paidCompanies ?? 0,
          totalOrders: json.data.totalOrders ?? 0,
          totalRevenue: json.data.totalRevenue ?? 0,
          totalPlans: json.data.totalPlans ?? 0,
          mostPopularPlan: json.data.mostPopularPlan ?? "-",
          recentOrdersChart: json.data.recentOrdersChart ?? defaultSuperAdmin.recentOrdersChart,
        })
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSuperAdminLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mounted, isSuperAdmin])

  // Mock data - in production, this would come from an API
  const dashboardData = {
    stats: {
      totalDeals: 12,
      totalTasks: 45,
    },
    projectProgress: {
      totalProjects: 75,
      totalProjectTasks: 85,
      totalBugs: 12,
    },
    tasksOverview: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          name: 'Completed',
          data: [5, 8, 12, 10, 15, 8, 10]
        },
        {
          name: 'Pending',
          data: [3, 5, 8, 6, 10, 5, 7]
        },
        {
          name: 'In Progress',
          data: [7, 10, 15, 12, 18, 10, 13]
        }
      ]
    },
    projectStatus: {
      labels: ['On Going', 'On Hold', 'Completed', 'Cancelled'],
      series: [45, 15, 30, 10]
    },
    topDueProjects: [
      { id: 1, name: 'Website Redesign', remainTask: 8, dueDate: '2026-02-15', status: 'In Progress' },
      { id: 2, name: 'Mobile App Development', remainTask: 15, dueDate: '2026-03-01', status: 'In Progress' },
      { id: 3, name: 'API Integration', remainTask: 5, dueDate: '2026-01-25', status: 'In Progress' },
    ],
    topDueTasks: [
      { id: 1, name: 'Design Homepage', assignedTo: ['John', 'Sarah'], stage: 'In Progress' },
      { id: 2, name: 'Implement Authentication', assignedTo: ['Mike'], stage: 'To Do' },
      { id: 3, name: 'Write Documentation', assignedTo: ['Lisa', 'Tom'], stage: 'Review' },
    ]
  }

  // Tasks Overview Chart Options
  const tasksChartOptions = {
    chart: {
      height: 250,
      type: 'area' as const,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2,
      curve: 'smooth' as const
    },
    xaxis: {
      categories: dashboardData.tasksOverview.labels,
      title: {
        text: 'Days'
      }
    },
    yaxis: {
      title: {
        text: 'Tasks'
      }
    },
    colors: ['#6fd944', '#883617', '#4e37b9'],
    grid: {
      strokeDashArray: 4,
    },
    legend: {
      show: true,
      position: 'top' as const
    },
    tooltip: {
      theme: 'light'
    }
  }

  // Project Status Donut Chart Options
  const projectStatusOptions = {
    chart: {
      height: 250,
      type: 'donut' as const,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
        }
      }
    },
    colors: ["#bd9925", "#2f71bd", "#720d3a", "#ef4917"],
    labels: dashboardData.projectStatus.labels,
    legend: {
      show: true,
      position: 'bottom' as const
    },
    tooltip: {
      theme: 'light'
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Super Admin Dashboard */}
            {isSuperAdmin ? (
              <div className="space-y-8">
                {superAdminLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="rounded-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-2" />
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Stats Cards - Minimalist Design */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Total Companies */}
                      <Card className="rounded-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 font-medium">Total Companies</p>
                              <h3 className="text-3xl font-semibold text-gray-900">{superAdminData.totalCompanies}</h3>
                              <p className="text-xs text-gray-500 mt-2">
                                Paid Users: <span className="font-medium text-gray-700">{superAdminData.paidCompanies}</span>
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Total Orders */}
                      <Card className="rounded-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
                              <h3 className="text-3xl font-semibold text-gray-900">{superAdminData.totalOrders}</h3>
                              <p className="text-xs text-gray-500 mt-2">
                                Amount: <span className="font-medium text-gray-700">
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(superAdminData.totalRevenue)}
                                </span>
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Total Plans */}
                      <Card className="rounded-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 font-medium">Total Plans</p>
                              <h3 className="text-3xl font-semibold text-gray-900">{superAdminData.totalPlans}</h3>
                              <p className="text-xs text-gray-500 mt-2">
                                Most Popular: <span className="font-medium text-gray-700">{superAdminData.mostPopularPlan}</span>
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Order Chart - Clean Design */}
                    <Card className="rounded-lg">
                      <CardHeader className="p-3">
                        <CardTitle className="text-lg font-medium text-gray-900">Recent Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Chart
                          options={{
                            chart: {
                              height: 300,
                              type: "area",
                              toolbar: { show: false },
                              fontFamily: "inherit",
                            },
                            dataLabels: { enabled: false },
                            stroke: { width: 2, curve: "smooth" },
                            xaxis: {
                              categories: superAdminData.recentOrdersChart.labels,
                              labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                            },
                            yaxis: {
                              labels: { style: { colors: "#6b7280", fontSize: "12px" } },
                            },
                            colors: ["#3b82f6"],
                            grid: {
                              strokeDashArray: 4,
                              borderColor: "#f3f4f6",
                            },
                            legend: { show: false },
                            tooltip: {
                              theme: "light",
                              style: { fontSize: "12px" },
                            },
                          }}
                          series={[
                            {
                              name: "Income",
                              data: superAdminData.recentOrdersChart.data,
                            },
                          ]}
                          type="area"
                          height={300}
                        />
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards - Reference Style */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Total Deals */}
                  <Card className="rounded-lg md:col-span-3 bg-pink-50 border-0 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-100 rounded-tl-full opacity-50"></div>
                    <CardContent className="p-3 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <IconRocket className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-0.5">Total</p>
                            <h3 className="text-base font-semibold text-gray-900">Deal</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-gray-900">{dashboardData.stats.totalDeals}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Tasks */}
                  <Card className="rounded-lg md:col-span-3 bg-green-50 border-0 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-100 rounded-tl-full opacity-50"></div>
                    <CardContent className="p-3 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <IconListCheck className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-medium mb-0.5">Total</p>
                            <h3 className="text-base font-semibold text-gray-900">Deal Task</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-gray-900">{dashboardData.stats.totalTasks}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Project Progress - Horizontal Layout */}
                  <Card className="rounded-lg md:col-span-6 border-0">
                    <CardHeader className="p-2.5 pb-1.5">
                      <CardTitle className="text-sm font-medium text-gray-900">Project Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-2.5">
                      <div className="grid grid-cols-3 gap-4">
                        {/* Total Project */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Total Project</span>
                            <span className="font-semibold text-green-600">{dashboardData.projectProgress.totalProjects}%</span>
                          </div>
                          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-green-100">
                            <div 
                              className="h-full bg-green-500 transition-all rounded-full"
                              style={{ width: `${dashboardData.projectProgress.totalProjects}%` }}
                            />
                          </div>
                        </div>

                        {/* Total Project Tasks */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Total Project Tasks</span>
                            <span className="font-semibold text-orange-500">{dashboardData.projectProgress.totalProjectTasks}%</span>
                          </div>
                          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
                            <div 
                              className="h-full bg-orange-500 transition-all rounded-full"
                              style={{ width: `${dashboardData.projectProgress.totalProjectTasks}%` }}
                            />
                          </div>
                        </div>

                        {/* Total Bugs */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Total Bugs</span>
                            <span className="font-semibold text-blue-500">{dashboardData.projectProgress.totalBugs}%</span>
                          </div>
                          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
                            <div 
                              className="h-full bg-blue-500 transition-all rounded-full"
                              style={{ width: `${dashboardData.projectProgress.totalBugs}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Calendar and Charts - Using 12 column grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Calendar - 8 columns */}
                  <div className="lg:col-span-8">
                    <EventCalendar events={[
                      { id: "1", title: "Team Meeting", date: new Date().toISOString().split('T')[0], time: "09:00", type: "meeting" },
                      { id: "2", title: "Project Review", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "10:30", type: "meeting" },
                    ]} />
                  </div>

                  {/* Project Status Chart - 4 columns */}
                  <Card className="rounded-lg lg:col-span-4 border-0">
                    <CardHeader className="pb-2 px-3 py-2">
                      <div className="flex items-center justify-between w-full">
                        <CardTitle className="text-sm font-medium text-gray-900">Project Status</CardTitle>
                        <span className="text-xs text-gray-500">Year - 2026</span>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <div className="flex items-center gap-3 py-1">
                        {/* Donut Chart - Left side */}
                        <div className="flex-shrink-0 w-[200px] h-[200px]">
                          <Chart
                            options={{
                              ...projectStatusOptions,
                              chart: {
                                ...projectStatusOptions.chart,
                                height: 200,
                                width: 200,
                              },
                              colors: ['#fbbf24', '#60a5fa', '#f87171', '#34d399'],
                              legend: {
                                show: false,
                              },
                            }}
                            series={dashboardData.projectStatus.series}
                            type="donut"
                            height={200}
                            width={200}
                          />
                        </div>
                        
                        {/* Custom Legend - Right side */}
                        <div className="flex flex-col gap-2.5 flex-1 ml-auto">
                          {dashboardData.projectStatus.labels.map((label, index) => {
                            const colors = ['#fbbf24', '#60a5fa', '#f87171', '#34d399']
                            return (
                              <div key={index} className="flex items-center gap-2.5">
                                <div 
                                  className="w-4 h-4 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: colors[index] }}
                                />
                                <span className="text-sm text-gray-700 font-medium">{label}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tasks Overview - Full Width */}
                <Card className="rounded-lg border-0">
                  <CardHeader className="pb-2 px-3 py-2">
                    <div className="flex items-center justify-between w-full">
                      <CardTitle className="text-sm font-medium text-gray-900">Tasks Overview</CardTitle>
                      <span className="text-xs text-gray-500">Last 7 Days</span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <Chart
                      options={{
                        ...tasksChartOptions,
                        chart: {
                          ...tasksChartOptions.chart,
                          height: 200,
                          fontFamily: 'inherit',
                        },
                        colors: ['#34d399', '#fbbf24', '#60a5fa'],
                        grid: {
                          strokeDashArray: 4,
                          borderColor: '#f3f4f6',
                        },
                        xaxis: {
                          ...tasksChartOptions.xaxis,
                          labels: { 
                            style: { colors: '#6b7280', fontSize: '11px' },
                          },
                        },
                        yaxis: {
                          ...tasksChartOptions.yaxis,
                          labels: { 
                            style: { colors: '#6b7280', fontSize: '11px' },
                          },
                        },
                        legend: {
                          show: true,
                          position: 'top',
                          fontSize: '11px',
                          fontFamily: 'inherit',
                          labels: { colors: '#6b7280' },
                          itemMargin: {
                            horizontal: 10,
                            vertical: 0,
                          },
                          markers: {
                            width: 8,
                            height: 8,
                            radius: 4,
                          },
                        },
                      }}
                      series={dashboardData.tasksOverview.datasets}
                      type="area"
                      height={200}
                    />
                  </CardContent>
                </Card>

                {/* Top Due Projects */}
                <Card className="rounded-lg">
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg font-medium text-gray-900">Top Due Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.topDueProjects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{project.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{project.remainTask} tasks remaining</span>
                              <span>•</span>
                              <span>{project.dueDate}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <IconEye className="h-4 w-4 text-gray-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Due Tasks */}
                <Card className="rounded-lg">
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg font-medium text-gray-900">Top Due Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.topDueTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{task.name}</h4>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Assigned to:</span>
                                <div className="flex -space-x-2">
                                  {task.assignedTo.map((person, idx) => (
                                    <div
                                      key={idx}
                                      className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium border-2 border-white"
                                      title={person}
                                    >
                                      {person.charAt(0)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">{task.stage}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
