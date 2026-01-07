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
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconCalendar, IconDownload, IconPrinter } from '@tabler/icons-react'

type BillDetailPageProps = {
  params: { id: string }
}

// Temporary mock detail based on Laravel BillController::show structure
const mockBill = {
  billNumber: 'BILL-2025-001',
  vendor: {
    name: 'PT Teknologi Digital Indonesia',
    email: 'finance@teknologidigital.co.id',
    phone: '+62 21 1234 5678',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat, Indonesia',
  },
  billDate: '2025-11-01',
  dueDate: '2025-11-30',
  status: 'Draft',
  items: [
    {
      name: 'Website Development',
      description: 'Custom company website implementation',
      quantity: 1,
      unit: 'Service',
      price: 12000000,
      discount: 0,
      taxLabel: 'PPN 11%',
      total: 13320000,
    },
    {
      name: 'Maintenance Support',
      description: '1 year maintenance & support',
      quantity: 1,
      unit: 'Service',
      price: 2500000,
      discount: 0,
      taxLabel: 'PPN 11%',
      total: 2775000,
    },
  ],
  subtotal: 14500000,
  discountTotal: 0,
  taxTotal: 1595000,
  grandTotal: 16095000,
}

function getBillStatusClasses(status: string) {
  switch (status) {
    case 'Draft':
      return 'bg-gray-100 text-gray-700 border-none'
    case 'Sent':
      return 'bg-blue-100 text-blue-700 border-none'
    case 'Partial':
      return 'bg-yellow-100 text-yellow-700 border-none'
    case 'Paid':
      return 'bg-green-100 text-green-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default function BillDetailPage({ params }: BillDetailPageProps) {
  const id = params.id

  // In the future this should fetch by `id`, for now we reuse mockBill
  const bill = mockBill

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
                <h1 className="text-3xl font-bold">
                  Bill Detail
                </h1>
                <p className="text-muted-foreground">
                  Detail for bill{' '}
                  <span className="font-semibold">{bill.billNumber}</span>{' '}
                  (mock data, id: {id})
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <IconPrinter className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {/* Top info */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor</CardTitle>
                  <CardDescription>
                    Information about the vendor associated with this bill.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="font-semibold">{bill.vendor.name}</div>
                  <div className="text-muted-foreground">
                    {bill.vendor.email}
                  </div>
                  <div>{bill.vendor.phone}</div>
                  <div className="text-muted-foreground">
                    {bill.vendor.address}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bill Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bill Number</span>
                    <span className="font-medium">{bill.billNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bill Date</span>
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {bill.billDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {bill.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={getBillStatusClasses(bill.status)}>
                      {bill.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Items table */}
            <Card>
              <CardHeader>
                <CardTitle>Bill Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {item.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.taxLabel}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {item.discount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {item.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Totals */}
            <div className="flex justify-end">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rp {bill.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span>Rp {bill.discountTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>Rp {bill.taxTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg">
                      Rp {bill.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

