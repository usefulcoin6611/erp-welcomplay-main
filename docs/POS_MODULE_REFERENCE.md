# Modul POS – Ringkasan Reference ERP

Dokumen ini merangkum modul POS dari `reference-erp` (Laravel) agar dapat disesuaikan dan berfungsi setara di proyek Next.js ini.

## 1. Route & Halaman (reference-erp)

| Route | Method | Controller | Keterangan |
|-------|--------|------------|------------|
| `{cid?}/pos` | GET | PosController@index | Halaman kasir POS. `cid` = 0 atau quotation_id (opsional). |
| `pos/create` | GET | PosController@create | Modal POS Invoice (ringkasan) sebelum bayar. |
| `pos/data/store` | GET | PosController@store | Simpan transaksi POS (setelah konfirmasi bayar). |
| `pos/report` | GET | PosController@report | Laporan ringkasan POS. |
| `pos/pdf/{id}` | GET | PosController@pos | PDF/print POS by id. |
| `pos/view` (resource show) | GET | PosController@show | Detail satu POS. |
| `barcode/pos` | GET | PosController@barcode | Halaman Product Barcode (list produk + barcode). |
| `setting/pos` | GET | PosController@setting | Modal Barcode Setting (type, format). |
| `barcode/settings` | POST | PosController@BarcodesettingStore | Simpan barcode type & format. |
| `print/pos` | GET | PosController@printBarcode | Print barcode (pilih warehouse + produk). |
| `search-products` | GET | ProductServiceController@searchProducts | Cari produk (search, cat_id, war_id, type name/sku). |
| `product-categories` | GET | ProductServiceCategoryController@getProductCategories | List kategori untuk filter produk. |
| `add-to-cart/{id}/{session}` | GET | ProductServiceController@addToCart | Tambah produk ke cart (session: `pos`). |
| `update-cart` | PATCH | ProductServiceController@updateCart | Update qty & hitung ulang subtotal/discount. |
| `remove-from-cart` | DELETE | ProductServiceController@removeFromCart | Hapus item dari cart. |
| `empty-cart` | POST | ProductServiceController@emptyCart | Kosongkan cart (redirect back). |
| `warehouse-empty-cart` | POST | ProductServiceController@warehouseemptyCart | Kosongkan cart saat ganti warehouse. |
| `cartdiscount` | POST | PosController@cartdiscount | Hitung total dengan discount (return formatted total). |

## 2. Alur Kasir (POS Index)

1. **Data awal**: Customer (dropdown, Walk-in-customer + list), Warehouse (dropdown), optional Quotation id.
2. **Session key**: Halaman pakai segment terakhir URL sebagai session key (mis. `pos`).
3. **Produk**:
   - Load kategori via `product-categories` → tampil sebagai tombol filter.
   - Load produk via `search-products` (params: search, cat_id, war_id, session_key, type). Type: `name` atau `sku` (untuk barcode scanner).
   - Pilih warehouse → produk difilter by warehouse; **ganti warehouse → cart dikosongkan** (`warehouse-empty-cart`).
4. **Cart**:
   - Tambah: `add-to-cart/{product_id}/{session_key}`.
   - Ubah qty: `update-cart` (id, quantity, discount, session_key).
   - Hapus item: `remove-from-cart` (id, session_key).
   - Discount: input number; on change panggil `cartdiscount` → tampilkan total baru.
5. **PAY**:
   - Tombol PAY membuka modal **POS Invoice** (`pos/create`) dengan ringkasan: customer, warehouse, item, subtotal, discount, total.
   - Di modal ada tombol konfirmasi (Done) yang memanggil `pos/data/store` (GET dengan vc_name, warehouse_name, discount, quotation_id).
   - Setelah sukses: session cart di-forget, toast success.
6. **Empty Cart**: Tombol "Empty Cart" dengan konfirmasi (Are You Sure? This action cannot be undone) → submit form `empty-cart` (session_key).

## 3. Barcode & Print Settings

- **Barcode Setting (setting/pos)**: Form modal dengan Barcode Type (code128, code39, code93), Barcode Format (css, bmp), tombol Save → `barcode/settings`.
- **Print Barcode (print/pos)**: Pilih warehouse → load produk by warehouse → pilih produk → print receipt barcode.
- **POS Product Barcode (barcode/pos)**: Tabel produk + kolom barcode (render per SKU dengan jquery-barcode).

## 4. Laporan & Dokumen

- **POS Report**: List semua POS (pos.report).
- **POS Detail**: View satu POS (pos.view), tombol Download PDF (pos.pdf).
- **POS Print Setting**: Di Settings > Print Settings ada tab POS Print Setting (template, color, logo) → route `pos/template/setting`, preview `pos/preview/{template}/{color}`.

## 5. Penyesuaian di Proyek Next.js

- **Halaman**: `/pos/sales` = kasir (POSInterface), `/pos/add-pos` = form customer/warehouse lalu "Buka POS" ke `/pos/sales`, `/pos/print-settings` = Barcode Setting, `/pos/print-barcode` = Print Barcode, `/pos/reports` = laporan POS.
- **Perilaku yang disamakan**:
  - Ganti warehouse → kosongkan cart.
  - Filter produk: by kategori + search (nama) + search barcode (SKU).
  - PAY: modal POS Invoice → konfirmasi bayar → (mock) sukses + kosongkan cart.
  - Empty Cart: konfirmasi sebelum kosongkan.
- **API**: Saat backend/API tersedia, integrasikan dengan endpoint di atas (search-products, add-to-cart, update-cart, remove-from-cart, empty-cart, warehouse-empty-cart, cartdiscount, pos/data/store).
