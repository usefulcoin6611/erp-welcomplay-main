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

// Import ApexCharts dynamically to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function DashboardPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  const isClient = user?.type === 'client'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold">
                {isSuperAdmin 
                  ? 'Super Admin Dashboard' 
                  : isClient 
                    ? 'Client Dashboard' 
                    : 'Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                {isSuperAdmin
                  ? 'Overview of your SaaS platform management'
                  : isClient
                    ? 'Overview of your deals, projects, and tasks'
                    : 'Overview of your projects and tasks'}
              </p>
            </div>

            {/* Super Admin Dashboard */}
            {isSuperAdmin ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Total Companies */}
                  <Card className="h-full hover:bg-gray-50 transition-all duration-200 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        {/* Top: Icon and Value side by side */}
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                            <Users className="w-6 h-6 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 flex-1 text-center">24</h3>
                        </div>
                        
                        {/* Bottom: Description */}
                        <p className="text-xs font-medium text-muted-foreground leading-tight break-words">
                          Total Companies
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Paid Users: <span className="font-semibold text-gray-900">18</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Orders */}
                  <Card className="h-full hover:bg-gray-50 transition-all duration-200 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        {/* Top: Icon and Value side by side */}
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                            <ShoppingCart className="w-6 h-6 text-green-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 flex-1 text-center">156</h3>
                        </div>
                        
                        {/* Bottom: Description */}
                        <p className="text-xs font-medium text-muted-foreground leading-tight break-words">
                          Total Orders
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Order Amount: <span className="font-semibold text-gray-900">$45,230</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Plans */}
                  <Card className="h-full hover:bg-gray-50 transition-all duration-200 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        {/* Top: Icon and Value side by side */}
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
                            <FileText className="w-6 h-6 text-purple-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 flex-1 text-center">4</h3>
                        </div>
                        
                        {/* Bottom: Description */}
                        <p className="text-xs font-medium text-muted-foreground leading-tight break-words">
                          Total Plans
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Most Purchase Plan: <span className="font-semibold text-gray-900">Gold</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Order Chart */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Recent Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Chart
                      options={{
                        chart: {
                          height: 300,
                          type: 'area',
                          toolbar: { show: false },
                        },
                        dataLabels: { enabled: false },
                        stroke: { width: 2, curve: 'smooth' },
                        xaxis: {
                          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                          title: { text: 'Days' },
                        },
                        yaxis: {
                          title: { text: 'Income' },
                        },
                        colors: ['#6fd944'],
                        grid: { strokeDashArray: 4 },
                        legend: { show: false },
                      }}
                      series={[
                        {
                          name: 'Income',
                          data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
                        },
                      ]}
                      type="area"
                      height={300}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Total Deals */}
                      <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-pink-500/10">
                              <IconRocket className="w-6 h-6 text-pink-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Total</p>
                              <h2 className="text-2xl font-bold">Deal</h2>
                            </div>
                            <h3 className="text-3xl font-bold">{dashboardData.stats.totalDeals}</h3>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Total Tasks */}
                      <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-purple-500/10">
                              <IconListCheck className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground mb-1">Total</p>
                              <h2 className="text-2xl font-bold">Deal Task</h2>
                            </div>
                            <h3 className="text-3xl font-bold">{dashboardData.stats.totalTasks}</h3>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Calendar Placeholder */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Calendar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                          <p className="text-muted-foreground">Calendar Integration Coming Soon</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Project Progress Cards */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Total Project</p>
                              <h3 className="text-xl font-bold">{dashboardData.projectProgress.totalProjects}%</h3>
                            </div>
                            <Progress value={dashboardData.projectProgress.totalProjects} className="h-2" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Project Tasks</p>
                              <h3 className="text-xl font-bold">{dashboardData.projectProgress.totalProjectTasks}%</h3>
                            </div>
                            <Progress value={dashboardData.projectProgress.totalProjectTasks} className="h-2" />
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Total Bugs</p>
                              <h3 className="text-xl font-bold">{dashboardData.projectProgress.totalBugs}%</h3>
                            </div>
                            <Progress value={dashboardData.projectProgress.totalBugs} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tasks Overview Chart */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Tasks Overview</CardTitle>
                          <span className="text-sm text-muted-foreground">Last 7 Days</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Chart
                          options={tasksChartOptions}
                          series={dashboardData.tasksOverview.datasets}
                          type="area"
                          height={250}
                        />
                      </CardContent>
                    </Card>

                    {/* Project Status Chart */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Project Status</CardTitle>
                          <span className="text-sm text-muted-foreground">Year - 2026</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Chart
                          options={projectStatusOptions}
                          series={dashboardData.projectStatus.series}
                          type="donut"
                          height={250}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Bottom Section - Tables */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Top Due Projects */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Due Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task Name</TableHead>
                            <TableHead>Remain Task</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboardData.topDueProjects.map((project) => (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium">{project.name}</TableCell>
                              <TableCell>{project.remainTask}</TableCell>
                              <TableCell>{project.dueDate}</TableCell>
                              <TableCell>
                                <Button variant="secondary" size="sm" className="shadow-none h-7 bg-gray-500 hover:bg-gray-600 text-white">
                                  <IconEye className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Top Due Tasks */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Due Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Task Name</TableHead>
                            <TableHead>Assign To</TableHead>
                            <TableHead>Task Stage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dashboardData.topDueTasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">{task.name}</TableCell>
                              <TableCell>
                                <div className="flex -space-x-2">
                                  {task.assignedTo.map((person, idx) => (
                                    <div
                                      key={idx}
                                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs border-2 border-background"
                                      title={person}
                                    >
                                      {person.charAt(0)}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{task.stage}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
