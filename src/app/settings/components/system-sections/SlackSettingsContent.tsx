"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function SlackSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/slack', {
    slack_webhook: '',
    slack_channel: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="Slack Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slack_webhook">Slack Webhook URL</Label>
            <Input
              id="slack_webhook"
              value={formData.slack_webhook}
              onChange={(e) => setFormData({ ...formData, slack_webhook: e.target.value })}
              placeholder="Enter Slack Webhook URL"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slack_channel">Slack Channel</Label>
            <Input
              id="slack_channel"
              value={formData.slack_channel}
              onChange={(e) => setFormData({ ...formData, slack_channel: e.target.value })}
              placeholder="Enter Slack Channel"
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
