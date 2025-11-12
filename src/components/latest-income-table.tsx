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

interface IncomeData {
  id: number
  date: string
  customer: string
  amountDue: number
}

const mockIncomeData: IncomeData[] = [
  { id: 1, date: '12 Nov, 2025', customer: 'PT Telkom Indonesia', amountDue: 25000000 },
  { id: 2, date: '11 Nov, 2025', customer: 'Bank Mandiri', amountDue: 18500000 },
  { id: 3, date: '10 Nov, 2025', customer: 'PT Astra International', amountDue: 32000000 },
  { id: 4, date: '09 Nov, 2025', customer: 'Unilever Indonesia', amountDue: 15750000 },
  { id: 5, date: '08 Nov, 2025', customer: 'PT Pertamina', amountDue: 28300000 },
  { id: 6, date: '07 Nov, 2025', customer: 'Acme Corporation', amountDue: 12500000 },
  { id: 7, date: '06 Nov, 2025', customer: 'TechStart Inc', amountDue: 8750500 },
  { id: 8, date: '05 Nov, 2025', customer: 'Global Solutions', amountDue: 15200000 },
  { id: 9, date: '04 Nov, 2025', customer: 'Innovate Labs', amountDue: 6300750 },
  { id: 10, date: '03 Nov, 2025', customer: 'Digital Ventures', amountDue: 9450250 },
  { id: 11, date: '02 Nov, 2025', customer: 'PT Garuda Indonesia', amountDue: 22000000 },
  { id: 12, date: '01 Nov, 2025', customer: 'Bank BCA', amountDue: 19800000 },
  { id: 13, date: '31 Oct, 2025', customer: 'PT XL Axiata', amountDue: 16500000 },
  { id: 14, date: '30 Oct, 2025', customer: 'Indofood CBP', amountDue: 14200000 },
  { id: 15, date: '29 Oct, 2025', customer: 'PT Semen Indonesia', amountDue: 27500000 },
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function LatestIncomeTable() {
  const t = useTranslations('accountDashboard.latestIncome')
  const headerT = useTranslations('header')

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!searchQuery) return mockIncomeData
    return mockIncomeData.filter(
      (item) =>
        item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatRupiah(item.amountDue).toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const columns = useMemo<ColumnDef<IncomeData>[]>(() => {
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
        id: 'customer',
        accessorFn: (row) => row.customer,
        header: ({ column }) => <DataGridColumnHeader title={t('customer')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.customer}</div>,
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
    getRowId: (row: IncomeData) => String(row.id),
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
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
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
