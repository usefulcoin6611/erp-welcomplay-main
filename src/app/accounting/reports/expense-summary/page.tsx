import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ExpenseSummaryPage() {
  const expenseData = [
    { category: "Office Supplies", amount: 25000, percentage: 35.7, count: 32 },
    { category: "Marketing", amount: 18000, percentage: 25.7, count: 15 },
    { category: "Travel & Transport", amount: 12000, percentage: 17.1, count: 22 },
    { category: "Utilities", amount: 8000, percentage: 11.4, count: 8 },
    { category: "Professional Services", amount: 7000, percentage: 10.0, count: 5 },
  ]

  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0)

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
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Expense Summary Report</h1>
                  <p className="text-muted-foreground">
                    Comprehensive breakdown of expenses by categories
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Export PDF</Button>
                  <Button variant="outline">Export Excel</Button>
                  <Button>Print</Button>
                </div>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input type="date" id="start-date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input type="date" id="end-date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="office">Office Supplies</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="travel">Travel & Transport</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="professional">Professional Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor">Vendor</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Vendors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vendors</SelectItem>
                          <SelectItem value="vendor1">Office Depot</SelectItem>
                          <SelectItem value="vendor2">Google Ads</SelectItem>
                          <SelectItem value="vendor3">Uber</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button>Apply Filters</Button>
                    <Button variant="outline">Reset</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${totalExpense.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +5.8% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {expenseData.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${Math.round(totalExpense / expenseData.reduce((sum, item) => sum + item.count, 0)).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    -2.5% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Office Supplies</div>
                  <p className="text-xs text-muted-foreground">
                    35.7% of total expenses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Expense Table */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown by Category</CardTitle>
                <CardDescription>
                  Detailed breakdown of expense categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-right">Transactions</TableHead>
                      <TableHead className="text-right">Avg. per Transaction</TableHead>
                      <TableHead>Priority</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenseData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${item.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.percentage.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${Math.round(item.amount / item.count).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.percentage > 30 ? "destructive" : item.percentage > 20 ? "default" : "secondary"}>
                            {item.percentage > 30 ? "High" : item.percentage > 20 ? "Medium" : "Low"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}