import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface SearchInputProps extends React.ComponentProps<typeof Input> {
  /**
   * Custom icon to display instead of default Search icon
   */
  icon?: React.ReactNode
  /**
   * Whether to show the search icon
   * @default true
   */
  showIcon?: boolean
  /**
   * Container className for the wrapper div
   */
  containerClassName?: string
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon, showIcon = true, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', containerClassName)}>
        {showIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon || <Search className="h-4 w-4" />}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            'pl-9 w-full border-0 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors h-10 rounded-full',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export { SearchInput }
