'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import {
  Printer,
  FileDown,
  Filter,
  Columns2,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react'

interface PLAccount {
  account_id: string | number
  account_code: string
  account_name: string
  netAmount: number
  account?: string
}

interface PLGroup {
  Type: string
  account: PLAccount[][]
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function ProfitLossTab() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0])
  const [viewType, setViewType] = useState<'vertical' | 'horizontal'>('vertical')
  const [loading, setLoading] = useState(false)
  const [plData, setPLData] = useState<PLGroup[]>([])

  const fetchProfitLoss = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ startDate, endDate })
      const response = await fetch(`/api/reports/profit-loss?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setPLData(result.data)
      }
    } catch (error) {
      console.error('Error fetching profit loss:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchProfitLoss()
  }, [fetchProfitLoss])

  const handleExport = () => {
    const rows = [
      ['Account Name', 'Account Code', 'Amount'],
    ]

    plData.forEach(group => {
      rows.push([group.Type.toUpperCase(), '', ''])
      group.account.forEach(accounts => {
        accounts.forEach(record => {
          rows.push([record.account_name, record.account_code, record.netAmount.toString()])
        })
      })
    })

    const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `profit_loss_${startDate}_to_${endDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    const printContents = document.getElementById('printableArea')?.innerHTML
    if (printContents) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Profit & Loss - ${user?.name || 'User'}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
                .text-end { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .bg-muted { background-color: #f4f4f5; }
                .pl-4 { padding-left: 20px; }
                .border-b { border-bottom: 1px solid #e5e7eb; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .py-3 { padding-top: 12px; padding-bottom: 12px; }
                .mt-4 { margin-top: 16px; }
                .mb-2 { margin-bottom: 8px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                .w-full { width: 100%; }
                .gap-8 { gap: 2rem; }
                .flex-1 { flex: 1; }
                .border-r { border-right: 1px solid #e5e7eb; }
                .pr-8 { padding-right: 2rem; }
              </style>
            </head>
            <body>
              ${printContents}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

  const { totalIncome, totalCosts, totalExpenses } = useMemo(() => {
    let income = 0
    let costs = 0
    let expenses = 0

    plData.forEach((group) => {
      const totalRecord = group.account[0]?.find(a => a.account_name.startsWith('Total '))
      const amount = totalRecord?.netAmount || 0
      
      if (group.Type === 'Income') income = amount
      else if (group.Type === 'Costs of Goods Sold') costs = amount
      else if (group.Type === 'Expenses') expenses = amount
    })

    return { totalIncome: income, totalCosts: costs, totalExpenses: expenses }
  }, [plData])

  const grossProfit = totalIncome - totalCosts
  const netProfit = grossProfit - totalExpenses

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 px-6 py-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Profit &amp; Loss</CardTitle>
            <CardDescription>View profit and loss report for a period.</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Inline Filters */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                fetchProfitLoss()
              }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap uppercase tracking-wider">Start</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-36 px-2 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap uppercase tracking-wider">End</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-36 px-2 text-xs"
                />
              </div>
              <div className="flex items-center gap-1.5 ml-1">
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm" 
                  className="shadow-none h-8 w-8 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" 
                  title="Apply"
                >
                  <Search className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-none h-8 w-8 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                  onClick={() => {
                    setStartDate(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
                    setEndDate(new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0])
                  }}
                  title="Reset"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </form>

            <div className="h-6 w-px bg-border mx-1" />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shadow-none h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                onClick={handlePrint}
                title="Print"
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="shadow-none h-8 px-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-100"
                title="Export"
                onClick={handleExport}
              >
                <FileDown className="mr-2 h-3.5 w-3.5" />
                <span className="text-xs">Export</span>
              </Button>
              <Button
                variant={viewType === 'horizontal' ? 'blue' : 'secondary'}
                size="sm"
                className="shadow-none h-8 w-8 p-0"
                onClick={() => setViewType(viewType === 'vertical' ? 'horizontal' : 'vertical')}
                title={viewType === 'vertical' ? "Horizontal View" : "Vertical View"}
              >
                <Columns2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profit & Loss */}
      <div id="printableArea">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <div className="border-b border-border px-6 py-4">
                <h5 className="text-lg font-semibold text-foreground">
                  Profit & Loss of {user?.name || 'User'} as of {startDate} to {endDate}
                </h5>
              </div>
              <CardContent className="overflow-auto p-0">
                <div className="px-6 py-5 relative min-h-[200px]">
                  {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}

                  <div className={`${viewType === 'horizontal' ? 'flex gap-8' : ''}`}>
                    {/* Left Column: Income */}
                    <div className={`${viewType === 'horizontal' ? 'flex-1 border-r border-border pr-8' : 'w-full'}`}>
                      <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm font-semibold">
                        <span className="min-w-0 flex-1">Account</span>
                        <span className="w-28 shrink-0 text-center">Account Code</span>
                        <span className="w-32 shrink-0 text-end">Total</span>
                      </div>

                      {plData.filter(g => g.Type === 'Income').map((group) => (
                        <div key={group.Type} className="border-b border-border/60 py-3">
                          <p className="mb-2 mt-1 text-sm font-bold text-foreground">{group.Type}</p>
                          {group.account.map((records) =>
                            records
                              .filter((record: PLAccount) => !record.account_name.startsWith('Total '))
                              .map((record: PLAccount) => (
                                <div
                                  key={record.account_id}
                                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                >
                                  <span className="min-w-0 flex-1 pl-4">
                                    <a
                                      href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                      className="text-primary hover:underline"
                                    >
                                      {record.account_name}
                                    </a>
                                  </span>
                                  <span className="w-28 shrink-0 text-center">{record.account_code}</span>
                                  <span className="w-32 shrink-0 text-end tabular-nums text-foreground">
                                    {formatPrice(record.netAmount)}
                                  </span>
                                </div>
                              ))
                          )}
                          <div className="flex items-center justify-between gap-4 py-3 font-bold text-sm">
                            <span className="min-w-0 flex-1">Total Income</span>
                            <span className="w-28 shrink-0 text-center" />
                            <span className="w-32 shrink-0 text-end tabular-nums">{formatPrice(totalIncome)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column: Costs & Expenses */}
                    <div className={`${viewType === 'horizontal' ? 'flex-1' : 'w-full'}`}>
                      {viewType === 'horizontal' && (
                        <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm font-semibold">
                          <span className="min-w-0 flex-1">Account</span>
                          <span className="w-28 shrink-0 text-center">Account Code</span>
                          <span className="w-32 shrink-0 text-end">Total</span>
                        </div>
                      )}

                      {plData.filter(g => g.Type !== 'Income').map((group) => (
                        <div key={group.Type} className="border-b border-border/60 py-3">
                          <p className="mb-2 mt-1 text-sm font-bold text-foreground">{group.Type}</p>
                          {group.account.map((records) =>
                            records
                              .filter((record: PLAccount) => !record.account_name.startsWith('Total '))
                              .map((record: PLAccount) => {
                                const netAmount =
                                  record.netAmount > 0 ? record.netAmount : -record.netAmount
                                return (
                                  <div
                                    key={record.account_id}
                                    className="flex items-center justify-between gap-4 py-2.5 text-sm"
                                  >
                                    <span className="min-w-0 flex-1 pl-4">
                                      <a
                                        href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                        className="text-primary hover:underline"
                                      >
                                        {record.account_name}
                                      </a>
                                    </span>
                                    <span className="w-28 shrink-0 text-center">{record.account_code}</span>
                                    <span className="w-32 shrink-0 text-end tabular-nums text-foreground">
                                      {formatPrice(netAmount)}
                                    </span>
                                  </div>
                                )
                              })
                          )}
                          <div className="flex items-center justify-between gap-4 py-3 font-bold text-sm">
                            <span className="min-w-0 flex-1">
                              {group.Type === 'Costs of Goods Sold' ? 'Total Costs' : 'Total Expenses'}
                            </span>
                            <span className="w-28 shrink-0 text-center" />
                            <span className="w-32 shrink-0 text-end tabular-nums">
                              {formatPrice(group.Type === 'Costs of Goods Sold' ? totalCosts : totalExpenses)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Row */}
                  <div className="mt-6 space-y-2 border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-4 py-2 font-bold text-sm">
                      <span className="min-w-0 flex-1">Gross Profit</span>
                      <span className="w-28 shrink-0 text-center" />
                      <span className="w-32 shrink-0 text-end tabular-nums">{formatPrice(grossProfit)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2 font-bold text-base text-primary">
                      <span className="min-w-0 flex-1">Net Profit</span>
                      <span className="w-28 shrink-0 text-center" />
                      <span className="w-32 shrink-0 text-end tabular-nums">{formatPrice(netProfit)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

