export interface AccountStatementData {
  id: string
  date: string
  amount: number
  description: string
  type: 'revenue' | 'payment'
}

export interface AccountSummary {
  id: string
  holderName: string
  bankName?: string
  total: number
  type: 'revenue' | 'payment'
}
