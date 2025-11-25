import { useTranslations } from 'next-intl'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRupiah } from '../../utils/formatCurrency'
import { SalesByItemRow } from '../constants'

interface SalesByItemTableProps {
  data: SalesByItemRow[]
}

export function SalesByItemTable({ data }: SalesByItemTableProps) {
  const t = useTranslations('reports.salesReport')

  return (
    <div className="overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('invoiceItem')}</TableHead>
            <TableHead className="text-center">{t('quantity')}</TableHead>
            <TableHead className="text-right">{t('amount')}</TableHead>
            <TableHead className="text-right">{t('avgPrice')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.item}>
              <TableCell className="font-medium">{row.item}</TableCell>
              <TableCell className="text-center">{row.quantity}</TableCell>
              <TableCell className="text-right font-mono">
                {formatRupiah(row.revenue)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatRupiah(row.avgPrice)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
