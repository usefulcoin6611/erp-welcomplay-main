'use client'

import { useState } from 'react'
import Link from 'next/link'
import { POSPageLayout } from '@/components/pos-page-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REPORT_CARD_CLASS } from '@/components/pos-reports/shared-styles'
import { Eye } from 'lucide-react'

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
  const [logoUrl, setLogoUrl] = useState('')
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')

  return (
    <POSPageLayout title="Print Settings" breadcrumbLabel="Print Settings">
      <Card className={REPORT_CARD_CLASS}>
        <CardContent className="p-6">
          <Tabs defaultValue="barcode" className="w-full">
            <TabsList className="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1 mb-6">
              <TabsTrigger
                value="barcode"
                className="data-[state=inactive]:bg-gray-200/90 data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-300/90 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=inactive]:bg-gray-700/80 dark:data-[state=inactive]:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
              >
                Barcode Setting
              </TabsTrigger>
              <TabsTrigger
                value="pos-print"
                className="data-[state=inactive]:bg-gray-200/90 data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-300/90 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=inactive]:bg-gray-700/80 dark:data-[state=inactive]:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
              >
                POS Print Setting
              </TabsTrigger>
            </TabsList>

            <TabsContent value="barcode" className="mt-0">
              <div className="pt-2">
                <CardHeader className="px-0 pt-0 pb-4">
                  <h3 className="text-base font-semibold tracking-tight">Barcode Setting</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configure barcode type and format for product barcodes (Print Barcode page).
                  </p>
                </CardHeader>
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    // barcode/settings
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
              </div>
            </TabsContent>

            <TabsContent value="pos-print" className="mt-0">
              <div className="pt-2">
                <CardHeader className="px-0 pt-0 pb-4">
                  <h3 className="text-base font-semibold tracking-tight">POS Print Setting</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize template, color, and logo for POS receipts and invoices (sesuai ERPGo POS Print Setting).
                  </p>
                </CardHeader>
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault()
                    // pos/template/setting save
                  }}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pos_template" className="text-foreground">
                        Template
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
                      <Label htmlFor="pos_color" className="text-foreground">
                        Color
                      </Label>
                      <Select value={color} onValueChange={setColor}>
                        <SelectTrigger id="pos_color" className="h-9">
                          <SelectValue placeholder="Select Color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="pos_logo" className="text-foreground">
                        Logo URL
                      </Label>
                      <Input
                        id="pos_logo"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pos_header" className="text-foreground">
                        Header Text (optional)
                      </Label>
                      <Input
                        id="pos_header"
                        placeholder="e.g. Thank you for your purchase"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pos_footer" className="text-foreground">
                        Footer Text (optional)
                      </Label>
                      <Input
                        id="pos_footer"
                        placeholder="e.g. Visit us again"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        className="h-9"
                      />
                    </div>
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </POSPageLayout>
  )
}
