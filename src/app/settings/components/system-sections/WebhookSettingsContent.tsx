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

export function WebhookSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/webhook', {
    webhook_url: '',
    webhook_method: 'post',
    webhook_secret: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="Webhook Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="Enter Webhook URL"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook_method">Method</Label>
            <Select
              value={formData.webhook_method}
              onValueChange={(val) => setFormData({ ...formData, webhook_method: val })}
            >
              <SelectTrigger id="webhook_method" variant="modern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">POST</SelectItem>
                <SelectItem value="get">GET</SelectItem>
                <SelectItem value="put">PUT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook_secret">Secret</Label>
            <Input
              id="webhook_secret"
              type="password"
              value={formData.webhook_secret}
              onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
              placeholder="Enter Secret"
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
