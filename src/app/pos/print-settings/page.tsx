'use client'

import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SmoothTab } from '@/components/ui/smooth-tab'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload } from 'lucide-react'

const CARD_STYLE = 'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border border-border rounded-lg bg-white'

const TEMPLATE_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'receipt', label: 'Receipt' },
]

const COLOR_PALETTE = [
  '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1e3a8a', '#6b7280',
  '#9ca3af', '#d1d5db', '#374151', '#111827', '#ef4444', '#f87171',
  '#fca5a5', '#dc2626', '#991b1b', '#f97316', '#fb923c', '#fdba74',
  '#eab308', '#facc15', '#fde047', '#ca8a04', '#a16207', '#22c55e',
  '#4ade80', '#86efac', '#16a34a', '#8b5cf6', '#a78bfa', '#ec4899',
  '#ffffff', '#000000',
]

type DocType = 'purchase' | 'quotation' | 'pos'

type DocSettings = {
  template: string
  qrDisplay: boolean
  color: string
  logoFile: File | null
  logoPreviewUrl: string | null
}

const DEFAULT_SETTINGS: DocSettings = {
  template: 'default',
  qrDisplay: true,
  color: '#1e40af',
  logoFile: null,
  logoPreviewUrl: null,
}

export default function POSPrintSettingsPage() {
  const [activeTab, setActiveTab] = useState<DocType>('pos')
  const [purchase, setPurchase] = useState<DocSettings>(DEFAULT_SETTINGS)
  const [quotation, setQuotation] = useState<DocSettings>(DEFAULT_SETTINGS)
  const [pos, setPos] = useState<DocSettings>(DEFAULT_SETTINGS)
  const purchaseLogoRef = useRef<HTMLInputElement>(null)
  const quotationLogoRef = useRef<HTMLInputElement>(null)
  const posLogoRef = useRef<HTMLInputElement>(null)

  const getSettings = (tab: DocType) => {
    if (tab === 'purchase') return purchase
    if (tab === 'quotation') return quotation
    return pos
  }

  const setSettings = (tab: DocType, updater: (prev: DocSettings) => DocSettings) => {
    if (tab === 'purchase') setPurchase(updater)
    else if (tab === 'quotation') setQuotation(updater)
    else setPos(updater)
  }

  const getLogoRef = (tab: DocType) => {
    if (tab === 'purchase') return purchaseLogoRef
    if (tab === 'quotation') return quotationLogoRef
    return posLogoRef
  }

  const handleLogoChange = (tab: DocType, file: File | null) => {
    const prev = getSettings(tab)
    if (prev.logoPreviewUrl) URL.revokeObjectURL(prev.logoPreviewUrl)
    const url = file ? URL.createObjectURL(file) : null
    setSettings(tab, (p) => ({ ...p, logoFile: file, logoPreviewUrl: url }))
  }

  const previewUrl = useMemo(() => {
    const current = getSettings(activeTab)
    const color = current.color.replace('#', '')
    if (activeTab === 'purchase') return `/purchase/preview/${current.template}/${color}`
    if (activeTab === 'quotation') return `/quotation/preview/${current.template}/${color}`
    return `/pos/preview/${current.template}/${color}`
  }, [activeTab, purchase, quotation, pos])
  const currentSettings = getSettings(activeTab)
  const docLabelUpper =
    activeTab === 'purchase' ? 'PURCHASE' : activeTab === 'quotation' ? 'QUOTATION' : 'POS'

  return (
    <POSPageLayout title="Print Settings" breadcrumbLabel="Print Settings">
      <Card className={CARD_STYLE}>
        <div className="flex flex-col lg:flex-row min-h-[520px]">
          <div className="flex-1 p-6 pr-4 lg:pr-6 lg:border-r border-border min-w-0">
            <SmoothTab
              value={activeTab}
              onChange={(id) => setActiveTab(id as DocType)}
              activeColor="bg-white shadow-xs"
              className="mb-4"
              items={(['purchase', 'quotation', 'pos'] as const).map((tab) => {
                const settings = getSettings(tab)
                const label = tab === 'purchase' ? 'Purchase' : tab === 'quotation' ? 'Quotation' : 'POS'
                return {
                  id: tab,
                  title:
                    tab === 'purchase'
                      ? 'Purchase Print Setting'
                      : tab === 'quotation'
                        ? 'Quotation Print Setting'
                        : 'POS Print Setting',
                  content: (
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-5 pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-4 max-w-sm">
                        <div className="space-y-2">
                          <Label htmlFor={`${tab}-template`} className="text-sm font-medium text-foreground">
                            {label} Template
                          </Label>
                          <Select
                            value={settings.template}
                            onValueChange={(v) => setSettings(tab, (p) => ({ ...p, template: v }))}
                          >
                            <SelectTrigger id={`${tab}-template`} className="h-9 w-full max-w-[220px] border border-gray-200 bg-white text-foreground shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TEMPLATE_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-3">
                          <Label htmlFor={`${tab}-qr`} className="text-sm font-medium text-foreground cursor-pointer">
                            QR Display?
                          </Label>
                          <Switch
                            id={`${tab}-qr`}
                            checked={settings.qrDisplay}
                            onCheckedChange={(checked) =>
                              setSettings(tab, (p) => ({ ...p, qrDisplay: checked }))
                            }
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Color Input</Label>
                        <div className="grid grid-cols-6 gap-1.5 w-full max-w-[280px]">
                          {COLOR_PALETTE.map((hex) => {
                            const isLight = ['#ffffff', '#fde047', '#facc15', '#f9a8d4', '#86efac', '#93c5fd', '#5eead4', '#c4b5fd', '#d1d5db'].includes(hex)
                            return (
                              <button
                                key={`${tab}-${hex}`}
                                type="button"
                                onClick={() => setSettings(tab, (p) => ({ ...p, color: hex }))}
                                className="w-8 h-8 rounded border-2 shrink-0 transition-[transform,box-shadow] hover:scale-105"
                                style={{
                                  backgroundColor: hex,
                                  borderColor:
                                    settings.color === hex
                                      ? '#3b82f6'
                                      : isLight
                                        ? 'rgba(0,0,0,0.2)'
                                        : 'rgba(0,0,0,0.12)',
                                  boxShadow:
                                    settings.color === hex
                                      ? '0 0 0 2px white, 0 0 0 4px #3b82f6'
                                      : undefined,
                                }}
                                title={hex}
                              />
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">{label} Logo</Label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            ref={getLogoRef(tab)}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleLogoChange(tab, e.target.files?.[0] ?? null)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="blue"
                            className="h-9 shadow-none rounded-md px-4"
                            onClick={() => getLogoRef(tab).current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Choose file here
                          </Button>
                          {settings.logoFile && (
                            <span className="text-sm text-muted-foreground truncate max-w-[160px]">
                              {settings.logoFile.name}
                            </span>
                          )}
                        </div>
                        {settings.logoPreviewUrl && (
                          <img src={settings.logoPreviewUrl} alt={`${label} logo`} className="h-16 w-auto rounded-md border" />
                        )}
                      </div>

                      <div className="flex justify-end border-t border-border pt-4">
                        <Button type="submit" size="sm" variant="blue" className="shadow-none">
                          Save
                        </Button>
                      </div>
                    </form>
                  ),
                }
              })}
            />
          </div>

          <Separator orientation="vertical" className="hidden lg:flex shrink-0" />

          <div className="flex-1 min-w-0 p-6 pl-4 lg:pl-6 bg-muted/20">
            <p className="text-sm font-medium text-foreground mb-3">Pratinjau Cetak</p>
            <div
              className="rounded-lg border border-border bg-white overflow-y-auto shadow-sm max-w-[700px]"
              style={{ minHeight: 460, maxHeight: 560 }}
            >
              <div className="text-sm text-foreground">
                <div
                  className="flex items-center justify-between gap-4 px-5 py-4 text-white"
                  style={{ backgroundColor: currentSettings.color }}
                >
                  <div className="min-w-0 max-w-[200px]">
                    {currentSettings.logoPreviewUrl ? (
                      <img
                        src={currentSettings.logoPreviewUrl}
                        alt="Logo"
                        className="max-h-10 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-lg font-semibold opacity-90">Welcomplay ERP</span>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight shrink-0">
                    {docLabelUpper}
                  </h3>
                </div>
                <div className="flex flex-wrap justify-between gap-4 px-5 py-4">
                  <div className="space-y-0.5 min-w-0 max-w-[55%] text-muted-foreground leading-snug">
                    <p className="font-medium text-foreground">PT Contoh Ekspor</p>
                    <p>kontak@contoh.co.id</p>
                    <p>Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta - 10220</p>
                    <p>Indonesia (021) 12345678</p>
                    <p>Nomor Registrasi: 8612783412312</p>
                    <p>NPWP: 12.345.678.9-012.000</p>
                    <p>Nomor Pajak:</p>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <p><span className="text-foreground">Nomor:</span> #POS00001</p>
                    <p><span className="text-foreground">Tanggal Terbit:</span> 1 Feb 2026</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 px-5 pb-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Tagih Kepada:</p>
                    <p className="text-muted-foreground">&lt;Nama Pelanggan&gt;</p>
                    <p className="text-muted-foreground">&lt;Alamat&gt;</p>
                    <p className="text-muted-foreground">&lt;Kota&gt;</p>
                    <p className="text-muted-foreground">&lt;Provinsi&gt;, &lt;Kode Pos&gt;</p>
                    <p className="text-muted-foreground">&lt;Negara&gt;</p>
                    <p className="text-muted-foreground">&lt;No. Telepon Pelanggan&gt;</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Kirim Ke:</p>
                    <p className="text-muted-foreground">&lt;Nama Pelanggan&gt;</p>
                    <p className="text-muted-foreground">&lt;Alamat&gt;</p>
                    <p className="text-muted-foreground">&lt;Kota&gt;</p>
                    <p className="text-muted-foreground">&lt;Provinsi&gt;, &lt;Kode Pos&gt;</p>
                    <p className="text-muted-foreground">&lt;Negara&gt;</p>
                    <p className="text-muted-foreground">&lt;No. Telepon Pelanggan&gt;</p>
                  </div>
                </div>
                <div className="px-5 pb-4">
                  <p className="font-semibold text-foreground mb-1">Ringkasan Barang & Jasa</p>
                  <p className="text-muted-foreground text-xs mb-2">Detail barang dan jasa yang ditagihkan sesuai dokumen.</p>
                  <div className="border border-border rounded-md overflow-hidden">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: currentSettings.color }} className="text-white">
                          <th className="text-left py-2 px-3 font-semibold">Item</th>
                          <th className="text-left py-2 px-3 font-semibold">Jumlah</th>
                          <th className="text-left py-2 px-3 font-semibold">Harga Satuan</th>
                          <th className="text-left py-2 px-3 font-semibold">Diskon</th>
                          <th className="text-left py-2 px-3 font-semibold">Pajak (%)</th>
                          <th className="text-right py-2 px-3 font-semibold">Harga <span className="block font-normal text-[10px]">setelah pajak & diskon</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {['Item 1', 'Item 2', 'Item 3'].map((name) => (
                          <tr key={name} className="border-t border-border">
                            <td className="py-2 px-3">{name}</td>
                            <td className="py-2 px-3">1</td>
                            <td className="py-2 px-3">100</td>
                            <td className="py-2 px-3">50</td>
                            <td className="py-2 px-3">10 %</td>
                            <td className="py-2 px-3 text-right">60</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2" style={{ borderColor: currentSettings.color }}>
                        <tr className="bg-muted/30 font-semibold">
                          <td className="py-2 px-3">Total</td>
                          <td className="py-2 px-3">3</td>
                          <td className="py-2 px-3">300</td>
                          <td className="py-2 px-3">10</td>
                          <td className="py-2 px-3">60</td>
                          <td className="py-2 px-3 text-right">—</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="py-2 px-3" />
                          <td className="py-2 px-3 text-foreground">Subtotal:</td>
                          <td className="py-2 px-3 text-right">290</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="py-2 px-3" />
                          <td className="py-2 px-3 text-foreground">Diskon:</td>
                          <td className="py-2 px-3 text-right">10</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="py-2 px-3" />
                          <td className="py-2 px-3 font-semibold" style={{ color: currentSettings.color }}>Total:</td>
                          <td className="py-2 px-3 text-right font-semibold" style={{ color: currentSettings.color }}>350</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-border text-muted-foreground text-xs">
                  <p className="font-semibold text-foreground">Informasi Pembayaran</p>
                  <p>Pembayaran dapat dilakukan melalui transfer ke rekening perusahaan. Dokumen ini sah sebagai bukti transaksi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </POSPageLayout>
  )
}
