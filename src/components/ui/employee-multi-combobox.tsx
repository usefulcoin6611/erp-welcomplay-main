'use client'

import type React from 'react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronsUpDownIcon, XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Option = {
  value: string
  label: string
}

type EmployeeMultiComboboxProps = {
  id?: string
  label?: React.ReactNode
  placeholder?: string
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  helperText?: string
  createHref?: string
}

export function EmployeeMultiCombobox({
  id,
  label,
  placeholder = 'Select',
  options,
  value,
  onChange,
  helperText,
  createHref,
}: EmployeeMultiComboboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')

  const handleClickOutside = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    },
    [],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open, handleClickOutside])

  const selectedValues = value

  const toggleSelection = (val: string) => {
    onChange(
      selectedValues.includes(val)
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val],
    )
  }

  const removeSelection = (val: string) => {
    onChange(selectedValues.filter((v) => v !== val))
  }

  const maxShownItems = 2
  const visibleItems = expanded
    ? selectedValues
    : selectedValues.slice(0, maxShownItems)
  const hiddenCount = selectedValues.length - visibleItems.length

  const findLabel = (val: string) =>
    options.find((opt) => opt.value === val)?.label ?? val

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) => {
        if (selectedValues.includes(opt.value)) return false
        if (!search.trim()) return true
        return opt.label.toLowerCase().includes(search.trim().toLowerCase())
      }),
    [options, selectedValues, search],
  )

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <div ref={containerRef} className="relative w-full">
        <Button
          id={inputId}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
          onClick={() => setOpen((prev) => !prev)}
        >
          <div className="flex flex-wrap items-center gap-1 pr-2.5">
            {selectedValues.length > 0 ? (
              <>
                {visibleItems.map((val) => (
                  <Badge
                    key={val}
                    variant="outline"
                    className="rounded-sm text-xs"
                  >
                    {findLabel(val)}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 inline-flex cursor-pointer items-center justify-center rounded-sm p-0.5 hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSelection(val)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          removeSelection(val)
                        }
                      }}
                    >
                      <XIcon className="size-3" />
                    </span>
                  </Badge>
                ))}
                {hiddenCount > 0 || expanded ? (
                  <Badge
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded((prev) => !prev)
                    }}
                    className="cursor-pointer rounded-sm text-xs"
                  >
                    {expanded ? 'Show Less' : `+${hiddenCount} more`}
                  </Badge>
                ) : null}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronsUpDownIcon
            className="shrink-0 text-muted-foreground/80"
            size={16}
            aria-hidden="true"
          />
        </Button>
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-2 shadow-md">
            <Input
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs mb-2"
            />
            <div className="max-h-52 overflow-y-auto rounded-md border bg-background">
              {options.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  Tidak ada data employee.
                </p>
              ) : filteredOptions.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">
                  Employee tidak ditemukan.
                </p>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleSelection(opt.value)}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-sky-50"
                  >
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))
              )}
            </div>
            {(helperText || createHref) && (
              <div className="border-t px-2 py-1.5 space-y-0.5 mt-2">
                {helperText && (
                  <p className="text-[11px] text-muted-foreground">
                    {helperText}
                  </p>
                )}
                {createHref && (
                  <p className="text-[11px] text-muted-foreground">
                    Need a new employee?{' '}
                    <Link
                      href={createHref}
                      className="font-medium text-sky-700 hover:text-sky-900 hover:underline"
                    >
                      Go to HRM Employees
                    </Link>
                    .
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

