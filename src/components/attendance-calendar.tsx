'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, LogIn, LogOut } from 'lucide-react'

type AttendanceRecord = {
  id: string
  date: string
  status: string
  clockIn: string | null
  clockOut: string | null
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type AttendanceCalendarProps = {
  month: string
  onMonthChange: (month: string) => void
  history: AttendanceRecord[]
  onGoToToday?: () => void
}

export function AttendanceCalendar({ month, onMonthChange, history, onGoToToday }: AttendanceCalendarProps) {
  const [isFading, setIsFading] = useState(false)
  const [y, m] = month.split('-').map(Number)
  const currentMonth = m - 1
  const currentYear = y
  const selectedDate = new Date(currentYear, currentMonth, 1)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const getRecordForDate = (date: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return history.find((r) => r.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    const v = status?.toLowerCase() || 'present'
    if (v === 'present') return 'bg-green-100 text-green-800'
    if (v === 'absent') return 'bg-red-100 text-red-800'
    if (v === 'leave') return 'bg-amber-100 text-amber-800'
    return 'bg-gray-100 text-gray-700'
  }

  const withFade = (update: () => void) => {
    setIsFading(true)
    setTimeout(() => {
      update()
      requestAnimationFrame(() => setIsFading(false))
    }, 150)
  }

  const navigate = (direction: 'prev' | 'next') => {
    withFade(() => {
      const step = direction === 'prev' ? -1 : 1
      const newDate = new Date(currentYear, currentMonth + step, 1)
      onMonthChange(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`)
    })
  }

  const goToToday = () => {
    withFade(() => {
      const now = new Date()
      onMonthChange(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
      onGoToToday?.()
    })
  }

  const days = []
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-12 sm:h-16 p-0.5" />)
  }
  for (let date = 1; date <= daysInMonth; date++) {
    const record = getRecordForDate(date)
    const isToday =
      new Date().getDate() === date && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear

    days.push(
      <div
        key={date}
        className={`h-12 sm:h-16 p-0.5 border border-gray-200 hover:bg-gray-50 transition-colors ${
          isToday ? 'bg-blue-50 border-blue-300' : ''
        }`}
      >
        <div className={`text-[11px] sm:text-xs font-medium mb-0.5 px-1 ${isToday ? 'text-blue-600' : ''}`}>{date}</div>
        <div className="space-y-0.5 px-1">
          {record ? (
            record.status?.toLowerCase() === 'present' ? (
              <div
                className={`flex flex-col gap-0.5 px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-medium tabular-nums ${getStatusColor(record.status)}`}
                title={`Present${record.clockIn ? ` • In: ${record.clockIn}` : ''}${record.clockOut ? ` • Out: ${record.clockOut}` : ''}`}
              >
                <div className="flex items-center gap-0.5 truncate">
                  <LogIn className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span className="truncate">{record.clockIn || '–'}</span>
                </div>
                <div className="flex items-center gap-0.5 truncate">
                  <LogOut className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 text-red-600" />
                  <span className="truncate">{record.clockOut || '–'}</span>
                </div>
              </div>
            ) : (
              <div
                className={`text-[10px] px-1 py-0.5 rounded truncate ${getStatusColor(record.status)}`}
                title={
                  record.status +
                  (record.clockIn ? ` • In: ${record.clockIn}` : '') +
                  (record.clockOut ? ` • Out: ${record.clockOut}` : '')
                }
              >
                {record.status}
              </div>
            )
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-0 mb-1">
          {DAY_NAMES.map((day) => (
            <div key={day} className="p-0.5 sm:p-1 text-center text-[11px] sm:text-xs font-medium text-gray-600 border-b">
              {day}
            </div>
          ))}
        </div>
        <div className={`grid grid-cols-7 gap-0 border-l border-t transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          {days}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-left">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('prev')} className="h-8 w-8 p-0 transition-transform duration-150 hover:scale-[1.05] active:scale-95 cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="h-8 transition-transform duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('next')} className="h-8 w-8 p-0 transition-transform duration-150 hover:scale-[1.05] active:scale-95 cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-green-200" />
            <span className="text-[11px] sm:text-xs">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-red-200" />
            <span className="text-[11px] sm:text-xs">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-amber-200" />
            <span className="text-[11px] sm:text-xs">Leave</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
