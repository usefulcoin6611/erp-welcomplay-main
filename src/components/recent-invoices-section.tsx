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
import { useAccountDashboard } from '@/contexts/account-dashboard-context'

interface InvoiceData {
  id: number
  number: string
  customer: string
  issueDate: string
  dueDate: string
  amount: number
  status: 'paid' | 'unpaid' | 'overdue'
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function RecentInvoicesSection() {
  const t = useTranslations('accountDashboard.recentInvoices')
  const headerT = useTranslations('header')
  const { data, loading } = useAccountDashboard()
  const invoiceData: InvoiceData[] = data.recentInvoices

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'issueDate', desc: true }])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!searchQuery) return invoiceData
    return invoiceData.filter(
      (item) =>
        item.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatRupiah(item.amount).toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [invoiceData, searchQuery])

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

  const columns = useMemo<ColumnDef<InvoiceData>[]>(() => {
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
        id: 'customer',
        accessorFn: (row) => row.customer,
        header: ({ column }) => <DataGridColumnHeader title={t('customer')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.customer}</div>,
        enableSorting: true,
        size: 200,
        meta: { skeleton: <Skeleton className="h-5 w-[150px] ml-[0.375rem]" /> },
      },
      {
        id: 'issueDate',
        accessorFn: (row) => row.issueDate,
        header: ({ column }) => <DataGridColumnHeader title={t('issueDate')} column={column} />,
        cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.issueDate}</div>,
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
    getRowId: (row: InvoiceData) => String(row.id),
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) {
    return (
      <Card className="py-2 xl:col-span-2">
        <CardHeader className="px-3 py-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
        <CardTable>
          <div className="px-3 py-2 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardTable>
      </Card>
    )
  }

  return (
    <DataGrid table={table} recordCount={filteredData?.length || 0} tableLayout={{ cellBorder: true, dense: true }}>
      <Card className="py-2 xl:col-span-2">
        <CardHeader className="px-3 py-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
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
