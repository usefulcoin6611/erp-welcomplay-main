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

  const getGreeting = () => {
    if (!currentTime) return t('greeting.welcome')
    const hour = currentTime.getHours()
    if (hour < 12) return t('greeting.morning')
    if (hour < 15) return t('greeting.afternoon')
    if (hour < 18) return t('greeting.evening')
    return t('greeting.night')
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

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Main Clock Card */}
      <Card className={isEmployee ? "md:col-span-2" : "col-span-1"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Display */}
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-primary">
              {isMounted && currentTime ? formatTime(currentTime) : "--:--:--"}
            </div>
            <div className="text-sm text-muted-foreground">
              {isMounted && currentTime ? formatDate(currentTime) : "Loading..."}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{getGreeting()}, {displayName}!</div>
              <div className="text-sm text-muted-foreground">
                {attendance.clockInTime || attendance.isClockIn ? t('clockedIn') : t('notClockedIn')}
              </div>
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

          {/* Clock Status */}
          {(attendance.clockInTime || attendance.clockOutTime || attendance.isClockIn) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">{t('clockInTime')}</div>
                <div className="font-medium">{attendance.clockInTime || '-'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('clockOutTime')}</div>
                <div className="font-medium">{attendance.clockOutTime || '-'}</div>
              </div>
            </div>
          )}

          {/* Mark Attendance (Employee only) */}
          {isEmployee && (
            <div className="flex flex-wrap gap-2">
              {!attendance.isClockIn && !attendance.clockOutTime ? (
                <Button
                  type="button"
                  variant="blue"
                  size="sm"
                  className="shadow-none h-7 px-4"
                  onClick={handleClockIn}
                >
                  {t('clockIn')}
                </Button>
              ) : attendance.isClockIn && !attendance.clockOutTime ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7 px-4 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                  onClick={handleClockOut}
                >
                  {t('clockOut')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-7 px-4 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
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