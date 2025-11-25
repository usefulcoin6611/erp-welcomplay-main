export interface AccountStatementData {
  id: number
  date: string
  amount: number
  description: string
  type: 'revenue' | 'payment'
}

export interface AccountSummary {
  id: number
  holderName: string
  bankName?: string
  total: number
  type: 'revenue' | 'payment'
}
