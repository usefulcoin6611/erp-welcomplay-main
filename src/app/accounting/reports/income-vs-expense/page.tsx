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

export default function IncomeVsExpensePage() {
  const monthlyData = [
    { month: "January", income: 45000, expense: 32000, profit: 13000 },
    { month: "February", income: 52000, expense: 29000, profit: 23000 },
    { month: "March", income: 48000, expense: 35000, profit: 13000 },
    { month: "April", income: 58000, expense: 31000, profit: 27000 },
    { month: "May", income: 62000, expense: 38000, profit: 24000 },
    { month: "June", income: 55000, expense: 33000, profit: 22000 },
  ]

  const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0)
  const totalExpense = monthlyData.reduce((sum, item) => sum + item.expense, 0)
  const totalProfit = totalIncome - totalExpense

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
                  <h1 className="text-3xl font-bold">Income vs Expense Summary</h1>
                  <p className="text-muted-foreground">
                    Comparative analysis of income and expenses over time
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
                      <Label htmlFor="period">Period</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Monthly" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                          <SelectItem value="checking">Checking Account</SelectItem>
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
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12.3% from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${totalExpense.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +5.8% from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalProfit.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +24.7% from last period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((totalProfit / totalIncome) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +3.2% from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income vs Expense Analysis</CardTitle>
                <CardDescription>
                  Detailed monthly breakdown showing income, expenses, and profit margins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Income</TableHead>
                      <TableHead className="text-right">Expenses</TableHead>
                      <TableHead className="text-right">Profit/Loss</TableHead>
                      <TableHead className="text-right">Profit Margin</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((item, index) => {
                      const profitMargin = (item.profit / item.income) * 100
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.month}</TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            ${item.income.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-red-600">
                            ${item.expense.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={item.profit > 0 ? "text-green-600" : "text-red-600"}>
                              ${item.profit.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {profitMargin.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            <Badge variant={profitMargin > 40 ? "default" : profitMargin > 25 ? "secondary" : profitMargin > 0 ? "outline" : "destructive"}>
                              {profitMargin > 40 ? "Excellent" : profitMargin > 25 ? "Good" : profitMargin > 0 ? "Average" : "Loss"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Highest Profit Month</span>
                    <span className="text-sm font-bold text-green-600">April - $27,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium">Lowest Profit Month</span>
                    <span className="text-sm font-bold text-red-600">January & March - $13,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Average Monthly Profit</span>
                    <span className="text-sm font-bold text-green-600">${Math.round(totalProfit / monthlyData.length).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Trends & Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800">Income Growth</h4>
                    <p className="text-xs text-yellow-600 mt-1">
                      Income has shown steady growth with a 37.8% increase from January to May
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-800">Expense Control</h4>
                    <p className="text-xs text-orange-600 mt-1">
                      Expenses fluctuate between $29K-$38K. Consider budget control measures
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800">Profit Optimization</h4>
                    <p className="text-xs text-green-600 mt-1">
                      Strong profit margins averaging 35.8%. Focus on maintaining current performance
                    </p>
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