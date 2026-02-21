'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { formatPrice } from '@/lib/utils'
import {
  Printer,
  FileDown,
  Filter,
  Columns2,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react'

// Types for Balance Sheet data
interface AccountRecord {
  account_id: string | number;
  account_code: string;
  account_name: string;
  netAmount: number;
}

interface AccountGroup {
  subType: string;
  account: AccountRecord[][];
}

interface BalanceSheetData {
  Assets: AccountGroup[];
  Liabilities: AccountGroup[];
  Equity: AccountGroup[];
}

export function BalanceSheetTab() {
  const { user } = useAuth()
  const [startDate, setStartDate] = useState('2026-01-01')
  const [endDate, setEndDate] = useState('2026-12-31')
  const [showFilter, setShowFilter] = useState(false)
  const [viewType, setViewType] = useState<'vertical' | 'horizontal'>('vertical')
  const [loading, setLoading] = useState(false)
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData>({
    Assets: [],
    Liabilities: [],
    Equity: [],
  })

  const fetchBalanceSheet = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ startDate, endDate })
      const response = await fetch(`/api/reports/balance-sheet?${params.toString()}`)
      const result = await response.json()
      if (result.success) {
        setBalanceSheetData(result.data)
      }
    } catch (error) {
      console.error('Error fetching balance sheet:', error)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  const handleExport = () => {
    // Basic CSV export for Balance Sheet
    const rows = [
      ['Account Name', 'Account Code', 'Total'],
      ['ASSETS'],
    ]

    balanceSheetData.Assets.forEach(group => {
      rows.push([group.subType.toUpperCase(), '', ''])
      group.account.forEach(records => {
        records.forEach(record => {
          rows.push([record.account_name, record.account_code, record.netAmount.toString()])
        })
      })
    })
    rows.push(['Total Assets', '', assetsTotal.toString()])
    rows.push([''])
    rows.push(['LIABILITIES & EQUITY'])
    rows.push(['LIABILITIES'])
    balanceSheetData.Liabilities.forEach(group => {
      rows.push([group.subType.toUpperCase(), '', ''])
      group.account.forEach(records => {
        records.forEach(record => {
          rows.push([record.account_name, record.account_code, record.netAmount.toString()])
        })
      })
    })
    rows.push(['Total Liabilities', '', liabilitiesTotal.toString()])
    rows.push([''])
    rows.push(['EQUITY'])
    balanceSheetData.Equity.forEach(group => {
      rows.push([group.subType.toUpperCase(), '', ''])
      group.account.forEach(records => {
        records.forEach(record => {
          rows.push([record.account_name, record.account_code, record.netAmount.toString()])
        })
      })
    })
    rows.push(['Total Equity', '', equityTotal.toString()])
    rows.push(['Total Liabilities & Equity', '', (liabilitiesTotal + equityTotal).toString()])

    const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `balance_sheet_${startDate}_to_${endDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    const printContents = document.getElementById('printableArea')?.innerHTML
    const originalContents = document.body.innerHTML
    
    if (printContents) {
      // Create a temporary window or iframe for cleaner printing
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Balance Sheet - ${userName}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
                .text-end { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .bg-muted { background-color: #f4f4f5; }
                .pl-4 { padding-left: 20px; }
                .pl-8 { padding-left: 40px; }
                .border-b { border-bottom: 1px solid #e5e7eb; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .py-3 { padding-top: 12px; padding-bottom: 12px; }
                .mt-4 { margin-top: 16px; }
                .mb-2 { margin-bottom: 8px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                .w-full { width: 100%; }
                @media print {
                  .no-print { display: none; }
                }
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

  useEffect(() => {
    fetchBalanceSheet()
  }, [fetchBalanceSheet])

  const userName = user?.name || 'Company'
  const startDateRange = startDate || '2026-01-01'
  const endDateRange = endDate || '2026-12-31'

  const calculateTypeTotal = (accounts: AccountGroup[], isAssets: boolean) => {
    return accounts.reduce((accTotal, group) => {
      return (
        accTotal +
        group.account.reduce((groupTotal, records) => {
          return (
            groupTotal +
            records.reduce((recordTotal, record) => {
              return recordTotal + (isAssets ? record.netAmount : record.netAmount)
            }, 0)
          )
        }, 0)
      )
    }, 0)
  }

  const assetsTotal = calculateTypeTotal(balanceSheetData.Assets, true)
  const liabilitiesTotal = calculateTypeTotal(balanceSheetData.Liabilities, false)
  const equityTotal = calculateTypeTotal(balanceSheetData.Equity, false)

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0 px-6 py-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-semibold">Balance Sheet</CardTitle>
            <CardDescription>View balance sheet report for a period.</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Inline Filters */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                fetchBalanceSheet()
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
                    setStartDate('2026-01-01')
                    setEndDate('2026-12-31')
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

      {/* Removed separate filter card */}

      {/* Balance Sheet */}
      <div id="printableArea">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <Card className="border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <div className="border-b border-border px-6 py-4">
                <h5 className="text-lg font-semibold text-foreground">
                  Balance Sheet of {userName} as of {startDateRange} to {endDateRange}
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
                    {/* Left Column (Assets in Horizontal, or everything in Vertical) */}
                    <div className={`${viewType === 'horizontal' ? 'flex-1 border-r border-border pr-8' : 'w-full'}`}>
                      <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm font-semibold">
                        <span className="min-w-0 flex-1">Account</span>
                        <span className="w-28 shrink-0 text-center">Account Code</span>
                        <span className="w-32 shrink-0 text-end">Total</span>
                      </div>

                      {/* Assets */}
                      <div className="py-3">
                        <p className="mb-3 text-sm font-bold text-foreground">Assets</p>
                        {balanceSheetData.Assets.map((group, idx) => (
                          <div key={idx} className="border-b border-border/60 mb-4">
                            <p className="px-2 py-1.5 text-xs font-bold text-foreground bg-muted/40 uppercase tracking-wider">{group.subType}</p>
                            {group.account.map((records) =>
                              records.map((record) => (
                                <div
                                  key={record.account_id}
                                  className="flex items-center justify-between gap-4 py-2 text-sm border-b border-border/40 last:border-0"
                                >
                                  <span className="min-w-0 flex-1 pl-4">
                                    <a
                                      href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                      className="text-primary hover:underline font-medium"
                                    >
                                      {record.account_name}
                                    </a>
                                  </span>
                                  <span className="w-28 shrink-0 text-center text-muted-foreground">{record.account_code}</span>
                                  <span className="w-32 shrink-0 text-end tabular-nums font-semibold">
                                    {formatPrice(record.netAmount)}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        ))}
                        <div className="flex items-center justify-between gap-4 border-b border-border py-3 px-2 bg-muted/20">
                          <span className="text-sm font-bold uppercase">Total for Assets</span>
                          <span className="text-sm font-bold tabular-nums">{formatPrice(assetsTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (Liabilities & Equity in Horizontal) */}
                    <div className={`${viewType === 'horizontal' ? 'flex-1' : 'w-full'}`}>
                      {viewType === 'horizontal' && (
                        <div className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm font-semibold">
                          <span className="min-w-0 flex-1">Account</span>
                          <span className="w-28 shrink-0 text-center">Account Code</span>
                          <span className="w-32 shrink-0 text-end">Total</span>
                        </div>
                      )}

                      {/* Liabilities & Equity Section Header */}
                      {(balanceSheetData.Liabilities.length > 0 || balanceSheetData.Equity.length > 0) && (
                        <div className={`${viewType === 'vertical' ? 'mt-6' : ''}`}>
                          <p className="mb-4 text-sm font-bold text-foreground border-b-2 border-border pb-1">Liabilities & Equity</p>
                          
                          {/* Liabilities */}
                          {balanceSheetData.Liabilities.length > 0 && (
                            <div className="py-3">
                              <p className="mb-3 text-sm font-bold text-foreground ps-2">Liabilities</p>
                              {balanceSheetData.Liabilities.map((group, idx) => (
                                <div key={idx} className="border-b border-border/60 mb-4">
                                  <p className="px-2 py-1.5 text-xs font-bold text-foreground bg-muted/40 uppercase tracking-wider">{group.subType}</p>
                                  {group.account.map((records) =>
                                    records.map((record) => (
                                      <div
                                        key={record.account_id}
                                        className="flex items-center justify-between gap-4 py-2 text-sm border-b border-border/40 last:border-0"
                                      >
                                        <span className="min-w-0 flex-1 pl-4">
                                          <a
                                            href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                            className="text-primary hover:underline font-medium"
                                          >
                                            {record.account_name}
                                          </a>
                                        </span>
                                        <span className="w-28 shrink-0 text-center text-muted-foreground">{record.account_code}</span>
                                        <span className="w-32 shrink-0 text-end tabular-nums font-semibold">
                                          {formatPrice(record.netAmount)}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              ))}
                              <div className="flex items-center justify-between gap-4 border-b border-border py-3 px-2 bg-muted/20">
                                <span className="text-sm font-bold uppercase">Total for Liabilities</span>
                                <span className="text-sm font-bold tabular-nums">{formatPrice(liabilitiesTotal)}</span>
                              </div>
                            </div>
                          )}

                          {/* Equity */}
                          {balanceSheetData.Equity.length > 0 && (
                            <div className="py-3 mt-4">
                              <p className="mb-3 text-sm font-bold text-foreground ps-2">Equity</p>
                              {balanceSheetData.Equity.map((group, idx) => (
                                <div key={idx} className="border-b border-border/60 mb-4">
                                  <p className="px-2 py-1.5 text-xs font-bold text-foreground bg-muted/40 uppercase tracking-wider">{group.subType}</p>
                                  {group.account.map((records) =>
                                    records.map((record) => (
                                      <div
                                        key={record.account_id}
                                        className="flex items-center justify-between gap-4 py-2 text-sm border-b border-border/40 last:border-0"
                                      >
                                        <span className="min-w-0 flex-1 pl-4">
                                          {record.account_name === 'Current Year Earnings' ? (
                                            <a
                                              href="/accounting/double-entry?tab=profit-loss"
                                              className="text-primary hover:underline font-bold"
                                            >
                                              {record.account_name}
                                            </a>
                                          ) : (
                                            <a
                                              href={`/accounting/double-entry/ledger?account=${record.account_id}`}
                                              className="text-primary hover:underline font-medium"
                                            >
                                              {record.account_name}
                                            </a>
                                          )}
                                        </span>
                                        <span className="w-28 shrink-0 text-center text-muted-foreground">{record.account_code}</span>
                                        <span className="w-32 shrink-0 text-end tabular-nums font-semibold">
                                          {formatPrice(record.netAmount)}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              ))}
                              <div className="flex items-center justify-between gap-4 border-b border-border py-3 px-2 bg-muted/20">
                                <span className="text-sm font-bold uppercase">Total for Equity</span>
                                <span className="text-sm font-bold tabular-nums">{formatPrice(equityTotal)}</span>
                              </div>
                            </div>
                          )}

                          {/* Final Total for Liabilities & Equity */}
                          <div className="mt-6 flex items-center justify-between gap-4 border-y-2 border-border py-4 px-2 bg-muted/30">
                            <span className="text-base font-bold uppercase">Total Liabilities & Equity</span>
                            <span className="text-base font-bold tabular-nums">{formatPrice(liabilitiesTotal + equityTotal)}</span>
                          </div>
                        </div>
                      )}
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

