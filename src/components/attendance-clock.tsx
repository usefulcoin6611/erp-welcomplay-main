"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface AttendanceClockProps {
  user?: {
    name: string
    avatar?: string
    isClockIn: boolean
    clockInTime?: string
    clockOutTime?: string
  }
  notClockInUsers?: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

type AttendanceState = {
  date: string // YYYY-MM-DD
  isClockIn: boolean
  clockInTime?: string // HH:mm
  clockOutTime?: string // HH:mm
}

export function AttendanceClock({ 
  user = {
    name: "John Doe",
    avatar: "/avatars/01.png",
    isClockIn: false
  },
  notClockInUsers = [
    { id: "1", name: "Alice Smith", avatar: "/avatars/02.png" },
    { id: "2", name: "Bob Johnson", avatar: "/avatars/03.png" },
    { id: "3", name: "Carol Brown", avatar: "/avatars/04.png" },
  ]
}: AttendanceClockProps) {
  const t = useTranslations('hrmDashboard.attendanceClock')
  const { user: authUser } = useAuth()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [attendance, setAttendance] = useState<AttendanceState>({
    date: '',
    isClockIn: user.isClockIn,
    clockInTime: user.clockInTime,
    clockOutTime: user.clockOutTime,
  })
  const [isMounted, setIsMounted] = useState(false)

  // Initialize time and set mounted flag
  useEffect(() => {
    setIsMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const todayKey = useMemo(() => {
    if (!isMounted) return ''
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [isMounted])

  const storageKey = useMemo(() => {
    const identity = authUser?.email || authUser?.name || user.name
    if (!identity || !todayKey) return ''
    return `attendance_clock:${identity}:${todayKey}`
  }, [authUser?.email, authUser?.name, user.name, todayKey])

  useEffect(() => {
    if (!isMounted || !storageKey || !todayKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        setAttendance((prev) => ({ ...prev, date: todayKey }))
        return
      }
      const parsed = JSON.parse(raw) as AttendanceState
      if (parsed?.date !== todayKey) {
        setAttendance({ date: todayKey, isClockIn: false })
        return
      }
      setAttendance({
        date: todayKey,
        isClockIn: !!parsed.isClockIn,
        clockInTime: parsed.clockInTime,
        clockOutTime: parsed.clockOutTime,
      })
    } catch {
      setAttendance({ date: todayKey, isClockIn: false })
    }
  }, [isMounted, storageKey, todayKey])

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  const formatHHmm = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const displayName = authUser?.name || user.name
  const displayAvatar = authUser?.avatar || user.avatar
  const isEmployee = authUser?.type === 'employee'

  const persistAttendance = (next: AttendanceState) => {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }

  const handleClockIn = () => {
    if (!currentTime) return
    const next: AttendanceState = {
      date: todayKey || '',
      isClockIn: true,
      clockInTime: attendance.clockInTime || formatHHmm(currentTime),
      clockOutTime: undefined,
    }
    setAttendance(next)
    persistAttendance(next)
  }

  const handleClockOut = () => {
    if (!currentTime) return
    const next: AttendanceState = {
      date: todayKey || '',
      isClockIn: false,
      clockInTime: attendance.clockInTime || formatHHmm(currentTime),
      clockOutTime: formatHHmm(currentTime),
    }
    setAttendance(next)
    persistAttendance(next)
  }

  // Layout ringkas & simpel untuk sisi employee
  if (isEmployee) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-gradient-to-r from-blue-50/80 to-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
              <Clock className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-medium">
              {t('title')}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={
              attendance.clockOutTime
                ? "bg-gray-50 text-gray-700 border-gray-100"
                : attendance.isClockIn
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-blue-50 text-blue-700 border-blue-100"
            }
          >
            {attendance.clockOutTime ? 'Checked out' : attendance.isClockIn ? 'Checked in' : 'Ready'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {/* Baris jam & tanggal */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-3xl font-semibold tracking-tight text-primary">
                {isMounted && currentTime ? formatTime(currentTime) : "--:--:--"}
              </div>
              <div className="text-xs text-muted-foreground">
                {isMounted && currentTime ? formatDate(currentTime) : "Loading..."}
              </div>
            </div>
            <div className="grid gap-2 text-xs">
              <div className="rounded-md bg-muted/60 px-3 py-1.5">
                <div className="text-muted-foreground">{t('clockInTime')}</div>
                <div className="mt-0.5 font-medium text-sm">
                  {attendance.clockInTime || '-'}
                </div>
              </div>
              <div className="rounded-md bg-muted/60 px-3 py-1.5">
                <div className="text-muted-foreground">{t('clockOutTime')}</div>
                <div className="mt-0.5 font-medium text-sm">
                  {attendance.clockOutTime || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Status singkat + tombol utama */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-2 border-t pt-3">
            <div className="text-xs text-muted-foreground">
              {attendance.isClockIn && !attendance.clockOutTime
                ? t('statusWorking')
                : attendance.clockOutTime
                  ? t('statusCompleted')
                  : t('statusReady')}
            </div>
            <div className="flex w-full sm:w-auto justify-end">
              {!attendance.isClockIn && !attendance.clockOutTime ? (
                <Button
                  type="button"
                  variant="blue"
                  size="sm"
                  className="h-8 px-6 shadow-none text-xs font-semibold uppercase tracking-wide w-full sm:w-auto sm:min-w-[140px]"
                  onClick={handleClockIn}
                >
                  {t('clockIn')}
                </Button>
              ) : !attendance.clockOutTime ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-6 shadow-none text-xs font-semibold uppercase tracking-wide w-full sm:w-auto sm:min-w-[140px] bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                  onClick={handleClockOut}
                >
                  {t('clockOut')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 shadow-none text-xs font-medium w-full sm:w-auto sm:min-w-[120px] bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                  onClick={() => {
                    const next: AttendanceState = { date: todayKey || '', isClockIn: false }
                    setAttendance(next)
                    persistAttendance(next)
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Main Clock Card - hanya untuk non-employee (admin/HR) */}
      <Card className="col-span-1">
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-50/80 to-indigo-50/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
                <Clock className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-medium">
                {t('title')}
              </CardTitle>
            </div>
            {isEmployee && (
              <Badge
                variant="outline"
                className={
                  attendance.clockOutTime
                    ? "bg-gray-50 text-gray-700 border-gray-100"
                    : attendance.isClockIn
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                }
              >
                {attendance.clockOutTime ? 'Checked out' : attendance.isClockIn ? 'Checked in' : 'Ready'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          {/* Clock Status - selalu terlihat */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 px-3 py-2 text-xs">
            <div>
              <div className="text-muted-foreground">{t('clockInTime')}</div>
              <div className="mt-0.5 font-medium text-sm">
                {attendance.clockInTime || '-'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('clockOutTime')}</div>
              <div className="mt-0.5 font-medium text-sm">
                {attendance.clockOutTime || '-'}
              </div>
            </div>
          </div>

          {/* Mark Attendance (Employee only) */}
          {isEmployee && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                {attendance.isClockIn && !attendance.clockOutTime
                  ? t('statusWorking')
                  : attendance.clockOutTime
                    ? t('statusCompleted')
                    : t('statusReady')}
              </div>
              <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
                {!attendance.isClockIn && !attendance.clockOutTime ? (
                  <Button
                    type="button"
                    variant="blue"
                    size="sm"
                    className="h-8 px-5 shadow-none text-xs font-semibold uppercase tracking-wide sm:min-w-[120px]"
                    onClick={handleClockIn}
                  >
                    {t('clockIn')}
                  </Button>
                ) : attendance.isClockIn && !attendance.clockOutTime ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-5 shadow-none text-xs font-semibold uppercase tracking-wide bg-red-50 text-red-700 hover:bg-red-100 border-red-100 sm:min-w-[120px]"
                    onClick={handleClockOut}
                  >
                    {t('clockOut')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-4 shadow-none text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100 sm:min-w-[100px]"
                    onClick={() => {
                      const next: AttendanceState = { date: todayKey || '', isClockIn: false }
                      setAttendance(next)
                      persistAttendance(next)
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Not Clock In Users */}
      {!isEmployee && (
        <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('notClockInTitle')}
            <Badge variant="secondary">{notClockInUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notClockInUsers.length > 0 ? (
              notClockInUsers.map((notClockInUser) => (
                <div key={notClockInUser.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notClockInUser.avatar} alt={notClockInUser.name} />
                    <AvatarFallback className="text-xs">
                      {notClockInUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{notClockInUser.name}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {t('notClockedBadge')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground text-sm py-4">
                {t('allClockedIn')}
              </div>
            )}
          </div>
        </CardContent>
        </Card>
      )}
    </div>
  )
}