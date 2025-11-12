import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface SimplePaginationProps {
  totalCount: number
  currentPage: number // 1-based
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  sizes?: number[]
  className?: string
  hideRowsSelector?: boolean // New prop to hide rows selector
}

export function SimplePagination({
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sizes = [5, 10, 25, 50, 100],
  className,
  hideRowsSelector = false,
}: SimplePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize))
  const pageIndex = Math.min(Math.max(currentPage - 1, 0), pageCount - 1)
  const from = totalCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalCount)

  // Keep grouping behavior similar to DataGridPagination (groups of 5)
  const moreLimit = 5
  const currentGroupStart = Math.floor(pageIndex / moreLimit) * moreLimit
  const currentGroupEnd = Math.min(currentGroupStart + moreLimit, pageCount)

  const goTo = (p: number) => {
    const safe = Math.min(Math.max(p, 1), pageCount)
    if (safe !== currentPage) onPageChange(safe)
  }

  return (
    <div className={cn('flex flex-row justify-start items-center gap-1 py-1 grow', className)}>
      {!hideRowsSelector && (
        <div className="flex flex-wrap items-center space-x-2 pb-1 sm:pb-0 order-1 pl-1 sm:pl-2 pr-1 sm:pr-2">
          <div className="hidden sm:block text-sm text-muted-foreground">Rows</div>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => onPageSizeChange?.(Number(value))}
          >
            <SelectTrigger className="w-16 h-6 ml-2" size="sm">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top" className="min-w-[50px]">
              {sizes.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center justify-start gap-1 pt-0 order-2">
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap text-left pl-1 sm:pl-2">
          {from} - {to} of {totalCount}
        </div>
        {pageCount > 1 && (
          <div className="flex items-center space-x-0.5 overflow-x-auto no-scrollbar">
            <Button
              size="sm"
              mode="icon"
              variant="ghost"
              className="size-6 p-0 text-xs rtl:transform rtl:rotate-180 cursor-pointer"
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="size-4" />
            </Button>

            {currentGroupStart > 0 && (
              <Button
                size="sm"
                mode="icon"
                className="size-6 p-0 text-xs cursor-pointer"
                variant="ghost"
                onClick={() => goTo(currentGroupStart)}
              >
                ...
              </Button>
            )}

            {Array.from({ length: currentGroupEnd - currentGroupStart }, (_, i) => currentGroupStart + i + 1).map(
              (p) => (
                <Button
                  key={p}
                  size="sm"
                  mode="icon"
                  variant="ghost"
                  className={cn('size-6 p-0 text-xs text-muted-foreground cursor-pointer', {
                    'bg-accent text-accent-foreground': p === currentPage,
                  })}
                  onClick={() => goTo(p)}
                >
                  {p}
                </Button>
              ),
            )}

            {currentGroupEnd < pageCount && (
              <Button
                className="size-6 p-0 text-xs cursor-pointer"
                variant="ghost"
                size="sm"
                mode="icon"
                onClick={() => goTo(currentGroupEnd + 1)}
              >
                ...
              </Button>
            )}

            <Button
              size="sm"
              mode="icon"
              variant="ghost"
              className="size-6 p-0 text-xs rtl:transform rtl:rotate-180 cursor-pointer"
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimplePagination
