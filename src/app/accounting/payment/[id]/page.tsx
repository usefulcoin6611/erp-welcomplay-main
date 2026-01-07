import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconCalendar, IconCreditCard } from '@tabler/icons-react'

type PaymentDetailPageProps = {
  params: { id: string }
}

// Mock payment detail based on PaymentController::index/show-like data
const mockPayment = {
  number: 'PAY-2025-001',
  date: '2025-11-07',
  vendor: 'PT Supply Berkah',
  account: 'BCA - Main Operating',
  category: 'Expense',
  amount: 5000000,
  reference: 'REF-INV-2025-010',
  description: 'Partial payment for November purchases',
  status: 'Completed',
}

export default function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const id = params.id
  const payment = mockPayment

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Payment Detail</h1>
                <p className="text-muted-foreground">
                  Detail for payment{' '}
                  <span className="font-semibold">{payment.number}</span>{' '}
                  (mock data, id: {id})
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700 border-none">
                {payment.status}
              </Badge>
            </div>

            {/* Main info */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor</CardTitle>
                  <CardDescription>
                    Vendor associated with this payment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="font-medium">{payment.vendor}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment No.</span>
                    <span className="font-medium">{payment.number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {payment.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span className="flex items-center gap-1">
                      <IconCreditCard className="h-3 w-3" />
                      {payment.account}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <Badge className="bg-blue-50 text-blue-700 border-none">
                      {payment.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amount + reference */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-xl font-semibold text-green-600">
                    Rp {payment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span>{payment.reference}</span>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    Description
                  </div>
                  <p>{payment.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

