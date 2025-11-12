"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, TrendingDown } from "lucide-react"

interface BankAccount {
  id: string
  name: string
  accountNumber: string
  balance: number
  type: string
  change: number
  changeType: 'up' | 'down'
}

const mockAccounts: BankAccount[] = [
  {
    id: "1",
    name: "Bank Mandiri",
    accountNumber: "1234567890",
    balance: 125000000,
    type: "Checking",
    change: 5.2,
    changeType: 'up'
  },
  {
    id: "2",
    name: "Bank BCA",
    accountNumber: "9876543210",
    balance: 85000000,
    type: "Savings",
    change: 3.1,
    changeType: 'up'
  },
  {
    id: "3",
    name: "Bank BNI",
    accountNumber: "5555666677",
    balance: 45000000,
    type: "Checking",
    change: -2.5,
    changeType: 'down'
  },
]

export function AccountBalanceMock() {
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Saldo Rekening</CardTitle>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">Total Saldo</p>
          <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{account.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {account.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {account.accountNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(account.balance)}</p>
                <div className="flex items-center gap-1 justify-end mt-1">
                  {account.changeType === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs ${
                      account.changeType === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {account.change > 0 ? '+' : ''}{account.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
