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
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

interface BillData {
  id: number
  number: string
  vendor: string
  billDate: string
  dueDate: string
  amount: number
  status: 'paid' | 'unpaid' | 'overdue'
}

const mockBillData: BillData[] = [
  { id: 1, number: 'BILL-2025-015', vendor: 'PT Telkom (Internet)', billDate: '12 Nov, 2025', dueDate: '26 Nov, 2025', amount: 8500000, status: 'unpaid' },
  { id: 2, number: 'BILL-2025-014', vendor: 'Office Supplies Co', billDate: '11 Nov, 2025', dueDate: '25 Nov, 2025', amount: 5500000, status: 'paid' },
  { id: 3, number: 'BILL-2025-013', vendor: 'Tech Equipment Ltd', billDate: '10 Nov, 2025', dueDate: '24 Nov, 2025', amount: 12750000, status: 'unpaid' },
  { id: 4, number: 'BILL-2025-012', vendor: 'PLN (Electricity)', billDate: '09 Nov, 2025', dueDate: '23 Nov, 2025', amount: 6200000, status: 'paid' },
  { id: 5, number: 'BILL-2025-011', vendor: 'Marketing Agency', billDate: '08 Nov, 2025', dueDate: '22 Nov, 2025', amount: 8900000, status: 'overdue' },
  { id: 6, number: 'BILL-2025-010', vendor: 'Rental Services', billDate: '07 Nov, 2025', dueDate: '21 Nov, 2025', amount: 15000000, status: 'unpaid' },
  { id: 7, number: 'BILL-2025-009', vendor: 'Utilities Provider', billDate: '06 Nov, 2025', dueDate: '20 Nov, 2025', amount: 3200000, status: 'paid' },
  { id: 8, number: 'BILL-2025-008', vendor: 'Cleaning Services', billDate: '05 Nov, 2025', dueDate: '19 Nov, 2025', amount: 2800000, status: 'paid' },
  { id: 9, number: 'BILL-2025-007', vendor: 'Security Services', billDate: '04 Nov, 2025', dueDate: '18 Nov, 2025', amount: 5600000, status: 'unpaid' },
  { id: 10, number: 'BILL-2025-006', vendor: 'Software Subscription', billDate: '03 Nov, 2025', dueDate: '17 Nov, 2025', amount: 15000000, status: 'paid' },
  { id: 11, number: 'BILL-2025-005', vendor: 'Office Furniture', billDate: '02 Nov, 2025', dueDate: '16 Nov, 2025', amount: 9800000, status: 'overdue' },
  { id: 12, number: 'BILL-2025-004', vendor: 'Training Services', billDate: '01 Nov, 2025', dueDate: '15 Nov, 2025', amount: 7200000, status: 'paid' },
  { id: 13, number: 'BILL-2025-003', vendor: 'Printing Services', billDate: '31 Oct, 2025', dueDate: '14 Nov, 2025', amount: 3500000, status: 'unpaid' },
  { id: 14, number: 'BILL-2025-002', vendor: 'Catering Services', billDate: '30 Oct, 2025', dueDate: '13 Nov, 2025', amount: 4100000, status: 'overdue' },
  { id: 15, number: 'BILL-2025-001', vendor: 'IT Maintenance', billDate: '29 Oct, 2025', dueDate: '12 Nov, 2025', amount: 11500000, status: 'paid' },
]

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function RecentBillsSection() {
  const t = useTranslations('accountDashboard.recentBills')
  const headerT = useTranslations('header')

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'billDate', desc: true }])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!searchQuery) return mockBillData
    return mockBillData.filter(
      (item) =>
        item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatRupiah(item.amount).toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery])

  const getStatusBadge = (status: 'paid' | 'unpaid' | 'overdue') => {
    const variants = {
      paid: 'bg-green-100 text-green-700 hover:bg-green-100',
      unpaid: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
      overdue: 'bg-red-100 text-red-700 hover:bg-red-100',
    }
    return (
      <Badge variant="secondary" className={variants[status]}>
        {t(`status.${status}`)}
      </Badge>
    )
  }

  const columns = useMemo<ColumnDef<BillData>[]>(() => {
    return [
      {
        id: 'number',
        accessorFn: (row) => row.number,
        header: ({ column }) => <DataGridColumnHeader title={t('number')} column={column} />,
        cell: ({ row }) => <div className="font-medium pl-[0.375rem]">{row.original.number}</div>,
        enableSorting: true,
        size: 120,
        meta: { skeleton: <Skeleton className="h-5 w-[80px] ml-[0.375rem]" /> },
      },
      {
        id: 'vendor',
        accessorFn: (row) => row.vendor,
        header: ({ column }) => <DataGridColumnHeader title={t('vendor')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.vendor}</div>,
        enableSorting: true,
        size: 200,
        meta: { skeleton: <Skeleton className="h-5 w-[150px] ml-[0.375rem]" /> },
      },
      {
        id: 'billDate',
        accessorFn: (row) => row.billDate,
        header: ({ column }) => <DataGridColumnHeader title={t('billDate')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.billDate}</div>,
        enableSorting: true,
        size: 130,
        meta: { skeleton: <Skeleton className="h-5 w-[100px] ml-[0.375rem]" /> },
      },
      {
        id: 'dueDate',
        accessorFn: (row) => row.dueDate,
        header: ({ column }) => <DataGridColumnHeader title={t('dueDate')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.dueDate}</div>,
        enableSorting: true,
        size: 130,
        meta: { skeleton: <Skeleton className="h-5 w-[100px] ml-[0.375rem]" /> },
      },
      {
        id: 'amount',
        accessorFn: (row) => row.amount,
        header: ({ column }) => (
          <div className="flex justify-end w-full">
            <DataGridColumnHeader title={t('amount')} column={column} className="-mr-2" />
          </div>
        ),
        cell: ({ row }) => <div className="text-right font-medium pr-2">{formatRupiah(row.original.amount)}</div>,
        enableSorting: true,
        size: 150,
        meta: { skeleton: <Skeleton className="h-5 w-[120px] ml-auto -mr-2" />, cellClassName: 'text-right' },
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => <DataGridColumnHeader title={t('status.label')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{getStatusBadge(row.original.status)}</div>,
        enableSorting: true,
        size: 110,
        meta: { skeleton: <Skeleton className="h-5 w-[70px] ml-[0.375rem]" /> },
      },
    ]
  }, [t])

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: BillData) => String(row.id),
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
      <Card className="py-2 xl:col-span-2">
        <CardHeader className="px-3 py-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                <rect width="20" height="12" x="2" y="6" rx="2"/>
                <path d="M12 12h.01"/>
                <path d="M17 12h.01"/>
                <path d="M7 12h.01"/>
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
