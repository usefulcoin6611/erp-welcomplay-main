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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconCalendar } from '@tabler/icons-react'

type DebitNoteDetailPageProps = {
  params: Promise<{ id: string }>
}

// Mock debit note detail (mirroring how credit/debit notes are structured in Laravel)
const mockDebitNote = {
  number: 'DN-2025-001',
  date: '2025-11-09',
  vendor: 'PT Supply Berkah',
  relatedBill: 'BILL-2025-005',
  reason: 'Price adjustment for overbilled items',
  status: 'Applied',
  items: [
    {
      description: 'Overcharge adjustment',
      quantity: 1,
      rate: 1500000,
      amount: 1500000,
    },
  ],
  total: 1500000,
}

function getDebitStatusClasses(status: string) {
  switch (status) {
    case 'Applied':
      return 'bg-green-100 text-green-700 border-none'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Draft':
      return 'bg-gray-100 text-gray-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default async function DebitNoteDetailPage({ params }: DebitNoteDetailPageProps) {
  const { id } = await params
  const note = mockDebitNote

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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Debit Note Detail</h1>
                <p className="text-muted-foreground">
                  Detail for debit note{' '}
                  <span className="font-semibold">{note.number}</span>{' '}
                  (mock data, id: {id})
                </p>
              </div>
              <Badge className={getDebitStatusClasses(note.status)}>
                {note.status}
              </Badge>
            </div>

            {/* Info cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="font-medium">{note.vendor}</div>
                  <div className="text-muted-foreground">
                    Related Bill: {note.relatedBill}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Debit Note Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Number</span>
                    <span className="font-medium">{note.number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {note.date}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reason */}
            <Card>
              <CardHeader>
                <CardTitle>Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{note.reason}</p>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Debit Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {note.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {item.rate.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {item.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Total */}
            <div className="flex justify-end">
              <Card className="w-full max-w-sm">
                <CardHeader>
                  <CardTitle>Total Debit</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>Rp {note.total.toLocaleString()}</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

