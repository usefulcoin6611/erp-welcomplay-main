"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function SystemSettingsSection() {
  const { formData, setFormData, save } = useSettings('/api/settings/system', {
    site_date_format: 'M j, Y',
    site_time_format: 'g:i A',
    customer_prefix: '#CUST',
    proposal_prefix: '#PROP',
    bill_prefix: '#BILL',
    purchase_prefix: '#PUR',
    journal_prefix: '#JUR',
    vendor_prefix: '#VEND',
    invoice_prefix: '#INVO',
    quotation_prefix: '#QUO',
    pos_prefix: '#POS',
    expense_prefix: '#EXP',
    display_shipping: true,
    footer_title: '',
    footer_note: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard
      title="System Settings"
      description="Edit your system details"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Date and Time Format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="site_date_format">Date Format</Label>
            <Select
              value={formData.site_date_format}
              onValueChange={(val) => setFormData({ ...formData, site_date_format: val })}
            >
              <SelectTrigger id="site_date_format" variant="modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M j, Y">Jan 1, 2015</SelectItem>
                <SelectItem value="d-m-Y">dd-mm-yyyy</SelectItem>
                <SelectItem value="m-d-Y">mm-dd-yyyy</SelectItem>
                <SelectItem value="Y-m-d">yyyy-mm-dd</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_time_format">Time Format</Label>
            <Select
              value={formData.site_time_format}
              onValueChange={(val) => setFormData({ ...formData, site_time_format: val })}
            >
              <SelectTrigger id="site_time_format" variant="modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g:i A">10:30 PM</SelectItem>
                <SelectItem value="g:i a">10:30 pm</SelectItem>
                <SelectItem value="H:i">22:30</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prefix settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_prefix">Customer Prefix</Label>
              <Input
                id="customer_prefix"
                value={formData.customer_prefix}
                onChange={(e) => setFormData({ ...formData, customer_prefix: e.target.value })}
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal_prefix">Proposal Prefix</Label>
              <Input
                id="proposal_prefix"
                value={formData.proposal_prefix}
                onChange={(e) => setFormData({ ...formData, proposal_prefix: e.target.value })}
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill_prefix">Bill Prefix</Label>
              <Input
                id="bill_prefix"
                value={formData.bill_prefix}
                onChange={(e) => setFormData({ ...formData, bill_prefix: e.target.value })}
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_prefix">Purchase Prefix</Label>
              <Input
                id="purchase_prefix"
                value={formData.purchase_prefix}
                onChange={(e) => setFormData({ ...formData, purchase_prefix: e.target.value })}
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journal_prefix">Journal Prefix</Label>
              <Input
                id="journal_prefix"
                value={formData.journal_prefix}
                onChange={(e) => setFormData({ ...formData, journal_prefix: e.target.value })}
                variant="modern"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor_prefix">Vendor Prefix</Label>
              <Input
                id="vendor_prefix"
                value={formData.vendor_prefix}
                onChange={(e) => setFormData({ ...formData, vendor_prefix: e.target.value })}
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
              <Input
                id="invoice_prefix"
                value={formData.invoice_prefix}
                onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quotation_prefix">Quotation Prefix</Label>
              <Input
                id="quotation_prefix"
                value={formData.quotation_prefix}
                onChange={(e) => setFormData({ ...formData, quotation_prefix: e.target.value })}
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pos_prefix">Pos Prefix</Label>
              <Input
                id="pos_prefix"
                value={formData.pos_prefix || ''}
                onChange={(e) => setFormData({ ...formData, pos_prefix: e.target.value })}
                placeholder="Enter Pos Prefix"
                variant="modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense_prefix">Expense Prefix</Label>
              <Input
                id="expense_prefix"
                value={formData.expense_prefix}
                onChange={(e) => setFormData({ ...formData, expense_prefix: e.target.value })}
                variant="modern"
              />
            </div>
          </div>
        </div>

        {/* Display Shipping toggle */}
        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          <Label htmlFor="display_shipping" className="text-sm font-medium cursor-pointer">
            Display Shipping in Proposal / Invoice / Bill
          </Label>
          <Switch
            id="display_shipping"
            checked={formData.display_shipping}
            onCheckedChange={(checked) => setFormData({ ...formData, display_shipping: checked })}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>

        {/* Footer Title */}
        <div className="space-y-2">
          <Label htmlFor="footer_title">Proposal/Invoice/Bill/Purchase/POS Footer Title</Label>
          <Input
            id="footer_title"
            value={formData.footer_title}
            onChange={(e) => setFormData({ ...formData, footer_title: e.target.value })}
            placeholder="Footer Title"
            variant="modern"
          />
        </div>

        {/* Footer Note */}
        <div className="space-y-2">
          <Label htmlFor="footer_note">Proposal/Invoice/Bill/Purchase/POS Footer Note</Label>
          <Textarea
            id="footer_note"
            value={formData.footer_note}
            onChange={(e) => setFormData({ ...formData, footer_note: e.target.value })}
            placeholder="Footer Note"
            rows={3}
            variant="modern"
          />
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
