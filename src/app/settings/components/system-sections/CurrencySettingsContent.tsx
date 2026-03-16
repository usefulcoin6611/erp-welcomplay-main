"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function CurrencySettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/currency', {
    currency_code: 'USD',
    currency_symbol: '$',
    currency_symbol_position: 'pre',
    decimal_number: '2',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard
      title="Currency Settings"
      description="Edit your currency details"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currency_code">Currency</Label>
            <Input
              id="currency_code"
              value={formData.currency_code}
              onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
              placeholder="Enter Currency Code"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency_symbol">Currency Symbol</Label>
            <Input
              id="currency_symbol"
              value={formData.currency_symbol}
              onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
              placeholder="Enter Currency Symbol"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency_symbol_position">Currency Symbol Position</Label>
            <Select
              value={formData.currency_symbol_position}
              onValueChange={(val) => setFormData({ ...formData, currency_symbol_position: val })}
            >
              <SelectTrigger id="currency_symbol_position" variant="modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre">Pre</SelectItem>
                <SelectItem value="post">Post</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="decimal_number">Decimal Number Format</Label>
            <Input
              id="decimal_number"
              type="number"
              value={formData.decimal_number}
              onChange={(e) => setFormData({ ...formData, decimal_number: e.target.value })}
              placeholder="Enter Decimal Number"
              variant="modern"
            />
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" variant="blue" className="shadow-none">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
