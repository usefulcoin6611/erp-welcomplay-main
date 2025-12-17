// Lead Filter Types
export interface LeadFiltersType {
  period: {
    month: string
    year: string
  }
  status: string
  source: string
}

// Lead Report Item
export interface LeadReportItem {
  leadId: string
  name: string
  company: string
  email: string
  phone: string
  source: string
  status: string
  statusLabel: string
  estimatedValue: string
  createdDate: string
  assignedTo: string
}

// Lead Summary
export interface LeadSummaryType {
  totalLeads: number
  qualifiedLeads: number
  convertedLeads: number
  lostLeads: number
}

// Filter Options
export const LEAD_STATUS_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  { value: 'new', label: 'Baru' },
  { value: 'contacted', label: 'Dihubungi' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
]

export const LEAD_SOURCE_OPTIONS = [
  { value: 'all', label: 'Semua Sumber' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'event', label: 'Event' },
  { value: 'direct', label: 'Direct' },
]
