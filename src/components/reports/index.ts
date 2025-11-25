/**
 * Refactored Reports Components with Better Separation of Concerns
 * 
 * This is the new modular structure. For backward compatibility,
 * the old monolithic placeholder-tabs.tsx is still available.
 * 
 * Gradually migrate to use this index instead.
 */

// Fully refactored with SoC best practices
export { AccountStatementTab } from './account-statement-tab'
export { InvoiceSummaryTab } from './invoice-summary'
export { SalesReportTab } from './sales-report'
export { PayablesTab } from './payables'
export { ReceivablesTab } from './receivables'
export { BillSummaryTab } from './bill-summary'
export { ProductStockTab } from './product-stock'
export { CashFlowTab } from './cash-flow'
export { TransactionTab } from './transaction'
export { IncomeSummaryTab } from './income-summary'
export { ExpenseSummaryTab } from './expense-summary'
export { IncomeVsExpenseTab } from './income-vs-expense'
export { TaxSummaryTab } from './tax-summary'
