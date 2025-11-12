"use client";

import React, { useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

interface IData {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

const data: IData[] = [
  {
    id: 1,
    title: 'System Maintenance',
    description: 'Planned system maintenance for core services.',
    start_date: '01 Nov, 2025',
    end_date: '01 Nov, 2025',
  },
  {
    id: 2,
    title: 'Holiday Notice',
    description: 'Company holiday on the 25th – offices closed.',
    start_date: '25 Dec, 2025',
    end_date: '25 Dec, 2025',
  },
  {
    id: 3,
    title: 'Policy Update',
    description: 'Updated remote-work policy available in HR portal.',
    start_date: '10 Nov, 2025',
    end_date: '10 Nov, 2025',
  },
  {
    id: 4,
    title: 'Office Relocation',
    description: 'Head office will relocate to new building.',
    start_date: '05 Jan, 2026',
    end_date: '05 Jan, 2026',
  },
  {
    id: 5,
    title: 'Security Training',
    description: 'Mandatory security awareness training for all staff.',
    start_date: '15 Nov, 2025',
    end_date: '30 Nov, 2025',
  },
];

const AnnouncementList = ({ compact }: { compact?: boolean }) => {
  const t = useTranslations('hrmDashboard.announcementList');
  const headerT = useTranslations('header');

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'start_date', desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(
      (item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<IData>[]>(() => {
    const cols: ColumnDef<IData>[] = [];

    if (!compact) {
      cols.push({
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 48,
        meta: { cellClassName: '' },
      });
    }

    cols.push(
      {
        id: 'title',
        accessorFn: (row) => row.title,
        header: ({ column }) => (
          <div className="flex items-center h-8 pl-0">
            <DataGridColumnHeader title={t('table.title')} column={column} />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center h-8 pl-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="leading-none font-medium text-sm text-mono hover:text-primary truncate">{row.original.title}</div>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>
                <div className="max-w-xs text-sm">{row.original.description}</div>
              </TooltipContent>
            </Tooltip>
          </div>
        ),
        enableSorting: true,
        size: 200,
        meta: {
          skeleton: (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-[125px]" />
              <Skeleton className="h-2.5 w-[90px]" />
            </div>
          ),
        },
      },
      {
        id: 'start_date',
        accessorFn: (row) => row.start_date,
        header: ({ column }) => <DataGridColumnHeader title={t('table.startDate')} column={column} />,
        cell: ({ row }) => row.original.start_date,
        enableSorting: true,
        size: 135,
        meta: { skeleton: <Skeleton className="h-5 w-[70px]" /> },
      },
      {
        id: 'end_date',
        accessorFn: (row) => row.end_date,
        header: ({ column }) => <DataGridColumnHeader title={t('table.endDate')} column={column} />,
        cell: ({ row }) => row.original.end_date,
        enableSorting: true,
        size: 135,
        meta: { skeleton: <Skeleton className="h-5 w-[70px]" /> },
      },
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: ({ column }) => <DataGridColumnHeader title={t('table.description')} column={column} />,
        cell: ({ row }) => <div className="text-sm text-secondary-foreground leading-5 line-clamp-2">{row.original.description}</div>,
        enableSorting: false,
        size: 220,
        meta: { skeleton: <Skeleton className="h-5 w-[140px]" /> },
      },
    );

    return cols;
  }, [compact, t]);

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: IData) => String(row.id),
    state: { pagination, sorting, rowSelection },
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: !compact,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={filteredData?.length || 0} tableLayout={{ columnsPinnable: true, columnsMovable: true, columnsVisibility: true, cellBorder: true, dense: !!compact }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* Megaphone icon for announcement */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M3 11V7a2 2 0 0 1 2-2h2l9-3v16l-9-3H5a2 2 0 0 1-2-2v-4z"/><path d="M16 8v8"/><circle cx="6" cy="15" r="2"/></svg>
            {t('title')}
          </CardTitle>
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
        <CardFooter>
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
};

export { AnnouncementList };
