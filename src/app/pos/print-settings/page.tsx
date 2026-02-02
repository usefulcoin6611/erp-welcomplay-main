'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SmoothTab } from '@/components/ui/smooth-tab'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Printer } from 'lucide-react'

/**
 * Print Settings sesuai reference-erp / ERPGo (https://demo.workdo.io/erpgo/pos-print-setting):
 * - Tab "Barcode Setting" (setting/pos): Barcode Type, Barcode Format, Save.
 * - Tab "POS Print Setting" (pos/template/setting): Template, Color, Logo, Paper Size, Preview, Save.
 */
export default function POSPrintSettingsPage() {
  const [barcodeType, setBarcodeType] = useState('code128')
  const [barcodeFormat, setBarcodeFormat] = useState('css')
  const [template, setTemplate] = useState('default')
  const [color, setColor] = useState('blue')
  const [paperSize, setPaperSize] = useState('80mm')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : ''), [logoFile])
  const [activeTab, setActiveTab] = useState<'barcode' | 'pos-print'>('pos-print')

  const colorOptions = [
    { value: 'blue', hex: '#3b82f6' },
    { value: 'green', hex: '#10b981' },
    { value: 'gray', hex: '#64748b' },
  ] as const

  return (
    <POSPageLayout title="Print Settings" breadcrumbLabel="Print Settings">
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0">
        <div className="flex flex-col lg:flex-row min-h-[520px]">
          <div className="flex-1 p-6 pr-4 lg:pr-6 lg:border-r border-border min-w-0">
            <SmoothTab
              value={activeTab}
              onChange={(id) => setActiveTab(id as 'barcode' | 'pos-print')}
              activeColor="bg-white shadow-xs"
              className="mb-4"
              items={[
                {
                  id: 'barcode',
                  title: 'Barcode Setting',
                  content: (
                    <form
                      className="space-y-6 pt-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="barcode_type" className="text-foreground">
                            Barcode Type
                          </Label>
                          <Select value={barcodeType} onValueChange={setBarcodeType}>
                            <SelectTrigger id="barcode_type" className="h-9">
                              <SelectValue placeholder="Select Barcode Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="code128">Code 128</SelectItem>
                              <SelectItem value="code39">Code 39</SelectItem>
                              <SelectItem value="code93">Code 93</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="barcode_format" className="text-foreground">
                            Barcode Format
                          </Label>
                          <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                            <SelectTrigger id="barcode_format" className="h-9">
                              <SelectValue placeholder="Select Barcode Format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="css">CSS</SelectItem>
                              <SelectItem value="bmp">BMP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end border-t pt-4">
                        <Button type="submit" size="sm" variant="blue" className="shadow-none">
                          Save
                        </Button>
                      </div>
                    </form>
                  ),
                },
                {
                  id: 'pos-print',
                  title: 'POS Print Setting',
                  content: (
                    <form
                      className="space-y-5 pt-2"
                      onSubmit={(e) => {
                        e.preventDefault()
                      }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="pos_template" className="text-foreground">
                          POS Template
                        </Label>
                        <Select value={template} onValueChange={setTemplate}>
                          <SelectTrigger id="pos_template" className="h-9">
                            <SelectValue placeholder="Select Template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="receipt">Receipt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground">Color Input</Label>
                        <div className="flex items-center gap-2">
                          {colorOptions.map((opt) => {
                            const isActive = color === opt.value
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setColor(opt.value)}
                                className="h-8 w-8 rounded-full border-2 transition-[transform,box-shadow] hover:scale-105"
                                style={{
                                  backgroundColor: opt.hex,
                                  borderColor: isActive ? '#3b82f6' : 'rgba(0,0,0,0.12)',
                                  boxShadow: isActive ? '0 0 0 2px white, 0 0 0 4px #3b82f6' : undefined,
                                }}
                                title={opt.value}
                              />
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pos_paper_size" className="text-foreground">
                          Paper Size
                        </Label>
                        <Select value={paperSize} onValueChange={setPaperSize}>
                          <SelectTrigger id="pos_paper_size" className="h-9">
                            <SelectValue placeholder="Select Paper Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="a4">A4</SelectItem>
                            <SelectItem value="letter">Letter</SelectItem>
                            <SelectItem value="80mm">80mm (Thermal)</SelectItem>
                            <SelectItem value="58mm">58mm (Thermal)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-foreground">POS Logo</Label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            id="pos_logo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="blue"
                            className="h-9 shadow-none px-4"
                            onClick={() => document.getElementById('pos_logo')?.click()}
                          >
                            Choose file here
                          </Button>
                          {logoFile && (
                            <span className="text-sm text-muted-foreground truncate max-w-[160px]">
                              {logoFile.name}
                            </span>
                          )}
                        </div>
                        {logoPreview && (
                          <img src={logoPreview} alt="POS Logo" className="h-16 w-auto rounded-md border" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shadow-none h-9 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                          asChild
                        >
                          <Link href={`/pos/preview/${template}/${color}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Link>
                        </Button>
                        <Button type="submit" size="sm" variant="blue" className="shadow-none">
                          Save
                        </Button>
                      </div>
                    </form>
                  ),
                },
              ]}
            />
          </div>

          <div className="w-full lg:w-[380px] xl:w-[420px] p-6 pt-0 lg:pt-6">
            <div className="rounded-md border bg-white p-2 min-h-[420px]">
              {activeTab === 'pos-print' ? (
                <iframe
                  title="POS Print Preview"
                  className="h-[420px] w-full rounded-md"
                  src={`/pos/preview/${template}/${color}`}
                />
              ) : (
                <div className="flex h-[420px] w-full items-center justify-center text-sm text-muted-foreground">
                  <Printer className="mr-2 h-4 w-4" />
                  Preview tersedia di tab POS Print Setting.
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </POSPageLayout>
  )
}
