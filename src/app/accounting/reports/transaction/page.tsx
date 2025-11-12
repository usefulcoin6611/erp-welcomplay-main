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
import { Receipt, Search } from 'lucide-react'

export default function TransactionReportPage() {
  const transactionData = [
    { id: "TXN-001", date: "2025-10-30", type: "Income", category: "Sales", description: "Product Sale - ABC Corp", amount: 5000, account: "Business Account" },
    { id: "TXN-002", date: "2025-10-29", type: "Expense", category: "Marketing", description: "Google Ads Campaign", amount: -800, account: "Business Account" },
    { id: "TXN-003", date: "2025-10-28", type: "Income", category: "Service", description: "Consulting Service - XYZ Ltd", amount: 2500, account: "Business Account" },
    { id: "TXN-004", date: "2025-10-27", type: "Expense", category: "Office", description: "Office Supplies Purchase", amount: -150, account: "Business Account" },
    { id: "TXN-005", date: "2025-10-26", type: "Income", category: "Sales", description: "Product Sale - DEF Inc", amount: 3200, account: "Savings Account" },
    { id: "TXN-006", date: "2025-10-25", type: "Expense", category: "Utilities", description: "Electricity Bill", amount: -250, account: "Business Account" },
    { id: "TXN-007", date: "2025-10-24", type: "Income", category: "Service", description: "Web Development Project", amount: 4500, account: "Business Account" },
    { id: "TXN-008", date: "2025-10-23", type: "Expense", category: "Travel", description: "Client Meeting Travel", amount: -320, account: "Business Account" },
  ]

  const totalIncome = transactionData.filter(t => t.type === "Income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = Math.abs(transactionData.filter(t => t.type === "Expense").reduce((sum, t) => sum + t.amount, 0))
  const netAmount = totalIncome - totalExpense

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
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50">
                    <Receipt className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Transaction Report</h1>
                    <p className="text-muted-foreground">
                      Detailed listing of all financial transactions
                    </p>
                  </div>
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
                  <CardTitle className="text-lg">Transaction Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="text" 
                          id="search" 
                          placeholder="Search transactions..." 
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input type="date" id="start-date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input type="date" id="end-date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="account">Account</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Accounts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Accounts</SelectItem>
                          <SelectItem value="business">Business Account</SelectItem>
                          <SelectItem value="savings">Savings Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2 md:col-span-4">
                      <Button className="bg-blue-500 hover:bg-blue-600">Apply Filters</Button>
                      <Button variant="outline">Reset</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {transactionData.filter(t => t.type === "Income").length} transactions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${totalExpense.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {transactionData.filter(t => t.type === "Expense").length} transactions
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(netAmount).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {netAmount >= 0 ? 'Profit' : 'Loss'} this period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {transactionData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 7 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Complete list of all financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionData.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === "Income" ? "default" : "destructive"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{transaction.account}</TableCell>
                        <TableCell className="text-right font-mono">
                          <span className={transaction.amount >= 0 ? "text-green-600" : "text-red-600"}>
                            ${Math.abs(transaction.amount).toLocaleString()}
                          </span>
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