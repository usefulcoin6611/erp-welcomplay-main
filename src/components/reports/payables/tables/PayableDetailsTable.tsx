import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface PayableDetailsRow {
  vendor: string
  date: string
  transaction: string
  status: string
  transactionType: string
  itemName: string
  quantityOrdered: number
  itemPrice: number
  total: number
}

interface PayableDetailsTableProps {
  data: PayableDetailsRow[]
  allData: PayableDetailsRow[]
}

export function PayableDetailsTable({ data, allData }: PayableDetailsTableProps) {
  const t = useTranslations('reports.payables')

  const totals = allData.reduce(
    (acc, row) => {
      acc.total += row.total
      acc.quantity += row.quantityOrdered
      return acc
    },
    { total: 0, quantity: 0 }
  )

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('payableDetails.date')}</TableHead>
            <TableHead>{t('payableDetails.transaction')}</TableHead>
            <TableHead>{t('payableDetails.transactionType')}</TableHead>
            <TableHead>{t('payableDetails.vendor')}</TableHead>
            <TableHead>{t('payableDetails.status')}</TableHead>
            <TableHead>{t('payableDetails.itemName')}</TableHead>
            <TableHead className="text-right">{t('payableDetails.quantityOrdered')}</TableHead>
            <TableHead className="text-right">{t('payableDetails.itemPrice')}</TableHead>
            <TableHead className="text-right">{t('payableDetails.total')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            <>
              {data.map((row, idx) => (
                <TableRow key={row.transaction + row.itemName + idx}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">{row.date}</TableCell>
                  <TableCell className="font-medium">{row.transaction}</TableCell>
                  <TableCell>{row.transactionType}</TableCell>
                  <TableCell>{row.vendor}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell className="text-right font-mono">{row.quantityOrdered}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.itemPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell colSpan={6}>{t('total')}</TableCell>
                <TableCell className="text-right font-mono">{totals.quantity}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.total)}</TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                {t('noDataFound')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
