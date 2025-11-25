import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'

interface ReceivableDetailsRow {
  customerName: string
  date: string
  transaction: string
  status: string
  transactionType: string
  itemName: string
  quantityOrdered: number
  itemPrice: number
  total: number
}

interface ReceivableDetailsTableProps {
  data: ReceivableDetailsRow[]
  allData: ReceivableDetailsRow[]
}

export function ReceivableDetailsTable({ data, allData }: ReceivableDetailsTableProps) {
  const t = useTranslations('reports.receivables')

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
            <TableHead>{t('receivableDetails.date')}</TableHead>
            <TableHead>{t('receivableDetails.transaction')}</TableHead>
            <TableHead>{t('receivableDetails.transactionType')}</TableHead>
            <TableHead>{t('receivableDetails.customerName')}</TableHead>
            <TableHead>{t('receivableDetails.status')}</TableHead>
            <TableHead>{t('receivableDetails.itemName')}</TableHead>
            <TableHead className="text-right">{t('receivableDetails.quantityOrdered')}</TableHead>
            <TableHead className="text-right">{t('receivableDetails.itemPrice')}</TableHead>
            <TableHead className="text-right">{t('receivableDetails.total')}</TableHead>
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
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell className="text-right font-mono">{row.quantityOrdered}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.itemPrice)}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(row.total)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-gray-50 dark:bg-gray-900">
                <TableCell colSpan={6}>{t('receivableDetails.total')}</TableCell>
                <TableCell className="text-right font-mono">{totals.quantity}</TableCell>
                <TableCell className="text-right"></TableCell>
                <TableCell className="text-right font-mono">{formatRupiah(totals.total)}</TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                {t('noData', { default: 'No data found' })}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
