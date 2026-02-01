'use client'

import { POSInterface } from '@/components/pos-interface'

/**
 * Halaman POS sesuai reference-erp: full-bleed, hanya top bar + dua kolom (produk + keranjang).
 * Tanpa title card dan tanpa padding wrapper agar layout sama dengan reference pos/index.blade.php.
 */
export default function POSSalesPage() {
  return (
    <div className="-m-4 flex flex-1 flex-col">
      <POSInterface />
    </div>
  )
}
