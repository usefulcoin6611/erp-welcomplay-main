"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function ZoomSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/zoom', {
    zoom_api_key: '',
    zoom_api_secret: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="Zoom Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zoom_api_key">Zoom API Key</Label>
            <Input
              id="zoom_api_key"
              value={formData.zoom_api_key}
              onChange={(e) => setFormData({ ...formData, zoom_api_key: e.target.value })}
              placeholder="Enter Zoom API Key"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zoom_api_secret">Zoom API Secret</Label>
            <Input
              id="zoom_api_secret"
              type="password"
              value={formData.zoom_api_secret}
              onChange={(e) => setFormData({ ...formData, zoom_api_secret: e.target.value })}
              placeholder="Enter Zoom API Secret"
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
