// Deal Filter Types
export interface DealFiltersType {
  period: {
    month: string
    year: string
  }
  stage: string
  priority: string
}

// Deal Report Item
export interface DealReportItem {
  dealId: string
  dealName: string
  company: string
  contact: string
  stage: string
  stageLabel: string
  priority: string
  priorityLabel: string
  dealValue: string
  probability: string
  expectedCloseDate: string
  assignedTo: string
}

// Deal Summary
export interface DealSummaryType {
  totalDeals: number | string
  totalValue: string
  wonDeals: number
  lostDeals: number
}

// Filter Options
export const DEAL_STAGE_OPTIONS = [
  { value: 'all', label: 'Semua Tahapan' },
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export const DEAL_PRIORITY_OPTIONS = [
  { value: 'all', label: 'Semua Prioritas' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]
