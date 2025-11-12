'use client'

import React, { useMemo, useState } from 'react'
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card'
import { DataGrid } from '@/components/ui/data-grid'
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header'
import { DataGridPagination } from '@/components/ui/data-grid-pagination'
import { DataGridTable } from '@/components/ui/data-grid-table'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

interface ExpenseData {
  id: number
  date: string
  vendor: string
  amountDue: number
}

const mockExpenseData: ExpenseData[] = [
  { id: 1, date: '12 Nov, 2025', vendor: 'PT Telkom (Internet)', amountDue: 8500000 },
  { id: 2, date: '11 Nov, 2025', vendor: 'Office Supplies Co', amountDue: 5500000 },
  { id: 3, date: '10 Nov, 2025', vendor: 'Tech Equipment Ltd', amountDue: 12750500 },
  { id: 4, date: '09 Nov, 2025', vendor: 'PLN (Electricity)', amountDue: 6200000 },
  { id: 5, date: '08 Nov, 2025', vendor: 'Marketing Agency', amountDue: 8300750 },
  { id: 6, date: '07 Nov, 2025', vendor: 'Transport Services', amountDue: 4450250 },
  { id: 7, date: '06 Nov, 2025', vendor: 'Utilities Provider', amountDue: 3200000 },
  { id: 8, date: '05 Nov, 2025', vendor: 'Cleaning Services', amountDue: 2800000 },
  { id: 9, date: '04 Nov, 2025', vendor: 'Security Services', amountDue: 5600000 },
  { id: 10, date: '03 Nov, 2025', vendor: 'Software Subscription', amountDue: 15000000 },
  { id: 11, date: '02 Nov, 2025', vendor: 'Office Furniture', amountDue: 9800000 },
  { id: 12, date: '01 Nov, 2025', vendor: 'Training & Development', amountDue: 7200000 },
  { id: 13, date: '31 Oct, 2025', vendor: 'Printing Services', amountDue: 3500000 },
  { id: 14, date: '30 Oct, 2025', vendor: 'Catering Services', amountDue: 4100000 },
  { id: 15, date: '29 Oct, 2025', vendor: 'IT Maintenance', amountDue: 11500000 },
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function LatestExpenseTable() {
  const t = useTranslations('accountDashboard.latestExpense')
  const headerT = useTranslations('header')

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!searchQuery) return mockExpenseData
    return mockExpenseData.filter(
      (item) =>
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatRupiah(item.amountDue).toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const columns = useMemo<ColumnDef<ExpenseData>[]>(() => {
    return [
      {
        id: 'date',
        accessorFn: (row) => row.date,
        header: ({ column }) => <DataGridColumnHeader title={t('date')} column={column} />,
        cell: ({ row }) => <div className="font-medium pl-[0.375rem]">{row.original.date}</div>,
        enableSorting: true,
        size: 150,
        meta: { skeleton: <Skeleton className="h-5 w-[100px] ml-[0.375rem]" /> },
      },
      {
        id: 'vendor',
        accessorFn: (row) => row.vendor,
        header: ({ column }) => <DataGridColumnHeader title={t('vendor')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.vendor}</div>,
        enableSorting: true,
        size: 250,
        meta: { skeleton: <Skeleton className="h-5 w-[150px] ml-[0.375rem]" /> },
      },
      {
        id: 'amountDue',
        accessorFn: (row) => row.amountDue,
        header: ({ column }) => (
          <div className="flex justify-end w-full">
            <DataGridColumnHeader title={t('amountDue')} column={column} className="-mr-2" />
          </div>
        ),
        cell: ({ row }) => <div className="text-right font-medium pr-2">{formatRupiah(row.original.amountDue)}</div>,
        enableSorting: true,
        size: 160,
        meta: { skeleton: <Skeleton className="h-5 w-[120px] ml-auto -mr-2" />, cellClassName: 'text-right' },
      },
    ]
  }, [t])

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: ExpenseData) => String(row.id),
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <DataGrid table={table} recordCount={filteredData?.length || 0} tableLayout={{ cellBorder: true, dense: true }}>
      <Card className="py-2">
        <CardHeader className="px-3 py-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
              </svg>
            </div>
            <CardTitle className="text-sm">{t('title')}</CardTitle>
          </div>
          <CardToolbar className="relative w-full sm:w-auto flex items-center justify-end">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder={headerT('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 w-full sm:w-40 border-0 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 focus-visible:border-0 shadow-none transition-colors h-8"
            />
            {searchQuery.length > 0 && (
              <Button mode="icon" variant="ghost" className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery('')}>
                <X />
              </Button>
            )}
          </CardToolbar>
        </CardHeader>
        <CardTable>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
        <CardFooter className="px-3 py-1.5">
          <div className="scale-90 origin-left w-full">
            <DataGridPagination hideRowsSelector />
          </div>
        </CardFooter>
      </Card>
    </DataGrid>
  )
}
