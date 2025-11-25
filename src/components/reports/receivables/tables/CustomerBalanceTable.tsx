import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface CustomerBalanceRow {
  customerName: string
  invoiceBalance: number
  availableCredits: number
  balance: number
}

interface CustomerBalanceTableProps {
  data: CustomerBalanceRow[]
  totalBalance: number
}

export function CustomerBalanceTable({ data, totalBalance }: CustomerBalanceTableProps) {
  const t = useTranslations('reports.receivables')

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('customerBalance.customerName')}</TableHead>
            <TableHead className="text-right">{t('customerBalance.invoiceBalance')}</TableHead>
            <TableHead className="text-right">{t('customerBalance.availableCredits')}</TableHead>
            <TableHead className="text-right">{t('customerBalance.balance')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            <>
              {data.map((row) => (
                <TableRow key={row.customerName}>
                  <TableCell className="font-medium">{row.customerName}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.invoiceBalance)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.availableCredits)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.balance)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell>{t('customerBalance.total')}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totalBalance)}</TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
