export interface ExpenseData {
  category: string
  data: number[]
}

export interface ExpenseSummaryFilter {
  period: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  year: string
  category: string
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

export const monthlyMonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const calculateTotalExpense = (paymentData: ExpenseData[], billData: ExpenseData[]): number[] => {
  const totalMonths =
    paymentData[0]?.data.length ??
    billData[0]?.data.length ??
    0
  const totals: number[] = Array(totalMonths).fill(0)

  paymentData.forEach((payment) => {
    payment.data.forEach((value, index) => {
      totals[index] += value
    })
  })

  billData.forEach((bill) => {
    bill.data.forEach((value, index) => {
      totals[index] += value
    })
  })

  return totals
}

export const quarterlyMonthList = ['Q1', 'Q2', 'Q3', 'Q4']

export const halfYearlyMonthList = ['H1', 'H2']

export const yearlyMonthList = ['2022', '2023', '2024', '2025']
