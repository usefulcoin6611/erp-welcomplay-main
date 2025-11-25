import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface AgingDetailsRow {
  date: string
  transaction: string
  type: string
  status: string
  vendor: string
  age: number
  amount: number
  balanceDue: number
}

interface AgingDetailsTableProps {
  data: AgingDetailsRow[]
  allData: AgingDetailsRow[]
}

export function AgingDetailsTable({ data, allData }: AgingDetailsTableProps) {
  const t = useTranslations('reports.payables')

  const totals = allData.reduce(
    (acc, row) => {
      acc.amount += row.amount
      acc.balanceDue += row.balanceDue
      return acc
    },
    { amount: 0, balanceDue: 0 }
  )

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('agingDetails.date')}</TableHead>
            <TableHead>{t('agingDetails.transaction')}</TableHead>
            <TableHead>{t('agingDetails.type')}</TableHead>
            <TableHead>{t('agingDetails.status')}</TableHead>
            <TableHead>{t('agingDetails.vendor')}</TableHead>
            <TableHead>{t('agingDetails.age')}</TableHead>
            <TableHead className="text-right">{t('agingDetails.amount')}</TableHead>
            <TableHead className="text-right">{t('agingDetails.balanceDue')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            <>
              {data.map((row, idx) => (
                <TableRow key={row.transaction + idx}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{row.date}</TableCell>
                  <TableCell className="font-medium">{row.transaction}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell>{row.vendor}</TableCell>
                  <TableCell>{row.age} {t('days', { default: 'days' })}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.amount)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.balanceDue)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell colSpan={6}>{t('total')}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.amount)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.balanceDue)}</TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                {t('noDataFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
