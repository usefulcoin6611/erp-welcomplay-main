import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface ReceivableSummaryRow {
  customerName: string
  date: string
  transaction: string
  status: string
  transactionType: string
  total: number
  balance: number
}

interface ReceivableSummaryTableProps {
  data: ReceivableSummaryRow[]
  allData: ReceivableSummaryRow[]
}

export function ReceivableSummaryTable({ data, allData }: ReceivableSummaryTableProps) {
  const t = useTranslations('reports.receivables')

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
            <TableHead>{t('receivableSummary.date')}</TableHead>
            <TableHead>{t('receivableSummary.transaction')}</TableHead>
            <TableHead>{t('receivableSummary.transactionType')}</TableHead>
            <TableHead>{t('receivableSummary.customerName')}</TableHead>
            <TableHead>{t('receivableSummary.status')}</TableHead>
            <TableHead className="text-right">{t('receivableSummary.total')}</TableHead>
            <TableHead className="text-right">{t('receivableSummary.balance')}</TableHead>
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
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.total)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.balance)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell colSpan={5}>{t('receivableSummary.total')}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.total)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.balance)}</TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                {t('noData', { default: 'No data found' })}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
