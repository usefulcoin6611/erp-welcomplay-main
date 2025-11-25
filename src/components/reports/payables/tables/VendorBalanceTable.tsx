import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface VendorBalanceRow {
  vendor: string
  totalBilled: number
  availableDebit: number
  closingBalance: number
}

interface VendorBalanceTableProps {
  data: VendorBalanceRow[]
  totalBalance: { closingBalance: number }
}

export function VendorBalanceTable({ data, totalBalance }: VendorBalanceTableProps) {
  const t = useTranslations('reports.payables')

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('vendorBalance.vendor')}</TableHead>
            <TableHead className="text-right">{t('vendorBalance.billedAmount')}</TableHead>
            <TableHead className="text-right">{t('vendorBalance.availableDebit')}</TableHead>
            <TableHead className="text-right">{t('vendorBalance.closingBalance')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            <>
              {data.map((row) => (
                <TableRow key={row.vendor}>
                  <TableCell className="font-medium">{row.vendor}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.totalBilled)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.availableDebit)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.closingBalance)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell>{t('total')}</TableCell>
                <TableCell className="text-right font-mono"></TableCell>
                <TableCell className="text-right font-mono"></TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totalBalance.closingBalance)}</TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                {t('noDataFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
