"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { ButtonGroup } from "@/components/ui/button-group"
import { useTranslations } from 'next-intl'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'meeting' | 'training' | 'holiday' | 'other'
  description?: string
}

interface EventCalendarProps {
  events?: CalendarEvent[]
  enableGoogleCalendar?: boolean
}

export function EventCalendar({ 
  events = [
    { id: "1", title: "Team Meeting", date: "2024-01-15", time: "09:00", type: "meeting" },
    { id: "2", title: "Training Session", date: "2024-01-18", time: "14:00", type: "training" },
    { id: "3", title: "Project Review", date: "2024-01-22", time: "10:30", type: "meeting" },
    { id: "4", title: "Holiday", date: "2024-01-25", time: "00:00", type: "holiday" },
  ]
}: EventCalendarProps) {
  const t = useTranslations('hrmDashboard.eventCalendar')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isFading, setIsFading] = useState(false)
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month')

  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const monthNames = [
    t('months.jan'), t('months.feb'), t('months.mar'), t('months.apr'), t('months.may'), t('months.jun'),
    t('months.jul'), t('months.aug'), t('months.sep'), t('months.oct'), t('months.nov'), t('months.dec')
  ]

  const dayNames = [t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat'), t('days.sun')]

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500'
      case 'training':
        return 'bg-green-500'
      case 'holiday':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const getEventsForDate = (date: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return events.filter(event => event.date === dateStr)
  }
  const getEventsForExactDate = (d: Date) => {
    const ds = formatDateStr(d)
    return events.filter(e => e.date === ds)
  }
  const startOfWeekMonday = (d: Date) => {
    const date = new Date(d)
    const day = (date.getDay() + 6) % 7 // 0=Mon..6=Sun
    date.setDate(date.getDate() - day)
    return date
  }
  const addDays = (d: Date, n: number) => {
    const nd = new Date(d)
    nd.setDate(nd.getDate() + n)
    return nd
  }

  const withFade = (update: () => void) => {
    setIsFading(true)
    // Fade out then update then fade in
    setTimeout(() => {
      update()
      // allow layout to update before fading back in
      requestAnimationFrame(() => {
        setIsFading(false)
      })
    }, 150)
  }

  const navigate = (direction: 'prev' | 'next') => {
    withFade(() => {
      const step = direction === 'prev' ? -1 : 1
      let newDate = new Date(selectedDate)
      if (viewMode === 'month') {
        newDate.setMonth(currentMonth + step)
      } else if (viewMode === 'week') {
        newDate = addDays(selectedDate, step * 7)
      } else {
        newDate = addDays(selectedDate, step)
      }
      setSelectedDate(newDate)
    })
  }

  const goToToday = () => {
    withFade(() => setSelectedDate(new Date()))
  }

  const renderMonthGrid = () => {
    const days = []
    
    // Empty cells for days before first day of month
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-16 p-0.5"></div>)
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const dayEvents = getEventsForDate(date)
      const isToday = new Date().getDate() === date && 
                     new Date().getMonth() === currentMonth && 
                     new Date().getFullYear() === currentYear
      
      days.push(
        <div 
          key={date} 
          className={`h-12 sm:h-16 p-0.5 border border-gray-200 hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
        >
          <div className={`text-[11px] sm:text-xs font-medium mb-0.5 px-1 ${isToday ? 'text-blue-600' : ''}`}>
            {date}
          </div>
          <div className="space-y-0.5 px-1">
            {dayEvents.slice(0, 1).map((event) => (
              <div 
                key={event.id} 
                className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                title={`${event.title} - ${event.time}`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 1 && (
              <div className="text-[10px] text-gray-500 px-1">
                +{dayEvents.length - 1}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return days
  }

  function WeekView({
    dayNames,
    selectedDate,
    isFading,
    startOfWeekMonday,
    addDays,
    getEventsForExactDate,
    getEventTypeColor,
  }: {
    dayNames: string[]
    selectedDate: Date
    isFading: boolean
    startOfWeekMonday: (d: Date) => Date
    addDays: (d: Date, n: number) => Date
    getEventsForExactDate: (d: Date) => CalendarEvent[]
    getEventTypeColor: (t: CalendarEvent['type']) => string
  }) {
    const start = startOfWeekMonday(selectedDate)
    return (
      <>
        <div className="grid grid-cols-7 gap-0 mb-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = addDays(start, i)
            const name = dayNames[i]
            return (
              <div key={`wh-${i}`} className="p-0.5 sm:p-1 text-center text-[11px] sm:text-xs font-medium text-gray-600 border-b">
                {name} {d.getDate()}
              </div>
            )
          })}
        </div>
        <div className={`grid grid-cols-7 gap-0 border-l border-t transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = addDays(start, i)
            const dayEvents = getEventsForExactDate(d)
            const isToday = formatDateStr(new Date()) === formatDateStr(d)
            return (
              <div key={`w-${i}`} className={`h-20 sm:h-24 p-1 border border-gray-200 hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}>
                <div className={`text-[11px] sm:text-xs font-medium mb-0.5 ${isToday ? 'text-blue-600' : ''}`}>{d.getDate()}</div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${getEventTypeColor(event.type)}`} title={`${event.title} - ${event.time}`}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-500 px-1">+{dayEvents.length - 2}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  function DayView({
    dayNames,
    monthNames,
    selectedDate,
    getEventsForExactDate,
    getEventTypeColor,
  }: {
    dayNames: string[]
    monthNames: string[]
    selectedDate: Date
    getEventsForExactDate: (d: Date) => CalendarEvent[]
    getEventTypeColor: (t: CalendarEvent['type']) => string
  }) {
    const evs = getEventsForExactDate(selectedDate)
    const dayIndex = (selectedDate.getDay() + 6) % 7
    return (
      <div className="space-y-2">
        <div className="mb-1 text-sm sm:text-base font-semibold">
          {dayNames[dayIndex]} {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
        </div>
        {evs.length === 0 ? (
          <div className="text-sm text-gray-500">No events</div>
        ) : (
          <ul className="space-y-1">
            {evs.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                <span className={`inline-block w-2.5 h-2.5 rounded ${getEventTypeColor(e.type)}`}></span>
                <span className="font-medium">{e.time}</span>
                <span className="truncate">{e.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2 w-full">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {t('eventTitle')}
          </CardTitle>
          <ButtonGroup className="ml-auto">
            <Button
              size="sm"
              variant={viewMode === 'day' ? 'default' : 'secondary'}
              className={viewMode === 'day'
                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                : 'text-blue-500 border-blue-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}
              onClick={() => setViewMode('day')}
            >
              Day
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'default' : 'secondary'}
              className={viewMode === 'week'
                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                : 'text-blue-500 border-blue-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'secondary'}
              className={viewMode === 'month'
                ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                : 'text-blue-500 border-blue-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
          </ButtonGroup>
        </div>
      </CardHeader>
  <CardContent className="p-3 sm:p-4">
        {/* Actions removed as requested: no calendar filter and no add event button */}
        {viewMode === 'month' && (
          <>
            <div className="grid grid-cols-7 gap-0 mb-1">
              {dayNames.map((day) => (
                <div key={day} className="p-0.5 sm:p-1 text-center text-[11px] sm:text-xs font-medium text-gray-600 border-b">
                  {day}
                </div>
              ))}
            </div>
            <div className={`grid grid-cols-7 gap-0 border-l border-t transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              {renderMonthGrid()}
            </div>
          </>
        )}

        {viewMode === 'week' && (
          <WeekView dayNames={dayNames} selectedDate={selectedDate} isFading={isFading} startOfWeekMonday={startOfWeekMonday} addDays={addDays} getEventsForExactDate={getEventsForExactDate} getEventTypeColor={getEventTypeColor} />
        )}

        {viewMode === 'day' && (
          <DayView dayNames={dayNames} monthNames={monthNames} selectedDate={selectedDate} getEventsForExactDate={getEventsForExactDate} getEventTypeColor={getEventTypeColor} />
        )}

        {/* Navigation controls moved here (below the calendar grid) */}
        <div className="mt-2 flex items-center justify-between gap-2">
          {/* Title on the left */}
          <h3 className="text-sm sm:text-base font-semibold text-left">
            {viewMode === 'month' && (
              <>{monthNames[currentMonth]} {currentYear}</>
            )}
            {viewMode === 'week' && (() => {
              const start = startOfWeekMonday(selectedDate)
              const end = addDays(start, 6)
              return <>{start.getDate()}–{end.getDate()} {monthNames[start.getMonth()]}</>
            })()}
            {viewMode === 'day' && (
              <>{dayNames[(selectedDate.getDay() + 6) % 7]} {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</>
            )}
          </h3>
          {/* Nav buttons on the right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('prev')}
              className="h-8 w-8 p-0 transition-transform duration-150 hover:scale-[1.05] active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToToday}
              className="h-8 transition-transform duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              {t('today')}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('next')}
              className="h-8 w-8 p-0 transition-transform duration-150 hover:scale-[1.05] active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-blue-500"></div>
            <span className="text-[11px] sm:text-xs">{t('eventTypes.meeting')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-green-500"></div>
            <span className="text-[11px] sm:text-xs">{t('eventTypes.training')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-red-500"></div>
            <span className="text-[11px] sm:text-xs">{t('eventTypes.holiday')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}