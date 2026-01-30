import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-white dark:bg-gray-900/80 text-card-foreground flex flex-col rounded-xl overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 gap-2 border-0',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-sm font-medium leading-none tracking-tight text-foreground', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-4 pb-4 pt-0 text-sm font-normal', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-4 [.border-t]:pt-4', className)}
      {...props}
    />
  )
}

function CardTable({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-table"
      className={cn('grid grow min-w-0', className)}
      {...props}
    />
  )
}

function CardToolbar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-toolbar"
      className={cn('flex items-center gap-2.5', className)}
      {...props}
    />
  )
}

function CardHeading({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-heading" className={cn('space-y-1', className)} {...props} />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardTable,
  CardToolbar,
  CardHeading,
}
