import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface AgingSummaryRow {
  vendor: string
  current: number
  days1_15: number
  days16_30: number
  days31_45: number
  over45Days: number
  total: number
}

interface AgingSummaryTableProps {
  data: AgingSummaryRow[]
  totals: { current: number; days1_15: number; days16_30: number; days31_45: number; over45Days: number; total: number }
}

export function AgingSummaryTable({ data, totals }: AgingSummaryTableProps) {
  const t = useTranslations('reports.payables')

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('agingSummary.vendor')}</TableHead>
            <TableHead className="text-right">{t('agingSummary.current')}</TableHead>
            <TableHead className="text-right">{t('agingSummary.days1_15')}</TableHead>
            <TableHead className="text-right">{t('agingSummary.days16_30')}</TableHead>
            <TableHead className="text-right">{t('agingSummary.days31_45')}</TableHead>
            <TableHead className="text-right">{t('agingSummary.over45Days')}</TableHead>
            <TableHead className="text-right">{t('agingSummary.total')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            <>
              {data.map((row) => (
                <TableRow key={row.vendor}>
                  <TableCell className="font-medium">{row.vendor}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.current)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.days1_15)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.days16_30)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.days31_45)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.over45Days)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell>{t('total')}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.current)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.days1_15)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.days16_30)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.days31_45)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.over45Days)}</TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.total)}</TableCell>
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
