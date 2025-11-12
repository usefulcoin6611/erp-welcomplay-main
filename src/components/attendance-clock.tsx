"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Users } from "lucide-react"
import { useTranslations } from 'next-intl'

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
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isClockIn, setIsClockIn] = useState(user.isClockIn)
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

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
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


  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Main Clock Card */}
      <Card className="col-span-1">
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
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{getGreeting()}, {user.name}!</div>
              {isClockIn && (
                <div className="text-sm text-muted-foreground">
                  {t('clockedIn')}
                </div>
              )}
            </div>
          </div>

          {/* Clock Status */}
          {isClockIn && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">{t('clockInTime')}</div>
                <div className="font-medium">08:30 AM</div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('clockOutTime')}</div>
                <div className="font-medium">-</div>
              </div>
            </div>
          )}

          {/* Clock In/Out Button removed as requested */}
        </CardContent>
      </Card>

      {/* Not Clock In Users */}
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
    </div>
  )
}