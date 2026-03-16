"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function TimeTrackerSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/time-tracker', {
    time_tracker_enabled: false,
    time_tracker_limit: '8',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="Time Tracker Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <Label htmlFor="time_tracker_enabled" className="text-sm font-medium">
                Enable Time Tracker
              </Label>
              <p className="text-xs text-muted-foreground">Enable time tracking for projects.</p>
            </div>
            <Switch
              id="time_tracker_enabled"
              checked={formData.time_tracker_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, time_tracker_enabled: checked })}
              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time_tracker_limit">Daily Working Hours</Label>
            <Input
              id="time_tracker_limit"
              type="number"
              value={formData.time_tracker_limit}
              onChange={(e) => setFormData({ ...formData, time_tracker_limit: e.target.value })}
              placeholder="Enter hours per day"
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
