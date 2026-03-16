"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function AccountingPrintSettingsSection() {
  const { formData, setFormData, save } = useSettings('/api/settings/accounting-print', {
    proposal: { template: 'new-york', qrDisplay: true, color: '#1e40af' },
    invoice: { template: 'new-york', qrDisplay: true, color: '#1e40af' },
    bill: { template: 'new-york', qrDisplay: true, color: '#1e40af' },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  const templates = [
    { value: 'new-york', label: 'New York' },
    { value: 'london', label: 'London' },
    { value: 'paris', label: 'Paris' },
    { value: 'tokyo', label: 'Tokyo' },
  ]

  const DocSettings = ({ type, title }: { type: 'proposal' | 'invoice' | 'bill'; title: string }) => (
    <div className="space-y-4 p-4 border rounded-lg">
      <h4 className="font-medium text-sm border-b pb-2">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Template</Label>
          <Select
            value={formData[type]?.template || 'new-york'}
            onValueChange={(val) => setFormData({ ...formData, [type]: { ...formData[type], template: val } })}
          >
            <SelectTrigger variant="modern">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={formData[type]?.color || '#1e40af'}
              className="w-12 h-9 p-1"
              onChange={(e) => setFormData({ ...formData, [type]: { ...formData[type], color: e.target.value } })}
            />
            <Input
              value={formData[type]?.color || '#1e40af'}
              variant="modern"
              onChange={(e) => setFormData({ ...formData, [type]: { ...formData[type], color: e.target.value } })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label>Show QR Code</Label>
          <Switch
            checked={formData[type]?.qrDisplay ?? true}
            onCheckedChange={(checked) => setFormData({ ...formData, [type]: { ...formData[type], qrDisplay: checked } })}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
      </div>
    </div>
  )

  return (
    <SectionCard title="Accounting Print Settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        <DocSettings type="proposal" title="Proposal Print Setting" />
        <DocSettings type="invoice" title="Invoice Print Setting" />
        <DocSettings type="bill" title="Bill Print Setting" />
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" variant="blue" className="shadow-none">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
