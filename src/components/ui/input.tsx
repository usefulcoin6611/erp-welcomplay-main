import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const inputVariants = cva(
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        default: [
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
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
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface InputProps
  extends React.ComponentProps<'input'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, className }))}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
