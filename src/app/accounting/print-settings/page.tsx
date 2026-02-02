'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SmoothTab } from '@/components/ui/smooth-tab'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

/** Satu kartu putih besar (reference-erp): shadow ring border rounded */
const CARD_STYLE = 'shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border border-border rounded-lg bg-white'

const TEMPLATE_OPTIONS = [
  { value: 'new-york', label: 'New York' },
  { value: 'default', label: 'Default' },
  { value: 'classic', label: 'Classic' },
]

/** Grid 4 baris x 6 kolom + putih & hitam (reference: Color Input) */
const COLOR_PALETTE = [
  '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#1e3a8a', '#6b7280',
  '#9ca3af', '#d1d5db', '#374151', '#111827', '#ef4444', '#f87171',
  '#fca5a5', '#dc2626', '#991b1b', '#f97316', '#fb923c', '#fdba74',
  '#eab308', '#facc15', '#fde047', '#ca8a04', '#a16207', '#22c55e',
  '#4ade80', '#86efac', '#16a34a', '#8b5cf6', '#a78bfa', '#ec4899',
  '#ffffff', '#000000',
]

type DocType = 'proposal' | 'invoice' | 'bill'

type DocSettings = {
  template: string
  qrDisplay: boolean
  color: string
  logoFile: File | null
  logoPreviewUrl: string | null
}

const DEFAULT_SETTINGS: DocSettings = {
  template: 'new-york',
  qrDisplay: true,
  color: '#1e40af',
  logoFile: null,
  logoPreviewUrl: null,
}

export default function AccountingPrintSettingsPage() {
  const [activeTab, setActiveTab] = useState<DocType>('proposal')
  const [proposal, setProposal] = useState<DocSettings>(DEFAULT_SETTINGS)
  const [invoice, setInvoice] = useState<DocSettings>(DEFAULT_SETTINGS)
  const [bill, setBill] = useState<DocSettings>(DEFAULT_SETTINGS)
  const proposalLogoRef = useRef<HTMLInputElement>(null)
  const invoiceLogoRef = useRef<HTMLInputElement>(null)
  const billLogoRef = useRef<HTMLInputElement>(null)

  const getSettings = (tab: DocType) => {
    if (tab === 'proposal') return proposal
    if (tab === 'invoice') return invoice
    return bill
  }

  const setSettings = (tab: DocType, updater: (prev: DocSettings) => DocSettings) => {
    if (tab === 'proposal') setProposal(updater)
    else if (tab === 'invoice') setInvoice(updater)
    else setBill(updater)
  }

  const getLogoRef = (tab: DocType) => {
    if (tab === 'proposal') return proposalLogoRef
    if (tab === 'invoice') return invoiceLogoRef
    return billLogoRef
  }

  const docLabel = (tab: DocType) =>
    tab === 'proposal' ? 'Proposal' : tab === 'invoice' ? 'Invoice' : 'Bill'

  const docLabelUpper = (tab: DocType) =>
    tab === 'proposal' ? 'PROPOSAL' : tab === 'invoice' ? 'FAKTUR' : 'TAGIHAN'

  const handleLogoChange = (tab: DocType, file: File | null) => {
    const prev = getSettings(tab)
    if (prev.logoPreviewUrl) URL.revokeObjectURL(prev.logoPreviewUrl)
    const url = file ? URL.createObjectURL(file) : null
    setSettings(tab, (p) => ({ ...p, logoFile: file, logoPreviewUrl: url }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success(`${docLabel(activeTab)} print setting saved.`)
  }

  const currentSettings = getSettings(activeTab)
  const templateLabel =
    TEMPLATE_OPTIONS.find((o) => o.value === currentSettings.template)?.label ?? currentSettings.template

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className={CARD_STYLE}>
              <CardContent className="px-6 py-4">
                <Breadcrumb>
                  <BreadcrumbList className="text-muted-foreground text-sm">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/accounting">Accounting</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-foreground font-medium">Print Settings</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <h4 className="mt-2 text-xl font-semibold text-foreground">Print Settings</h4>
              </CardContent>
            </Card>

            {/* Satu kartu besar: SmoothTab kiri | garis vertikal | kanan (preview) */}
            <Card className={CARD_STYLE}>
              <div className="flex flex-col lg:flex-row min-h-[520px]">
                {/* Kiri: SmoothTab (tab + form settings) */}
                <div className="flex-1 p-6 pr-4 lg:pr-6 lg:border-r border-border min-w-0">
                  <SmoothTab
                    value={activeTab}
                    onChange={(id) => setActiveTab(id as DocType)}
                    activeColor="bg-white dark:bg-gray-700 shadow-xs"
                    className="mb-4"
                    items={(['proposal', 'invoice', 'bill'] as const).map((tab) => {
                      const settings = getSettings(tab)
                      const label = docLabel(tab)
                      return {
                        id: tab,
                        title: tab === 'proposal' ? 'Proposal Print Setting' : tab === 'invoice' ? 'Invoice Print Setting' : 'Bill Print Setting',
                        content: (
                          <form onSubmit={handleSave} className="space-y-5 pt-2">
                            <div className="space-y-2">
                              <Label htmlFor={`${tab}-template`} className="text-sm font-medium text-foreground">
                                {label} Template
                              </Label>
                              <Select
                                value={settings.template}
                                onValueChange={(v) =>
                                  setSettings(tab, (p) => ({ ...p, template: v }))
                                }
                              >
                                <SelectTrigger id={`${tab}-template`} className="h-9 w-full max-w-[220px] border border-gray-200 bg-white text-foreground shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-foreground">
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

                            <div className="flex items-center justify-between gap-4 max-w-sm">
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

                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Color Input</Label>
                              <div className="grid grid-cols-6 gap-1.5 w-full max-w-[280px]">
                                {COLOR_PALETTE.map((hex) => {
                                  const isLight = ['#ffffff', '#fde047', '#facc15', '#f9a8d4', '#86efac', '#93c5fd', '#5eead4', '#c4b5fd', '#d1d5db'].includes(hex)
                                  return (
                                    <button
                                      key={hex}
                                      type="button"
                                      onClick={() =>
                                        setSettings(tab, (p) => ({ ...p, color: hex }))
                                      }
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
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null
                                    handleLogoChange(tab, file)
                                  }}
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
                            </div>

                            <div className="flex justify-end border-t border-border pt-4">
                              <Button
                                type="submit"
                                size="sm"
                                variant="blue"
                                className="h-9 shadow-none rounded-md px-4"
                              >
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

                {/* Kanan: Print Preview (sesuai reference-erp proposal/templates/template1) */}
                <div className="flex-1 min-w-0 p-6 pl-4 lg:pl-6 bg-muted/20">
                  <p className="text-sm font-medium text-foreground mb-3">Pratinjau Cetak</p>
                  <div
                    className="rounded-lg border border-border bg-white overflow-y-auto shadow-sm max-w-[700px]"
                    style={{ minHeight: 460, maxHeight: 560 }}
                  >
                    <div className="text-sm text-foreground">
                      {/* Header: background color, logo kiri + doc type kanan (reference-erp proposal template1) */}
                      <div
                        className="flex items-center justify-between gap-4 px-5 py-4 text-white"
                        style={{ backgroundColor: currentSettings.color }}
                      >
                        <div className="min-w-0 max-w-[200px]">
                          {currentSettings.logoPreviewUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
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
                          {docLabelUpper(activeTab)}
                        </h3>
                      </div>
                      {/* Company info kiri, Number/Issue Date/QR kanan */}
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
                          <p><span className="text-foreground">Nomor:</span> #PROP00001</p>
                          <p><span className="text-foreground">Tanggal Terbit:</span> 1 Feb 2026</p>
                          {currentSettings.qrDisplay && (
                            <div className="mt-2 flex justify-end">
                              <div className="w-[100px] h-[100px] rounded-lg bg-white p-2 border border-border flex items-center justify-center">
                                <div className="grid grid-cols-7 gap-px w-full h-full bg-black rounded p-0.5">
                                  {Array.from({ length: 49 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={(i + Math.floor(i / 7)) % 2 === 0 ? 'bg-black' : 'bg-white'}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Tagih Kepada / Kirim Ke (lokal Indonesia) */}
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
                      {/* Ringkasan Produk (lokal Indonesia) */}
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
                      {/* Footer (lokal Indonesia) */}
                      <div className="px-5 py-3 border-t border-border text-muted-foreground text-xs">
                        <p className="font-semibold text-foreground">Informasi Pembayaran</p>
                        <p>Pembayaran dapat dilakukan melalui transfer ke rekening perusahaan. Dokumen ini sah sebagai bukti transaksi.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
