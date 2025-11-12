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
import { useTranslations } from 'next-intl';

interface IMeeting {
  id: number;
  title: string;
  date: string;
  time: string;
}

const meetings: IMeeting[] = [
  { id: 1, title: 'Weekly Sync', date: '06 Nov, 2025', time: '10:00 AM' },
  { id: 2, title: 'Product Review', date: '08 Nov, 2025', time: '02:00 PM' },
  { id: 3, title: 'All Hands', date: '12 Nov, 2025', time: '09:00 AM' },
  { id: 4, title: 'One-on-One', date: '14 Nov, 2025', time: '11:30 AM' },
  { id: 5, title: 'Sprint Planning', date: '18 Nov, 2025', time: '03:00 PM' },
];

export const MeetingSchedule = ({ compact }: { compact?: boolean }) => {
  const t = useTranslations('hrmDashboard.meetingSchedule');
  const headerT = useTranslations('header');

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery) return meetings;
    return meetings.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const columns = useMemo<ColumnDef<IMeeting>[]>(() => {
    const cols: ColumnDef<IMeeting>[] = [];
    if (!compact) {
      cols.push({
        accessorKey: 'id',
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        size: 48,
      });
    }

    cols.push(
      {
        id: 'title',
        accessorFn: (r) => r.title,
        header: ({ column }) => (
          <div className="flex items-center h-8 pl-0">
            <DataGridColumnHeader title={t('table.title')} column={column} />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center h-8 pl-2">
            <span className="truncate font-medium text-sm">{row.original.title}</span>
          </div>
        ),
        enableSorting: true,
        size: 200,
        meta: { skeleton: <Skeleton className="h-4 w-[120px]" /> },
      },
      {
        id: 'date',
        accessorFn: (r) => r.date,
        header: ({ column }) => <DataGridColumnHeader title={t('table.date')} column={column} />,
        cell: ({ row }) => row.original.date,
        enableSorting: true,
        size: 140,
        meta: { skeleton: <Skeleton className="h-4 w-[80px]" /> },
      },
      {
        id: 'time',
        accessorFn: (r) => r.time,
        header: ({ column }) => <DataGridColumnHeader title={t('table.time')} column={column} />,
        cell: ({ row }) => row.original.time,
        enableSorting: false,
        size: 120,
        meta: { skeleton: <Skeleton className="h-4 w-[60px]" /> },
      },
    );

    return cols;
  }, [compact, t]);

  const table = useReactTable({
    columns,
    data: filtered,
    pageCount: Math.ceil((filtered?.length || 0) / pagination.pageSize),
    getRowId: (r: IMeeting) => String(r.id),
    state: { pagination, sorting, rowSelection },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: !compact,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={filtered?.length || 0} tableLayout={{ columnsPinnable: true, columnsVisibility: true, cellBorder: true, dense: !!compact }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* Calendar icon for meeting */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
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

export default MeetingSchedule;
