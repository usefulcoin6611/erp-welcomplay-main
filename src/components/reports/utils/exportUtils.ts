/**
 * ERP Report Export Utilities
 * 
 * Provides CSV export and PDF download functionality for all report tabs.
 * - exportToCSV: exports tabular data as a downloadable CSV file
 * - exportToPDF: triggers browser print dialog for PDF generation
 * - downloadReport: generic download trigger for any blob/data
 */

/**
 * Convert an array of objects to CSV string
 */
export function objectsToCSV(data: Record<string, any>[], columns?: string[]): string {
  if (!data || data.length === 0) return ''

  const keys = columns || Object.keys(data[0])
  const header = keys.join(',')
  const rows = data.map(row =>
    keys.map(key => {
      const val = row[key]
      if (val === null || val === undefined) return ''
      const str = String(val)
      // Escape commas and quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  )
  return [header, ...rows].join('\n')
}

/**
 * Trigger a CSV file download in the browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data as CSV and trigger download
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  columns?: string[]
): void {
  const csv = objectsToCSV(data, columns)
  if (!csv) return
  downloadCSV(csv, filename)
}

/**
 * Format currency for CSV export (plain number, no symbol)
 */
export function formatCurrencyForExport(amount: number): string {
  return amount.toFixed(2)
}

/**
 * Format date for CSV export
 */
export function formatDateForExport(date: string | Date): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 10)
}

// ─── Report-specific export helpers ───────────────────────────────────────────

/**
 * Export Sales by Item report
 */
export function exportSalesByItem(data: any[], filename = 'sales-by-item'): void {
  const rows = data.map(row => ({
    Item: row.item,
    Quantity: row.quantity,
    Revenue: formatCurrencyForExport(row.revenue),
    'Avg Price': formatCurrencyForExport(row.avgPrice),
    Status: row.status,
  }))
  exportToCSV(rows, filename)
}

/**
 * Export Sales by Customer report
 */
export function exportSalesByCustomer(data: any[], filename = 'sales-by-customer'): void {
  const rows = data.map(row => ({
    Customer: row.customer,
    Orders: row.orders,
    Revenue: formatCurrencyForExport(row.revenue),
    'Avg Order': formatCurrencyForExport(row.avgOrder),
    Priority: row.priority,
  }))
  exportToCSV(rows, filename)
}

/**
 * Export Receivables report
 */
export function exportReceivables(data: any[], tab: string, filename?: string): void {
  const name = filename || `receivables-${tab}`
  exportToCSV(data, name)
}

/**
 * Export Payables report
 */
export function exportPayables(data: any[], tab: string, filename?: string): void {
  const name = filename || `payables-${tab}`
  exportToCSV(data, name)
}

/**
 * Export Bill Summary report
 */
export function exportBillSummary(data: any[], filename = 'bill-summary'): void {
  const rows = data.map(row => ({
    'Bill Number': row.billNumber,
    Vendor: row.vendor,
    Category: row.category,
    Date: row.date,
    'Due Date': row.dueDate,
    Total: formatCurrencyForExport(row.total),
    Paid: formatCurrencyForExport(row.paidAmount),
    Due: formatCurrencyForExport(row.dueAmount),
    Status: row.status,
  }))
  exportToCSV(rows, filename)
}

/**
 * Export Product Stock report
 */
export function exportProductStock(data: any[], filename = 'product-stock'): void {
  const rows = data.map(row => ({
    Name: row.name,
    SKU: row.sku,
    Category: row.category,
    Unit: row.unit,
    Quantity: row.quantity,
    'Sale Price': formatCurrencyForExport(row.salePrice),
    'Purchase Price': formatCurrencyForExport(row.purchasePrice),
    Type: row.type,
    Status: row.status,
  }))
  exportToCSV(rows, filename)
}

/**
 * Export Cash Flow report (monthly table)
 */
export function exportCashFlow(
  categories: { id: string; category: string; data: number[] }[],
  monthLabels: string[],
  section: string,
  filename?: string
): void {
  const name = filename || `cash-flow-${section}`
  const rows = categories.map(cat => {
    const row: Record<string, any> = { Category: cat.category }
    monthLabels.forEach((m, i) => {
      row[m] = formatCurrencyForExport(cat.data[i] || 0)
    })
    return row
  })
  exportToCSV(rows, name)
}

/**
 * Export Transaction report
 */
export function exportTransactions(data: any[], filename = 'transactions'): void {
  const rows = data.map(row => ({
    Date: row.date,
    Type: row.type,
    Reference: row.reference,
    Description: row.description,
    Account: row.account,
    Category: row.category,
    Debit: formatCurrencyForExport(row.debit),
    Credit: formatCurrencyForExport(row.credit),
    Amount: formatCurrencyForExport(row.amount),
  }))
  exportToCSV(rows, filename)
}

/**
 * Export Income Summary report
 */
export function exportIncomeSummary(
  invoiceData: { category: string; data: number[] }[],
  monthLabels: string[],
  filename = 'income-summary'
): void {
  const rows = invoiceData.map(item => {
    const row: Record<string, any> = { Category: item.category }
    monthLabels.forEach((m, i) => {
      row[m] = formatCurrencyForExport(item.data[i] || 0)
    })
    return row
  })
  exportToCSV(rows, filename)
}

/**
 * Export Expense Summary report
 */
export function exportExpenseSummary(
  paymentData: { category: string; data: number[] }[],
  billData: { category: string; data: number[] }[],
  monthLabels: string[],
  filename = 'expense-summary'
): void {
  const allData = [
    ...paymentData.map(d => ({ ...d, type: 'Payment' })),
    ...billData.map(d => ({ ...d, type: 'Bill' })),
  ]
  const rows = allData.map(item => {
    const row: Record<string, any> = { Type: item.type, Category: item.category }
    monthLabels.forEach((m, i) => {
      row[m] = formatCurrencyForExport(item.data[i] || 0)
    })
    return row
  })
  exportToCSV(rows, filename)
}

/**
 * Export Income vs Expense report
 */
export function exportIncomeVsExpense(
  monthList: string[],
  incomeTotal: number[],
  expenseTotal: number[],
  profitTotal: number[],
  filename = 'income-vs-expense'
): void {
  const rows = monthList.map((month, i) => ({
    Period: month,
    Income: formatCurrencyForExport(incomeTotal[i] || 0),
    Expense: formatCurrencyForExport(expenseTotal[i] || 0),
    'Profit/Loss': formatCurrencyForExport(profitTotal[i] || 0),
  }))
  exportToCSV(rows, filename)
}

/**
 * Export Tax Summary report
 */
export function exportTaxSummary(
  incomeTaxes: { taxName: string; monthlyValues: number[] }[],
  expenseTaxes: { taxName: string; monthlyValues: number[] }[],
  monthList: string[],
  filename = 'tax-summary'
): void {
  const rows: Record<string, any>[] = []
  
  incomeTaxes.forEach(tax => {
    const row: Record<string, any> = { Type: 'Income Tax', 'Tax Name': tax.taxName }
    monthList.forEach((m, i) => {
      row[m] = formatCurrencyForExport(tax.monthlyValues[i] || 0)
    })
    rows.push(row)
  })
  
  expenseTaxes.forEach(tax => {
    const row: Record<string, any> = { Type: 'Expense Tax', 'Tax Name': tax.taxName }
    monthList.forEach((m, i) => {
      row[m] = formatCurrencyForExport(tax.monthlyValues[i] || 0)
    })
    rows.push(row)
  })
  
  exportToCSV(rows, filename)
}
