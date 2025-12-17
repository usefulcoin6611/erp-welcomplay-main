# Cash Flow Report

Implementasi lengkap untuk Cash Flow Report tab di aplikasi ERP, menampilkan aliran kas masuk dan keluar perusahaan.

## Struktur File

```
cash-flow/
├── CashFlowTab.tsx          # Main component
├── CashFlowFilters.tsx      # Filter component
├── CashFlowTable.tsx        # Reusable table component
├── constants.ts             # Data types & mock data
├── hooks/
│   └── useCashFlowData.ts  # Custom hook for data management
└── index.ts                 # Exports
```

## Fitur

### 1. Filter Section
- **View Type Toggle**: Switch antara Monthly dan Quarterly view
- **Year Filter**: Pilih tahun untuk laporan
- **Action Buttons**:
  - Apply: Terapkan filter
  - Reset: Reset semua filter
  - Download: Download report

### 2. Info Cards
- **Report**: Jenis laporan (Monthly/Quarterly Cash Flow)
- **Duration**: Periode laporan (Jan - Dec tahun yang dipilih)

### 3. Statistics Cards
- **Total Income**: Total pendapatan dalam setahun
- **Total Expense**: Total pengeluaran dalam setahun
- **Net Profit**: Laba bersih (Income - Expense)
- **Avg Monthly Income**: Rata-rata pendapatan per bulan

### 4. Income Tables
Menampilkan pendapatan per kategori:
- **Revenue Section**: Kategori pendapatan (Product Sales, Service Revenue, Consulting Fees)
- **Invoice Section**: Kategori invoice
- **Total Income**: Jumlah dari Revenue + Invoice untuk setiap bulan

### 5. Expense Tables
Menampilkan pengeluaran per kategori:
- **Payment Section**: Kategori pembayaran (Salary, Rent, Utilities)
- **Bill Section**: Kategori tagihan
- **Total Expense**: Jumlah dari Payment + Bill untuk setiap bulan

### 6. Net Profit Table
Menampilkan laba bersih per bulan dengan rumus:
**Net Profit = Total Income - Total Expense**

## Data Structure

### CashFlowCategory Interface
```typescript
interface CashFlowCategory {
  id: string
  category: string
  data: number[] // 12 months data (Jan-Dec)
}
```

### CashFlowData Interface
```typescript
interface CashFlowData {
  revenue: CashFlowCategory[]
  invoice: CashFlowCategory[]
  payment: CashFlowCategory[]
  bill: CashFlowCategory[]
}
```

## Perhitungan

### Total Income
```
Total Income = Σ Revenue + Σ Invoice
```

### Total Expense
```
Total Expense = Σ Payment + Σ Bill
```

### Net Profit
```
Net Profit = Total Income - Total Expense
```

### Average Monthly Income
```
Avg Monthly Income = Total Income / 12
```

## Mock Data
File `constants.ts` berisi data contoh untuk:
- 3 kategori Revenue
- 2 kategori Invoice
- 3 kategori Payment
- 2 kategori Bill

Semua dengan data 12 bulan lengkap.

## Table Layout

Setiap tabel menampilkan:
- **Column 1**: Nama kategori (width: 200px)
- **Column 2-13**: Data per bulan (Jan - Dec, min-width: 100px)
- Format currency: IDR dengan separator ribuan

## Styling

### Color Scheme
- **Income/Positive**: Green
- **Expense/Negative**: Red
- **Net Profit**: Blue/Green tergantung nilai
- **Info**: Purple

### Table Styling
- Header: `bg-muted/50`
- Subtitle rows: `bg-muted/30` dengan font semibold
- Total rows: `bg-blue-50` dengan font bold
- Net Profit: `bg-green-100` dengan font extra bold
- Hover: `hover:bg-muted/50`

## Responsive Design
- Tables dengan horizontal scroll untuk mobile
- Cards menggunakan grid responsive
- Filter layout adapts dari column ke row di mobile

## Usage

```tsx
import { CashFlowTab } from '@/components/reports/cash-flow'

function ReportsPage() {
  return <CashFlowTab />
}
```

## Referensi
Implementasi mengacu pada:
- `/reference-erp/resources/views/report/monthly_cashflow.blade.php`
- `/reference-erp/resources/views/report/quarterly_cashflow.blade.php`
- Pattern dari Invoice Summary tab untuk konsistensi UI/UX
