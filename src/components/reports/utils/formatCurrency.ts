/**
 * Format number to Rupiah currency
 * Uses manual formatting to avoid SSR/client hydration mismatch
 */
export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp0'
  }
  const parts = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp${parts}`
}
