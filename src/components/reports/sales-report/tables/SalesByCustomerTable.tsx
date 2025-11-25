import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'
import { SalesByCustomerRow } from '../constants'

interface SalesByCustomerTableProps {
  data: SalesByCustomerRow[]
}

export function SalesByCustomerTable({ data }: SalesByCustomerTableProps) {
  const t = useTranslations('reports.salesReport')

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('customer')}</TableHead>
            <TableHead className="text-right">{t('orders')}</TableHead>
            <TableHead className="text-right">{t('revenue')}</TableHead>
            <TableHead className="text-right">{t('avgOrder')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.customer}>
              <TableCell className="font-medium">{row.customer}</TableCell>
              <TableCell className="text-right">{row.orders}</TableCell>
              <TableCell className="text-right font-mono">
                {formatRupiah(row.revenue)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatRupiah(row.avgOrder)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
