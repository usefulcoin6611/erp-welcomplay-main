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

export function CompanySettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/company', {
    company_name: '',
    company_address: '',
    company_city: '',
    company_state: '',
    company_zipcode: '',
    company_country: '',
    company_telephone: '',
    registration_number: '',
    company_start_time: '09:00',
    company_end_time: '18:00',
    timezone: 'Asia/Jakarta',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard
      title="Company Settings"
      description="Edit your company details"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Enter Company Name"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_address">Address</Label>
            <Input
              id="company_address"
              value={formData.company_address}
              onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
              placeholder="Enter Company Address"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_city">City</Label>
            <Input
              id="company_city"
              value={formData.company_city}
              onChange={(e) => setFormData({ ...formData, company_city: e.target.value })}
              placeholder="Enter Company City"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_state">State</Label>
            <Input
              id="company_state"
              value={formData.company_state}
              onChange={(e) => setFormData({ ...formData, company_state: e.target.value })}
              placeholder="Enter Company State"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_zipcode">Zip/Post Code</Label>
            <Input
              id="company_zipcode"
              value={formData.company_zipcode}
              onChange={(e) => setFormData({ ...formData, company_zipcode: e.target.value })}
              placeholder="Enter Company Zip"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_country">Country</Label>
            <Input
              id="company_country"
              value={formData.company_country}
              onChange={(e) => setFormData({ ...formData, company_country: e.target.value })}
              placeholder="Enter Company Country"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_telephone">Telephone</Label>
            <Input
              id="company_telephone"
              value={formData.company_telephone}
              onChange={(e) => setFormData({ ...formData, company_telephone: e.target.value })}
              placeholder="Enter Company Telephone"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registration_number">Company Registration Number</Label>
            <Input
              id="registration_number"
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              placeholder="Enter Registration Number"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_start_time">Company Start Time</Label>
            <Input
              id="company_start_time"
              type="time"
              value={formData.company_start_time}
              onChange={(e) => setFormData({ ...formData, company_start_time: e.target.value })}
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_end_time">Company End Time</Label>
            <Input
              id="company_end_time"
              type="time"
              value={formData.company_end_time}
              onChange={(e) => setFormData({ ...formData, company_end_time: e.target.value })}
              variant="modern"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(val) => setFormData({ ...formData, timezone: val })}
            >
              <SelectTrigger id="timezone" variant="modern">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
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
