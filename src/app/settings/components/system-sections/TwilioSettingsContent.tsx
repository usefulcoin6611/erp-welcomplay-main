"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function TwilioSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/twilio', {
    twilio_sid: '',
    twilio_token: '',
    twilio_from: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="Twilio Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="twilio_sid">Twilio SID</Label>
            <Input
              id="twilio_sid"
              value={formData.twilio_sid}
              onChange={(e) => setFormData({ ...formData, twilio_sid: e.target.value })}
              placeholder="Enter Twilio SID"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twilio_token">Twilio Token</Label>
            <Input
              id="twilio_token"
              type="password"
              value={formData.twilio_token}
              onChange={(e) => setFormData({ ...formData, twilio_token: e.target.value })}
              placeholder="Enter Twilio Token"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twilio_from">Twilio From Number</Label>
            <Input
              id="twilio_from"
              value={formData.twilio_from}
              onChange={(e) => setFormData({ ...formData, twilio_from: e.target.value })}
              placeholder="Enter Twilio From Number"
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
