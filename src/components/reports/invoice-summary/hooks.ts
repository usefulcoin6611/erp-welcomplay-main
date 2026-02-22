import { InvoiceRecord } from "./constants"

interface InvoiceSummaryFilters {
  dateRange?: { from: Date; to: Date }
  status?: string
  customerId?: string
  search?: string
}

export interface UseInvoiceSummaryParams extends InvoiceSummaryFilters {}

export async function fetchInvoiceSummary(filters: UseInvoiceSummaryParams): Promise<InvoiceRecord[]> {
  const params = new URLSearchParams()

  if (filters.dateRange?.from) {
    params.append("startDate", filters.dateRange.from.toISOString())
  }
  if (filters.dateRange?.to) {
    params.append("endDate", filters.dateRange.to.toISOString())
  }

  if (filters.status && filters.status !== "all") {
    params.append("status", filters.status)
  }

  if (filters.customerId && filters.customerId !== "all") {
    params.append("customerId", filters.customerId)
  }

  if (filters.search) {
    params.append("search", filters.search)
  }

  const response = await fetch(`/api/reports/invoice-summary?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch invoice summary")
  }

  const result = await response.json()
  return result.data as InvoiceRecord[]
}
