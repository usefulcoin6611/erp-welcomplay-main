# Bill Summary Report Component

Komponen laporan ringkasan tagihan (Bill Summary) yang lengkap dengan filter, grafik, dan tabel data, mengikuti pola dari referensi ERP Laravel.

## Struktur File

```
bill-summary/
├── BillSummaryTab.tsx          # Komponen utama
├── BillSummaryFilters.tsx      # Filter tanggal, vendor, dan status
├── BillSummaryChart.tsx        # Grafik bar chart bulanan
├── constants.ts                # Data mock, tipe, dan konstanta
├── index.ts                    # Export semua komponen
├── hooks/
│   └── useBillSummaryData.ts  # Custom hook untuk data management
└── tables/
    └── BillsTable.tsx         # Tabel daftar tagihan
```

## Fitur

### 1. Filter Section
- **Date Range**: Pilih rentang tanggal dengan calendar picker
- **Vendor Filter**: Filter berdasarkan vendor (dropdown)
- **Status Filter**: Filter berdasarkan status tagihan (All, Draft, Sent, Unpaid, Partial, Paid)
- **Apply & Reset**: Tombol untuk menerapkan dan mereset filter

### 2. Info Cards
- **Report Info**: Menampilkan nama laporan
- **Vendor Info**: Menampilkan vendor yang dipilih (jika ada)
- **Status Info**: Menampilkan status yang dipilih (jika ada)
- **Duration**: Menampilkan rentang tanggal yang dipilih

### 3. Statistics Cards
- **Total Bill**: Total semua tagihan
- **Total Paid**: Total yang sudah dibayar
- **Total Due**: Total yang masih harus dibayar

### 4. Tab Content
Dua tab untuk menampilkan data:

#### Summary Tab
- Grafik bar chart menampilkan total tagihan per bulan (6 bulan terakhir)
- Warna hijau (#6fd944) sesuai dengan referensi ERP
- Tooltip interaktif menampilkan nilai dalam format Rupiah

#### Bills Tab
- Tabel lengkap dengan kolom:
  - Bill Number (link ke detail)
  - Date
  - Vendor
  - Category
  - Status (badge berwarna)
  - Paid Amount
  - Due Amount
  - Payment Date
  - Total Amount
- Pagination untuk navigasi data
- Format mata uang dalam Rupiah (IDR)

## Data Mock

File `constants.ts` berisi:
- **12 sample bills** dengan berbagai status dan vendor
- **Monthly data** untuk 6 bulan terakhir
- **Type definitions** untuk Bill, BillStatus, BillSummaryStats
- **Status styles** dengan warna badge yang sesuai

## Custom Hook: useBillSummaryData

Hook ini mengelola:
- State untuk filter (dateRange, vendor, status)
- State untuk UI (selectedTab, searchQuery, pagination)
- Filtering dan searching data
- Kalkulasi statistik summary
- Aggregasi data bulanan untuk chart
- Handler untuk tab change, reset, dan apply filters

## Komponen UI yang Digunakan

Dari `@/components/ui`:
- Card, CardContent, CardHeader, CardTitle
- Button, Badge
- Select, Label
- Popover (untuk date picker)
- Calendar
- Table components
- SmoothTab (custom tab component)
- SimplePagination

Dari `recharts`:
- BarChart, Bar
- XAxis, YAxis
- CartesianGrid, Tooltip
- ResponsiveContainer

## Format Data

### Bill Interface
```typescript
interface Bill {
  id: string
  billNumber: string
  date: string
  vendor: string
  category: string
  status: BillStatus
  paidAmount: number
  dueAmount: number
  paymentDate: string
  total: number
}
```

### Status Types
- `draft`: Draft
- `sent`: Sent (Biru)
- `unpaid`: Unpaid (Kuning)
- `partial`: Partial (Orange)
- `paid`: Paid (Hijau)

## Integrasi

Komponen ini sudah terintegrasi dengan:
- Next.js App Router
- next-intl untuk internationalization
- Tailwind CSS untuk styling
- Dark mode support

## Penggunaan

```tsx
import { BillSummaryTab } from '@/components/reports/bill-summary'

export default function ReportsPage() {
  return <BillSummaryTab />
}
```

## Referensi

Implementasi mengacu pada:
- `/reference-erp/resources/views/report/bill_report.blade.php`
- Pattern dari `PayablesTab` yang sudah direfactor
- Best practices Separation of Concerns (SoC)

## Fitur Masa Depan

- [ ] Export ke Excel/PDF
- [ ] Download report
- [ ] Integrasi dengan API backend
- [ ] Advanced search
- [ ] Custom date range presets
- [ ] Print functionality
