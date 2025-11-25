import { ColumnDef } from '@tanstack/react-table'
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRupiah } from '../utils/formatCurrency'
import { AccountStatementData } from './types'

export const getAccountStatementColumns = (t: (key: string) => string): ColumnDef<AccountStatementData>[] => {
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
      id: 'amount',
      accessorFn: (row) => row.amount,
      header: ({ column }) => (
        <div className="flex justify-end w-full">
          <DataGridColumnHeader title={t('amount')} column={column} className="-mr-2" />
        </div>
      ),
      cell: ({ row }) => {
        const isNegative = row.original.amount < 0
        return (
          <div className={`text-right font-medium pr-2 ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            {formatRupiah(row.original.amount)}
          </div>
        )
      },
      enableSorting: true,
      size: 180,
      meta: { skeleton: <Skeleton className="h-5 w-[120px] ml-auto -mr-2" />, cellClassName: 'text-right' },
    },
    {
      id: 'description',
      accessorFn: (row) => row.description,
      header: ({ column }) => <DataGridColumnHeader title={t('description')} column={column} />,
      cell: ({ row }) => <div className="pl-[0.375rem]">{row.original.description}</div>,
      enableSorting: false,
      size: 400,
      meta: { skeleton: <Skeleton className="h-5 w-[250px] ml-[0.375rem]" /> },
    },
  ]
}
