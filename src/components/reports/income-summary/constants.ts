export interface IncomeData {
  category: string
  data: number[]
}

export interface IncomeSummaryFilter {
  period: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  year: string
  category: string
  customer: string
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
  'Product Sales',
  'Service Revenue',
  'Consulting',
  'Subscription',
  'Other Income',
]

export const customers = [
  'All',
  'Company A',
  'Company B',
  'Company C',
  'Individual Clients',
  'Government',
]

// Mock data for monthly period (12 months)
export const monthlyMonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock revenue data by category
export const mockRevenueData: IncomeData[] = [
  {
    category: 'Product Sales',
    data: [45000000, 52000000, 48000000, 55000000, 60000000, 58000000, 62000000, 65000000, 63000000, 68000000, 70000000, 75000000],
  },
  {
    category: 'Service Revenue',
    data: [25000000, 28000000, 26000000, 30000000, 32000000, 31000000, 35000000, 38000000, 36000000, 40000000, 42000000, 45000000],
  },
  {
    category: 'Consulting',
    data: [15000000, 18000000, 16000000, 20000000, 22000000, 21000000, 24000000, 26000000, 25000000, 28000000, 30000000, 32000000],
  },
]

// Mock invoice data by category
export const mockInvoiceData: IncomeData[] = [
  {
    category: 'Product Sales',
    data: [35000000, 38000000, 40000000, 42000000, 45000000, 43000000, 48000000, 50000000, 52000000, 55000000, 58000000, 60000000],
  },
  {
    category: 'Service Revenue',
    data: [20000000, 22000000, 24000000, 25000000, 28000000, 27000000, 30000000, 32000000, 35000000, 38000000, 40000000, 42000000],
  },
  {
    category: 'Subscription',
    data: [12000000, 12000000, 12000000, 15000000, 15000000, 15000000, 18000000, 18000000, 18000000, 20000000, 20000000, 20000000],
  },
]

// Calculate total income (Revenue + Invoice)
export const calculateTotalIncome = (revenueData: IncomeData[], invoiceData: IncomeData[]): number[] => {
  const totalMonths = revenueData[0]?.data.length || 12
  const totals: number[] = Array(totalMonths).fill(0)
  
  revenueData.forEach(revenue => {
    revenue.data.forEach((value, index) => {
      totals[index] += value
    })
  })
  
  invoiceData.forEach(invoice => {
    invoice.data.forEach((value, index) => {
      totals[index] += value
    })
  })
  
  return totals
}

// Mock data for quarterly (4 quarters)
export const quarterlyMonthList = ['Q1', 'Q2', 'Q3', 'Q4']

export const mockQuarterlyRevenueData: IncomeData[] = [
  {
    category: 'Product Sales',
    data: [145000000, 173000000, 190000000, 213000000],
  },
  {
    category: 'Service Revenue',
    data: [79000000, 93000000, 109000000, 127000000],
  },
]

export const mockQuarterlyInvoiceData: IncomeData[] = [
  {
    category: 'Product Sales',
    data: [113000000, 130000000, 150000000, 173000000],
  },
  {
    category: 'Service Revenue',
    data: [66000000, 80000000, 97000000, 120000000],
  },
]

// Mock data for half-yearly (6 months per half)
export const halfYearlyMonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock data for yearly (last 5 years)
export const yearlyMonthList = ['2021', '2022', '2023', '2024', '2025']

export const mockYearlyRevenueData: IncomeData[] = [
  {
    category: 'Product Sales',
    data: [520000000, 580000000, 650000000, 721000000],
  },
  {
    category: 'Service Revenue',
    data: [280000000, 320000000, 360000000, 408000000],
  },
]

export const mockYearlyInvoiceData: IncomeData[] = [
  {
    category: 'Product Sales',
    data: [420000000, 480000000, 540000000, 566000000],
  },
  {
    category: 'Service Revenue',
    data: [220000000, 260000000, 300000000, 363000000],
  },
]
