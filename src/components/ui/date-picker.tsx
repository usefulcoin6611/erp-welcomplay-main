'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  /** Value in YYYY-MM-DD format */
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  id?: string
  hasError?: boolean
  className?: string
  disabled?: boolean
  /** Where to render the calendar icon. Default: left */
  iconPlacement?: 'left' | 'right' | 'none'
}

function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const d = new Date(value + 'T00:00:00')
  return Number.isNaN(d.getTime()) ? undefined : d
}

function toYYYYMMDD(date: Date | undefined): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  id,
  hasError,
  className,
  disabled,
  iconPlacement = 'left',
}: DatePickerProps) {
  const date = toDate(value)

  const handleSelect = (d: Date | undefined) => {
    onValueChange(toYYYYMMDD(d))
  }

  const content = date ? format(date, 'PPP') : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={cn(
            'h-10 w-full text-left font-normal',
            iconPlacement === 'right' ? 'justify-between' : 'justify-start',
            !value && 'text-muted-foreground',
            hasError && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
        >
          {iconPlacement === 'left' && (
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className={cn('min-w-0', iconPlacement === 'right' && 'flex-1 truncate')}>
            {content}
          </span>
          {iconPlacement === 'right' && (
            <CalendarIcon className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
