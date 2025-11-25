import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface PayableSummaryRow {
  vendor: string
  date: string
  transaction: string
  status: string
  transactionType: string
  total: number
  balance: number
}

interface PayableSummaryTableProps {
  data: PayableSummaryRow[]
  allData: PayableSummaryRow[]
}

export function PayableSummaryTable({ data, allData }: PayableSummaryTableProps) {
  const t = useTranslations('reports.payables')

  const totals = allData.reduce(
    (acc, row) => {
      acc.total += row.total
      acc.balance += row.balance
      return acc
    },
    { total: 0, balance: 0 }
  )

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('payableSummary.date')}</TableHead>
            <TableHead>{t('payableSummary.transaction')}</TableHead>
            <TableHead>{t('payableSummary.transactionType')}</TableHead>
            <TableHead>{t('payableSummary.vendor')}</TableHead>
            <TableHead>{t('payableSummary.status')}</TableHead>
            <TableHead className="text-right">{t('payableSummary.total')}</TableHead>
            <TableHead className="text-right">{t('payableSummary.balance')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            <>
              {data.map((row, idx) => (
                <TableRow key={row.transaction + idx}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{row.date}</TableCell>
                  <TableCell className="font-medium">{row.transaction}</TableCell>
                  <TableCell>{row.transactionType}</TableCell>
                  <TableCell>{row.vendor}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.total)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.balance)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell colSpan={5}>{t('total')}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.total)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.balance)}</TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                {t('noDataFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
