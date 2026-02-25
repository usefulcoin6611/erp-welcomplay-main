'use client'

import type React from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Option = {
  value: string
  label: string
}

type MultiSelectTagInputProps = {
  label?: React.ReactNode
  placeholder?: string
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  helperText?: string
  id?: string
  createEmployeeHref?: string
}

export function MultiSelectTagInput({
  label,
  placeholder = 'Select',
  options,
  value,
  onChange,
  helperText,
  id,
  createEmployeeHref,
}: MultiSelectTagInputProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedOptions = useMemo(
    () => options.filter((opt) => value.includes(opt.value)),
    [options, value],
  )

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) => {
        const notSelected = !value.includes(opt.value)
        if (!query.trim()) return notSelected
        return (
          notSelected &&
          opt.label.toLowerCase().includes(query.trim().toLowerCase())
        )
      }),
    [options, value, query],
  )

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="flex min-h-9 w-full items-center justify-between gap-1 px-2 py-1 text-left text-sm"
          >
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {selectedOptions.length === 0 ? (
                <span className="text-xs text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="secondary"
                    className="bg-sky-100 text-sky-800 border-sky-200 px-2 py-0.5 text-xs"
                  >
                    <span className="truncate max-w-[140px]">{opt.label}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 text-sky-700 hover:text-sky-900 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleOption(opt.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleToggleOption(opt.value)
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="ml-1 h-3 w-3 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[260px] p-0">
          <div className="p-2 space-y-2">
            <Input
              placeholder="Search employee..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-xs"
            />
            <div className="max-h-52 overflow-y-auto">
              {options.length === 0 ? (
                <p className="px-1 py-1.5 text-xs text-muted-foreground">
                  Tidak ada data employee.
                </p>
              ) : filteredOptions.length === 0 ? (
                <p className="px-1 py-1.5 text-xs text-muted-foreground">
                  Employee tidak ditemukan.
                </p>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleOption(opt.value)}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-sky-50"
                  >
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="border-t px-2 py-1.5 space-y-0.5">
            <p className="text-[11px] text-muted-foreground">
              Press to select / unselect.
            </p>
            {helperText && (
              <p className="text-[11px] text-muted-foreground">{helperText}</p>
            )}
            {createEmployeeHref && (
              <p className="text-[11px] text-muted-foreground">
                Need a new employee?{' '}
                <Link
                  href={createEmployeeHref}
                  className="font-medium text-sky-700 hover:text-sky-900 hover:underline"
                >
                  Go to HRM Employees
                </Link>
                .
              </p>
            )}
          </div>
          {options.length > value.length && (
            <div className="border-t px-2 py-1.5 flex justify-end">
              <Button
                type="button"
                size="xs"
                variant="ghost"
                className="h-6 px-2 text-xs text-sky-700 hover:text-sky-900"
                onClick={() => onChange(options.map((o) => o.value))}
              >
                Select All
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

