import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Send,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react'

// Mock data - replace with real data from API
const creditNotesData = [
  {
    id: 'CN-001',
    date: '2024-01-14',
    customer: 'ABC Corporation',
    customerEmail: 'contact@abccorp.com',
    invoiceReference: 'INV-001',
    reason: 'Service refund - partial completion',
    amount: 2500,
    status: 'applied',
    items: [
      { description: 'Refund for incomplete service', quantity: 1, rate: 2500, amount: 2500 }
    ]
  },
  {
    id: 'CN-002',
    date: '2024-01-12',
    customer: 'XYZ Technologies',
    customerEmail: 'billing@xyztech.com',
    invoiceReference: 'INV-002',
    reason: 'Product return - quality issues',
    amount: 1200,
    status: 'pending',
    items: [
      { description: 'Product return refund', quantity: 2, rate: 600, amount: 1200 }
    ]
  },
  {
    id: 'CN-003',
    date: '2024-01-10',
    customer: 'Digital Solutions Inc.',
    customerEmail: 'finance@digitalsol.com',
    invoiceReference: 'INV-003',
    reason: 'Billing error correction',
    amount: 800,
    status: 'applied',
    items: [
      { description: 'Overcharge correction', quantity: 1, rate: 800, amount: 800 }
    ]
  },
  {
    id: 'CN-004',
    date: '2024-01-08',
    customer: 'StartupHub LLC',
    customerEmail: 'accounts@startuphub.com',
    invoiceReference: 'INV-004',
    reason: 'Service cancellation',
    amount: 3500,
    status: 'draft',
    items: [
      { description: 'Cancelled subscription refund', quantity: 1, rate: 3500, amount: 3500 }
    ]
  },
  {
    id: 'CN-005',
    date: '2024-01-06',
    customer: 'Global Enterprises',
    customerEmail: 'procurement@globalent.com',
    invoiceReference: 'INV-005',
    reason: 'Discount application',
    amount: 1800,
    status: 'applied',
    items: [
      { description: 'Volume discount adjustment', quantity: 1, rate: 1800, amount: 1800 }
    ]
  }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'applied':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'draft':
      return 'outline'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function CreditNotePage() {
  const totalAmount = creditNotesData.reduce((sum, cn) => sum + cn.amount, 0)
  const appliedAmount = creditNotesData.filter(cn => cn.status === 'applied').reduce((sum, cn) => sum + cn.amount, 0)
  const pendingAmount = creditNotesData.filter(cn => cn.status === 'pending').reduce((sum, cn) => sum + cn.amount, 0)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
                <p className="text-muted-foreground">
                  Manage refunds, adjustments and customer credits
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Credit Note
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Credit Notes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{creditNotesData.length}</div>
                  <p className="text-xs text-muted-foreground">
                    All credit notes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ${totalAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total credit value
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applied Credits</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${appliedAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((appliedAmount / totalAmount) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Credits</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    ${pendingAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting application
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Credit Notes List</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search credit notes..." className="pl-8 w-[300px]" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Credit Note #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Invoice Ref</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditNotesData.map((creditNote) => (
                      <TableRow key={creditNote.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{creditNote.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {creditNote.items.length} item{creditNote.items.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{creditNote.date}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{creditNote.customer}</p>
                            <p className="text-sm text-muted-foreground">{creditNote.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{creditNote.invoiceReference}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="text-sm truncate" title={creditNote.reason}>
                              {creditNote.reason}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-blue-600">
                            ${creditNote.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(creditNote.status)}>
                            {creditNote.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Credit Note
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Credit Note
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="mr-2 h-4 w-4" />
                                Send to Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Section */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Note Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Applied Credits</span>
                      <span className="text-sm font-medium text-green-600">
                        ${appliedAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Credits</span>
                      <span className="text-sm font-medium text-orange-600">
                        ${pendingAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Draft Credits</span>
                      <span className="text-sm font-medium text-gray-600">
                        ${creditNotesData.filter(cn => cn.status === 'draft').reduce((sum, cn) => sum + cn.amount, 0).toLocaleString()}
                      </span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-medium">
                      <span>Total Credit Value</span>
                      <span className="text-blue-600">${totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Credit Note
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Credit Notes
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send Notifications
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}