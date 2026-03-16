"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function GoogleCalendarSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/google-calendar', {
    google_calendar_enable: false,
    google_calendar_client_id: '',
    google_calendar_client_secret: '',
    google_calendar_redirect_url: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="Google Calendar Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <Label htmlFor="google_calendar_enable" className="text-sm font-medium">
              Enable Google Calendar
            </Label>
            <Switch
              id="google_calendar_enable"
              checked={formData.google_calendar_enable}
              onCheckedChange={(checked) => setFormData({ ...formData, google_calendar_enable: checked })}
              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="google_calendar_client_id">Client ID</Label>
            <Input
              id="google_calendar_client_id"
              value={formData.google_calendar_client_id}
              onChange={(e) => setFormData({ ...formData, google_calendar_client_id: e.target.value })}
              placeholder="Enter Client ID"
              variant="modern"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="google_calendar_client_secret">Client Secret</Label>
            <Input
              id="google_calendar_client_secret"
              type="password"
              value={formData.google_calendar_client_secret}
              onChange={(e) => setFormData({ ...formData, google_calendar_client_secret: e.target.value })}
              placeholder="Enter Client Secret"
              variant="modern"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="google_calendar_redirect_url">Redirect URL</Label>
            <Input
              id="google_calendar_redirect_url"
              value={formData.google_calendar_redirect_url}
              onChange={(e) => setFormData({ ...formData, google_calendar_redirect_url: e.target.value })}
              placeholder="Enter Redirect URL"
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
