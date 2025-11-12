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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function TrialBalancePage() {
  const trialBalanceData = [
    // Assets
    { account: "Cash", accountCode: "1001", accountType: "Asset", debit: 50000, credit: 0 },
    { account: "Accounts Receivable", accountCode: "1002", accountType: "Asset", debit: 25000, credit: 0 },
    { account: "Inventory", accountCode: "1003", accountType: "Asset", debit: 75000, credit: 0 },
    { account: "Office Equipment", accountCode: "1004", accountType: "Asset", debit: 15000, credit: 0 },
    { account: "Furniture & Fixtures", accountCode: "1005", accountType: "Asset", debit: 20000, credit: 0 },
    
    // Liabilities
    { account: "Accounts Payable", accountCode: "2001", accountType: "Liability", debit: 0, credit: 18000 },
    { account: "Short-term Loan", accountCode: "2002", accountType: "Liability", debit: 0, credit: 12000 },
    { account: "Accrued Expenses", accountCode: "2003", accountType: "Liability", debit: 0, credit: 5000 },
    
    // Equity
    { account: "Owner's Capital", accountCode: "3001", accountType: "Equity", debit: 0, credit: 100000 },
    { account: "Retained Earnings", accountCode: "3002", accountType: "Equity", debit: 0, credit: 15000 },
    
    // Revenue
    { account: "Sales Revenue", accountCode: "4001", accountType: "Revenue", debit: 0, credit: 85000 },
    { account: "Service Revenue", accountCode: "4002", accountType: "Revenue", debit: 0, credit: 25000 },
    
    // Expenses
    { account: "Cost of Goods Sold", accountCode: "5001", accountType: "Expense", debit: 45000, credit: 0 },
    { account: "Rent Expense", accountCode: "5002", accountType: "Expense", debit: 12000, credit: 0 },
    { account: "Utilities Expense", accountCode: "5003", accountType: "Expense", debit: 3600, credit: 0 },
    { account: "Marketing Expense", accountCode: "5004", accountType: "Expense", debit: 8000, credit: 0 },
    { account: "Office Supplies Expense", accountCode: "5005", accountType: "Expense", debit: 2400, credit: 0 },
    { account: "Depreciation Expense", accountCode: "5006", accountType: "Expense", debit: 3000, credit: 0 },
  ]

  const totalDebit = trialBalanceData.reduce((sum, item) => sum + item.debit, 0)
  const totalCredit = trialBalanceData.reduce((sum, item) => sum + item.credit, 0)
  const isBalanced = totalDebit === totalCredit

  const groupedData = trialBalanceData.reduce((acc, item) => {
    if (!acc[item.accountType]) {
      acc[item.accountType] = []
    }
    acc[item.accountType].push(item)
    return acc
  }, {} as Record<string, typeof trialBalanceData>)

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
                  <h1 className="text-3xl font-bold">Trial Balance Report</h1>
                  <p className="text-muted-foreground">
                    Complete listing of all accounts with their debit and credit balances
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="as-of-date">As of Date</Label>
                      <Input type="date" id="as-of-date" defaultValue="2025-10-30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-from">Account From</Label>
                      <Input placeholder="1001" id="account-from" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-to">Account To</Label>
                      <Input placeholder="9999" id="account-to" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button>Generate Report</Button>
                    <Button variant="outline">Reset</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Trial Balance Status
                  <Badge variant={isBalanced ? "default" : "destructive"}>
                    {isBalanced ? "BALANCED" : "OUT OF BALANCE"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${totalDebit.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-600 font-medium">Total Debits</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      ${totalCredit.toLocaleString()}
                    </div>
                    <p className="text-sm text-orange-600 font-medium">Total Credits</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      ${Math.abs(totalDebit - totalCredit).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Difference</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trial Balance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Trial Balance as of October 30, 2025</CardTitle>
                <CardDescription>
                  All account balances showing debit and credit amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Account Type</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedData).map(([accountType, accounts]) => (
                      <>
                        <TableRow key={`header-${accountType}`} className="bg-gray-50">
                          <TableCell colSpan={5} className="font-bold text-gray-700">
                            {accountType.toUpperCase()}
                          </TableCell>
                        </TableRow>
                        {accounts.map((item, index) => (
                          <TableRow key={`${accountType}-${index}`}>
                            <TableCell className="font-mono">{item.accountCode}</TableCell>
                            <TableCell className="font-medium">{item.account}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.accountType}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {item.debit > 0 ? `$${item.debit.toLocaleString()}` : "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {item.credit > 0 ? `$${item.credit.toLocaleString()}` : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ))}
                    <TableRow className="border-t-2 border-gray-300 bg-gray-100">
                      <TableCell colSpan={3} className="font-bold">TOTAL</TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        ${totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono">
                        ${totalCredit.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary by Account Type */}
            <Card>
              <CardHeader>
                <CardTitle>Summary by Account Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Type</TableHead>
                      <TableHead className="text-right">Total Debit</TableHead>
                      <TableHead className="text-right">Total Credit</TableHead>
                      <TableHead className="text-right">Net Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(groupedData).map(([accountType, accounts]) => {
                      const typeDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0)
                      const typeCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0)
                      const netBalance = typeDebit - typeCredit
                      
                      return (
                        <TableRow key={accountType}>
                          <TableCell className="font-medium">{accountType}</TableCell>
                          <TableCell className="text-right font-mono">
                            ${typeDebit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${typeCredit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={netBalance >= 0 ? "text-green-600" : "text-red-600"}>
                              ${Math.abs(netBalance).toLocaleString()}
                              {netBalance < 0 ? " (CR)" : " (DR)"}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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