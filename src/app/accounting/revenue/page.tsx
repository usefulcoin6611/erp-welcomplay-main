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
  TrendingUp,
  Calendar,
  DollarSign,
  Receipt
} from 'lucide-react'

// Mock data - replace with real data from API
const revenueData = [
  {
    id: 'REV-001',
    date: '2024-01-15',
    customer: 'ABC Corporation',
    category: 'Web Development',
    description: 'Monthly web development services',
    amount: 15000,
    paymentMethod: 'Bank Transfer',
    reference: 'INV-001',
    status: 'received'
  },
  {
    id: 'REV-002',
    date: '2024-01-14',
    customer: 'XYZ Technologies',
    category: 'Consulting',
    description: 'Technical consultation services',
    amount: 5000,
    paymentMethod: 'Credit Card',
    reference: 'INV-002',
    status: 'received'
  },
  {
    id: 'REV-003',
    date: '2024-01-12',
    customer: 'Digital Solutions Inc.',
    category: 'Cloud Services',
    description: 'Cloud infrastructure setup',
    amount: 12000,
    paymentMethod: 'PayPal',
    reference: 'INV-003',
    status: 'pending'
  },
  {
    id: 'REV-004',
    date: '2024-01-10',
    customer: 'StartupHub LLC',
    category: 'Software License',
    description: 'Annual software license fee',
    amount: 8500,
    paymentMethod: 'Bank Transfer',
    reference: 'INV-004',
    status: 'received'
  },
  {
    id: 'REV-005',
    date: '2024-01-08',
    customer: 'Global Enterprises',
    category: 'E-commerce',
    description: 'E-commerce platform development',
    amount: 25000,
    paymentMethod: 'Wire Transfer',
    reference: 'INV-005',
    status: 'received'
  }
]

const categories = [
  { name: 'Web Development', amount: 40000, percentage: 60.6 },
  { name: 'Consulting', amount: 13500, percentage: 20.5 },
  { name: 'Cloud Services', amount: 12000, percentage: 18.2 },
  { name: 'Software License', amount: 8500, percentage: 12.9 }
]

function getStatusColor(status: string) {
  switch (status) {
    case 'received':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function RevenuePage() {
  const totalRevenue = revenueData.reduce((sum, revenue) => sum + revenue.amount, 0)
  const thisMonthRevenue = revenueData.filter(r => r.date.startsWith('2024-01')).reduce((sum, revenue) => sum + revenue.amount, 0)
  const receivedRevenue = revenueData.filter(r => r.status === 'received').reduce((sum, revenue) => sum + revenue.amount, 0)

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
                <h1 className="text-3xl font-bold tracking-tight">Revenue</h1>
                <p className="text-muted-foreground">
                  Track and manage your income streams
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Revenue
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time revenue
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${thisMonthRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Received</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    ${receivedRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((receivedRevenue / totalRevenue) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Entries</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Revenue List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Revenue Transactions</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search revenue..." className="pl-8 w-[250px]" />
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
                          <TableHead>Revenue #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueData.map((revenue) => (
                          <TableRow key={revenue.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{revenue.id}</p>
                                <p className="text-sm text-muted-foreground">{revenue.reference}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span className="text-sm">{revenue.date}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{revenue.customer}</p>
                                <p className="text-sm text-muted-foreground">{revenue.paymentMethod}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{revenue.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-green-600">
                                ${revenue.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(revenue.status)}>
                                {revenue.status}
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
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Revenue
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
              </div>

              {/* Revenue Categories */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{category.name}</span>
                            <span className="font-medium">${category.amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
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
                      Record Revenue
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Receipt className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}