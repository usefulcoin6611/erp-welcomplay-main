'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

type BarcodeDisplayProps = {
  value: string
  format?: 'CODE128' | 'CODE39' | 'CODE93'
  height?: number
  width?: number
  displayValue?: boolean
}

/**
 * Tampilan barcode visual (garis/strip) menggunakan JsBarcode.
 * Format: CODE128, CODE39, CODE93 (sesuai Print Settings > Barcode Setting).
 */
export function BarcodeDisplay({
  value,
  format = 'CODE128',
  height = 40,
  width = 2,
  displayValue = true,
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!value || String(value).trim() === '') return
    const el = svgRef.current
    if (!el) return
    try {
      JsBarcode(el, value.trim(), {
        format,
        width,
        height,
        displayValue,
      })
    } catch (e) {
      console.error('JsBarcode error:', e)
    }
  }, [value, format, width, height, displayValue])

  if (!value || String(value).trim() === '') {
    return <span className="text-muted-foreground text-sm">—</span>
  }

  return <svg ref={svgRef} className="min-h-[40px]" />
}
