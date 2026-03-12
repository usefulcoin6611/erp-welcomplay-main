import { Card, CardContent } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { formatRupiah } from '../../utils/formatCurrency'
import { AccountSummary } from '../types'

interface PaymentAccountCardProps {
  account: AccountSummary
}

export function PaymentAccountCard({ account }: PaymentAccountCardProps) {
  const title =
    account.holderName === 'Cash'
      ? account.holderName
      : !account.holderName
      ? 'Stripe / Paypal'
      : account.bankName
      ? `${account.holderName} - ${account.bankName}`
      : account.holderName

  return (
    <Card className="overflow-hidden">
      <CardContent className="px-3 py-2">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 shrink-0">
            <Building2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1.5 truncate">{title}</p>
            <p className="text-base font-bold text-red-600">{formatRupiah(account.total)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
