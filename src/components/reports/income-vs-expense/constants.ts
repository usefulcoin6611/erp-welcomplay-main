export interface IncomeVsExpenseFilter {
  period: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  year: string
  category: string
  customer: string
  vendor: string
}

export const periods = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half Yearly' },
  { value: 'yearly', label: 'Yearly' },
]

// Dynamic year list: current year + 4 previous years
const currentYear = new Date().getFullYear()
export const yearList = Array.from({ length: 5 }, (_, i) => String(currentYear - i))

export const categories = [
  'All',
  'Sales',
  'Services',
  'Products',
  'Consulting',
  'Other',
]

export const customers = [
  'All',
  'Company A',
  'Company B',
  'Company C',
  'Individual Clients',
]

export const vendors = [
  'All',
  'Vendor A',
  'Vendor B',
  'Vendor C',
  'Supplier Group',
]

// Mock data for monthly period (12 months)
export const monthlyMonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock income data (Revenue + Invoice)
export const mockRevenueTotal = [45000000, 52000000, 48000000, 55000000, 60000000, 58000000, 62000000, 65000000, 63000000, 68000000, 70000000, 75000000]
export const mockInvoiceTotal = [35000000, 38000000, 40000000, 42000000, 45000000, 43000000, 48000000, 50000000, 52000000, 55000000, 58000000, 60000000]

// Mock expense data (Payment + Bill)
export const mockPaymentTotal = [38000000, 38000000, 38000000, 41000000, 41000000, 41000000, 43000000, 43000000, 43000000, 45000000, 45000000, 45000000]
export const mockBillTotal = [14000000, 15700000, 14800000, 17300000, 18200000, 18100000, 19800000, 19600000, 21100000, 21000000, 22500000, 22300000]

// Calculate totals
export const calculateIncome = (revenue: number[], invoice: number[]): number[] => {
  return revenue.map((value, index) => value + invoice[index])
}

export const calculateExpense = (payment: number[], bill: number[]): number[] => {
  return payment.map((value, index) => value + bill[index])
}

export const calculateProfit = (income: number[], expense: number[]): number[] => {
  return income.map((value, index) => value - expense[index])
}

// Mock data for quarterly (4 quarters)
export const quarterlyMonthList = ['Q1', 'Q2', 'Q3', 'Q4']

export const mockQuarterlyRevenueTotal = [145000000, 173000000, 190000000, 213000000]
export const mockQuarterlyInvoiceTotal = [113000000, 130000000, 150000000, 173000000]
export const mockQuarterlyPaymentTotal = [114000000, 123000000, 129000000, 135000000]
export const mockQuarterlyBillTotal = [44500000, 53600000, 60500000, 65800000]

// Mock data for half-yearly
export const halfYearlyMonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock data for yearly (last 4 years)
export const yearlyMonthList = ['2022', '2023', '2024', '2025']

export const mockYearlyRevenueTotal = [650000000, 721000000]
export const mockYearlyInvoiceTotal = [540000000, 566000000]
export const mockYearlyPaymentTotal = [465000000, 501000000]
export const mockYearlyBillTotal = [141000000, 224400000]
