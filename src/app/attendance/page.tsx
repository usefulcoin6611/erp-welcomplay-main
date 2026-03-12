'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { PieChart, Pie } from 'recharts'
import {
  Clock,
  AlertCircle,
  List,
  Calendar as CalendarIcon,
  LogIn,
  LogOut,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { AttendanceCalendar } from '@/components/attendance-calendar'

type AttendanceRecord = {
  id: string
  date: string
  status: string
  clockIn: string | null
  clockOut: string | null
}

type LeaveRequestItem = {
  id: string
  leaveType: string
  startDate: string
  endDate: string
  status: string
  reason: string | null
}

const chartConfig = {
  present: { label: 'Present', color: '#22c55e' },
  absent: { label: 'Absent', color: '#ef4444' },
  leave: { label: 'Leave', color: '#f59e0b' },
} satisfies ChartConfig

export default function AttendancePage() {
  const { user } = useAuth()
  const isEmployee = user?.type === 'employee'
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [todayStatus, setTodayStatus] = useState<{
    hasClockIn: boolean
    hasClockOut: boolean
    clockIn?: string
    clockOut?: string
    status?: string
  } | null>(null)
  const [notLinked, setNotLinked] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar')
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [serverToday, setServerToday] = useState<string | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<{ id: string; name: string; daysPerYear?: number }[]>([])
  const [leaveSubmitting, setLeaveSubmitting] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })
  const [myLeaves, setMyLeaves] = useState<LeaveRequestItem[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setCurrentTime(new Date())
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const fetchLeaveTypes = useCallback(async () => {
    if (!isEmployee) return
    try {
      const res = await fetch('/api/hrm/leave-types')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setLeaveTypes(json.data.map((t: { id: string; name: string; daysPerYear?: number }) => ({ id: t.id, name: t.name, daysPerYear: t.daysPerYear })))
      }
    } catch {
      // ignore
    }
  }, [isEmployee])

  const fetchHistory = useCallback(async () => {
    if (!isEmployee) return
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/attendance/me?month=${month}&limit=31`)
      const json = await res.json()
      if (!json.success) {
        if (json.message?.includes('not linked')) setNotLinked(true)
        else toast.error(json.message || 'Failed to load attendance')
        setHistory([])
        return
      }
      if (json.serverToday) setServerToday(json.serverToday)
      const data = (json.data ?? []).map((a: any) => {
        const dateStr = typeof a.date === 'string' ? a.date.split('T')[0] : a.date
        return {
          id: a.id,
          date: dateStr,
          status: a.status || 'Present',
          clockIn: a.clockIn ? new Date(a.clockIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
          clockOut: a.clockOut ? new Date(a.clockOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
        }
      })
      setHistory(data)
      const todayKey = json.serverToday ?? serverToday ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
      const today = data.find((r: AttendanceRecord) => r.date === todayKey)
      if (today) {
        setTodayStatus({
          hasClockIn: !!today.clockIn,
          hasClockOut: !!today.clockOut,
          clockIn: today.clockIn ?? undefined,
          clockOut: today.clockOut ?? undefined,
          status: today.status,
        })
      } else {
        setTodayStatus({ hasClockIn: false, hasClockOut: false, status: undefined })
      }
      setNotLinked(false)
    } catch {
      toast.error('Failed to load attendance')
      setHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }, [isEmployee, month, serverToday])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    if (isEmployee && !notLinked) fetchLeaveTypes()
  }, [isEmployee, notLinked, fetchLeaveTypes])

  const fetchMyLeaves = useCallback(async () => {
    if (!isEmployee) return
    setLoadingLeaves(true)
    try {
      const res = await fetch('/api/hrm/leaves')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setMyLeaves(
          json.data.map((item: { id: string; leaveType?: { name: string }; startDate: string; endDate: string; status: string; reason: string | null }) => ({
            id: item.id,
            leaveType: item.leaveType?.name ?? '–',
            startDate: item.startDate?.split('T')[0] ?? '',
            endDate: item.endDate?.split('T')[0] ?? '',
            status: item.status ?? 'Pending',
            reason: item.reason ?? null,
          }))
        )
      } else {
        setMyLeaves([])
      }
    } catch {
      setMyLeaves([])
    } finally {
      setLoadingLeaves(false)
    }
  }, [isEmployee])

  useEffect(() => {
    if (isEmployee && !notLinked) fetchMyLeaves()
  }, [isEmployee, notLinked, fetchMyLeaves])

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaveForm.leaveTypeId || !leaveForm.startDate || !leaveForm.endDate) {
      toast.error('Please fill leave type, start date, and end date')
      return
    }
    const sd = new Date(leaveForm.startDate)
    const ed = new Date(leaveForm.endDate)
    if (ed < sd) {
      toast.error('End date must be after start date')
      return
    }
    setLeaveSubmitting(true)
    try {
      const res = await fetch('/api/hrm/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaveTypeId: leaveForm.leaveTypeId,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          reason: leaveForm.reason || undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Leave request submitted successfully')
        setLeaveDialogOpen(false)
        setLeaveForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' })
        fetchHistory()
        fetchMyLeaves()
      } else {
        toast.error(json.message || 'Failed to submit leave request')
      }
    } catch {
      toast.error('Failed to submit leave request')
    } finally {
      setLeaveSubmitting(false)
    }
  }

  const handleClockIn = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/attendance/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_in' }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Clock in recorded')
        fetchHistory()
      } else {
        toast.error(json.message || 'Failed to clock in')
      }
    } catch {
      toast.error('Failed to clock in')
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/attendance/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_out' }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Clock out recorded')
        fetchHistory()
      } else {
        toast.error(json.message || 'Failed to clock out')
      }
    } catch {
      toast.error('Failed to clock out')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const v = status?.toLowerCase() || 'present'
    if (v === 'present') return <Badge className="bg-green-100 text-green-700 border-green-200">Present</Badge>
    if (v === 'absent') return <Badge className="bg-red-100 text-red-700 border-red-200">Absent</Badge>
    if (v === 'leave') return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Leave</Badge>
    return <Badge variant="outline">{status}</Badge>
  }

  const getLeaveStatusBadge = (status: string) => {
    const v = status?.toLowerCase() || 'pending'
    if (v === 'approved') return <Badge className="bg-green-100 text-green-700 border-0 text-xs font-medium">Approved</Badge>
    if (v === 'rejected') return <Badge className="bg-red-100 text-red-700 border-0 text-xs font-medium">Rejected</Badge>
    return <Badge className="bg-amber-100 text-amber-700 border-0 text-xs font-medium">Pending</Badge>
  }

  const formatLeaveDate = (dateStr: string) => {
    if (!dateStr) return '–'
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const monthOptions = useMemo(() => {
    const opts: string[] = []
    const d = new Date()
    for (let i = 0; i < 12; i++) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
      opts.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`)
    }
    return opts
  }, [])

  const handleMonthReset = () => {
    const d = new Date()
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const stats = useMemo(() => {
    const forMonth = history.filter((r) => r.date && r.date.startsWith(month))
    const present = forMonth.filter((r) => r.status?.toLowerCase() === 'present').length
    const absent = forMonth.filter((r) => r.status?.toLowerCase() === 'absent').length
    const leave = forMonth.filter((r) => r.status?.toLowerCase() === 'leave').length
    const total = present + absent + leave
    return {
      present,
      absent,
      leave,
      total,
      presentPct: total > 0 ? Math.round((present / total) * 100) : 0,
      absentPct: total > 0 ? Math.round((absent / total) * 100) : 0,
      leavePct: total > 0 ? Math.round((leave / total) * 100) : 0,
    }
  }, [history, month])

  const pieData = useMemo(() => {
    const data = [
      { name: 'present', value: stats.present, fill: '#22c55e' },
      { name: 'absent', value: stats.absent, fill: '#ef4444' },
      { name: 'leave', value: stats.leave, fill: '#f59e0b' },
    ].filter((d) => d.value > 0)
    return data.length ? data : [{ name: 'empty', value: 1, fill: '#e5e7eb' }]
  }, [stats])

  if (!isEmployee) {
    return (
      <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="p-6">
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] rounded-lg border-0 bg-white">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">This page is for employees only.</p>
                </CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {notLinked ? (
              <div className="rounded-lg bg-amber-50 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                    <AlertCircle className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Account not linked to employee record</p>
                    <p className="text-sm text-amber-700/90 mt-0.5">Please contact HR to link your account so you can record attendance.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* My Attendance (title + name + access profile + clock in/out) | Attendance overview (month dropdown + pie) - inline horizontal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* My Attendance card */}
                  <div className="rounded-lg bg-white px-5 py-5 sm:px-6 sm:py-5 flex flex-col gap-5 relative">
                    {/* Header: title + name (left) | badge (top right) */}
                    <div className="flex flex-row items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-900">My Attendance</CardTitle>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-800">{user?.name ?? '–'}</span>
                          <span className="text-slate-500"> · {user?.accessProfileName ?? 'Not assigned'}</span>
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-sm font-medium border-0 ${
                          todayStatus?.status?.toLowerCase() === 'leave'
                            ? 'bg-amber-100 text-amber-700'
                            : todayStatus?.hasClockOut
                              ? 'bg-slate-100 text-slate-700'
                              : todayStatus?.hasClockIn
                                ? 'bg-green-100 text-green-700'
                                : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {todayStatus?.status?.toLowerCase() === 'leave'
                          ? 'On leave'
                          : todayStatus?.hasClockOut
                            ? 'Checked out'
                            : todayStatus?.hasClockIn
                              ? 'Checked in'
                              : 'Ready'}
                      </Badge>
                    </div>

                    {/* Current time (left) | Today's punch + actions (right) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {/* Live clock */}
                      <div>
                        <p
                          className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-800 mt-1"
                          suppressHydrationWarning
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </p>
                        <p className="text-sm text-slate-500 mt-1" suppressHydrationWarning>
                          {currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Today's punch + action button: punch shifted left, more gap before button */}
                      <div className="flex flex-row items-center justify-between gap-4 sm:gap-6 min-w-0">
                        {/* Icon + Clock In + Clock Out — tighter, shifted left */}
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-[220px] sm:max-w-[240px]">
                          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-sky-500 text-white">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="flex items-baseline gap-3 sm:gap-4 min-w-0">
                            <div className="min-w-[3.5rem] sm:min-w-[4rem] shrink-0">
                              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Clock In</p>
                              <p className="text-base font-bold tabular-nums text-slate-800 whitespace-nowrap">{todayStatus?.clockIn || '--:--'}</p>
                            </div>
                            <div className="min-w-[3.5rem] sm:min-w-[4rem] shrink-0">
                              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Clock Out</p>
                              <p className="text-base font-bold tabular-nums text-slate-800 whitespace-nowrap">{todayStatus?.clockOut || '--:--'}</p>
                            </div>
                          </div>
                        </div>
                        {/* Button: smooth animation on click, more spacing from punch block */}
                        {todayStatus?.status?.toLowerCase() !== 'leave' && (
                          <div className="shrink-0 ml-2">
                            {!todayStatus?.hasClockIn && !todayStatus?.hasClockOut && (
                              <Button
                                type="button"
                                size="lg"
                                className="h-10 px-4 sm:px-5 bg-blue-500 text-white hover:bg-blue-600 border-0 text-sm sm:text-base transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleClockIn}
                                disabled={loading}
                              >
                                <LogIn className="h-4 w-4 mr-1.5 sm:mr-2" />
                                {loading ? '...' : 'Clock In'}
                              </Button>
                            )}
                            {todayStatus?.hasClockIn && !todayStatus?.hasClockOut && (
                              <Button
                                type="button"
                                size="lg"
                                className="h-10 px-4 sm:px-5 bg-red-50 text-red-700 hover:bg-red-100 border-0 font-medium text-sm sm:text-base transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleClockOut}
                                disabled={loading}
                              >
                                <LogOut className="h-4 w-4 mr-1.5 sm:mr-2" />
                                {loading ? '...' : 'Clock Out'}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attendance overview card - month dropdown, reset, pie chart */}
                  <div className="rounded-lg bg-white px-6 py-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                      <p className="text-sm font-semibold text-slate-800">Attendance overview</p>
                      <div className="flex items-center gap-2">
                        <Select value={month} onValueChange={setMonth}>
                          <SelectTrigger className="w-[180px] h-9 bg-white border border-slate-200/80 shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((m) => (
                              <SelectItem key={m} value={m}>
                                {new Date(m + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 border-blue-200 bg-blue-500 text-white hover:bg-blue-600 hover:text-white hover:border-blue-300"
                          onClick={handleMonthReset}
                          title="Reset to current month"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <ChartContainer config={chartConfig} className="h-[140px] w-[140px] shrink-0">
                        <PieChart>
                          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} strokeWidth={0} />
                        </PieChart>
                      </ChartContainer>
                      <div className="flex flex-col gap-3 min-w-[160px]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-green-500 shrink-0" />
                            <span className="text-sm font-medium text-slate-700">Present</span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-slate-900">{stats.presentPct}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-red-500 shrink-0" />
                            <span className="text-sm font-medium text-slate-700">Absent</span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-slate-900">{stats.absentPct}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
                            <span className="text-sm font-medium text-slate-700">Leave</span>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-slate-900">{stats.leavePct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance History (left) | Leave card (right) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Attendance History */}
                  <div className="lg:col-span-2 rounded-lg bg-white px-6 py-4">
                    <div className="flex flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                      <p className="text-sm font-semibold text-slate-800">Attendance History</p>
                      <div className="inline-flex rounded-md border border-slate-200/80 bg-slate-50/50 p-0.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className={`h-7 min-w-7 px-2 shadow-none ${
                            viewMode === 'calendar'
                              ? 'bg-blue-500 text-white font-medium hover:bg-blue-600 hover:text-white'
                              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          onClick={() => setViewMode('calendar')}
                          title="Calendar view"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">Calendar</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className={`h-7 min-w-7 px-2 shadow-none ${
                            viewMode === 'list'
                              ? 'bg-blue-500 text-white font-medium hover:bg-blue-600 hover:text-white'
                              : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                          onClick={() => setViewMode('list')}
                          title="List view"
                        >
                          <List className="h-3.5 w-3.5 mr-1.5" />
                          <span className="text-xs">List</span>
                        </Button>
                      </div>
                    </div>
                    {loadingHistory ? (
                      <div className="py-12 text-center text-muted-foreground">Loading...</div>
                    ) : viewMode === 'calendar' ? (
                      <AttendanceCalendar month={month} onMonthChange={setMonth} history={history} onGoToToday={handleMonthReset} />
                    ) : history.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">No attendance records</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead className="px-6">Date</TableHead>
                              <TableHead className="px-6">Status</TableHead>
                              <TableHead className="px-6">Clock In</TableHead>
                              <TableHead className="px-6">Clock Out</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {history.map((r) => (
                              <TableRow key={r.id} className="hover:bg-muted/30">
                                <TableCell className="px-6 font-medium">{formatDate(r.date)}</TableCell>
                                <TableCell className="px-6">{getStatusBadge(r.status)}</TableCell>
                                <TableCell className="px-6">{r.clockIn || '–'}</TableCell>
                                <TableCell className="px-6">{r.clockOut || '–'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* Leave card */}
                  <div className="rounded-lg bg-white px-5 py-4 sm:px-5 flex flex-col">
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Leave</p>
                        <p className="text-xs text-slate-500 mt-0.5">Your leave requests</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 h-9 px-3 bg-blue-500 text-white border-0 hover:bg-blue-600 hover:text-white"
                        onClick={() => setLeaveDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Apply leave
                      </Button>
                    </div>
                    <div className="mt-3 overflow-y-auto max-h-[280px]">
                      {loadingLeaves ? (
                        <p className="text-sm text-slate-500 py-4 text-center">Loading...</p>
                      ) : myLeaves.length === 0 ? (
                        <p className="text-sm text-slate-500 py-4 text-center">No leave requests yet. Click Apply leave to submit one.</p>
                      ) : (
                        <ul className="space-y-3 pr-1">
                          {myLeaves.map((lv) => (
                            <li key={lv.id} className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-slate-800 truncate">{lv.leaveType}</p>
                                {getLeaveStatusBadge(lv.status)}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                {formatLeaveDate(lv.startDate)} – {formatLeaveDate(lv.endDate)}
                              </p>
                              {lv.reason && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{lv.reason}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                {/* Apply leave dialog */}
                <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Apply leave</DialogTitle>
                      <DialogDescription>
                        Submit a leave request. It will be sent for approval.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLeaveSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="leaveType">Leave type <span className="text-red-500">*</span></Label>
                        <Select
                          value={leaveForm.leaveTypeId}
                          onValueChange={(v) => setLeaveForm((f) => ({ ...f, leaveTypeId: v }))}
                          required
                        >
                          <SelectTrigger id="leaveType">
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveTypes.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                                {t.daysPerYear != null && t.daysPerYear > 0 ? ` (${t.daysPerYear} days/year)` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start date <span className="text-red-500">*</span></Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={leaveForm.startDate}
                            onChange={(e) => setLeaveForm((f) => ({ ...f, startDate: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End date <span className="text-red-500">*</span></Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={leaveForm.endDate}
                            onChange={(e) => setLeaveForm((f) => ({ ...f, endDate: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="leaveReason">Reason (optional)</Label>
                        <Textarea
                          id="leaveReason"
                          value={leaveForm.reason}
                          onChange={(e) => setLeaveForm((f) => ({ ...f, reason: e.target.value }))}
                          placeholder="Reason for leave"
                          className="min-h-[80px]"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setLeaveDialogOpen(false)}
                          disabled={leaveSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                          disabled={leaveSubmitting}
                        >
                          {leaveSubmitting ? 'Submitting...' : 'Submit request'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
