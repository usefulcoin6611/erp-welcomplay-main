export interface TaxSummaryFilter {
  year: string
}

export const yearList = ['2025', '2024', '2023', '2022', '2021']

export const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock income tax data - tax rates by tax name
export interface TaxData {
  taxName: string
  monthlyValues: number[]
}

export const mockIncomeTaxes: TaxData[] = [
  {
    taxName: 'VAT 10%',
    monthlyValues: [4500000, 5200000, 4800000, 5500000, 6000000, 5800000, 6200000, 6500000, 6300000, 6800000, 7000000, 7500000]
  },
  {
    taxName: 'Sales Tax 5%',
    monthlyValues: [2250000, 2600000, 2400000, 2750000, 3000000, 2900000, 3100000, 3250000, 3150000, 3400000, 3500000, 3750000]
  },
  {
    taxName: 'Service Tax 2%',
    monthlyValues: [900000, 1040000, 960000, 1100000, 1200000, 1160000, 1240000, 1300000, 1260000, 1360000, 1400000, 1500000]
  }
]

export const mockExpenseTaxes: TaxData[] = [
  {
    taxName: 'VAT 10%',
    monthlyValues: [3800000, 3800000, 3800000, 4100000, 4100000, 4100000, 4300000, 4300000, 4300000, 4500000, 4500000, 4500000]
  },
  {
    taxName: 'Withholding Tax 2%',
    monthlyValues: [760000, 760000, 760000, 820000, 820000, 820000, 860000, 860000, 860000, 900000, 900000, 900000]
  },
  {
    taxName: 'Import Tax 5%',
    monthlyValues: [1400000, 1570000, 1480000, 1730000, 1820000, 1810000, 1980000, 1960000, 2110000, 2100000, 2250000, 2230000]
  }
]

// Helper function to format date range
export const getDateRange = (year: string) => {
  return `Jan ${year} to Dec ${year}`
}
