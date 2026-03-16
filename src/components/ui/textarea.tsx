import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'border-input placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        default: [
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        ],
        modern: [
          'border-gray-200 dark:border-gray-700',
          'bg-white dark:bg-gray-900/50',
          'hover:border-gray-300 dark:hover:border-gray-600',
          'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
          'focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20',
          'focus-visible:ring-offset-0',
          'hover:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)] focus-visible:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)]',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'text-gray-900 dark:text-gray-100',
          'resize-none',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface TextareaProps
  extends React.ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Textarea }
