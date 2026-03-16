"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function TelegramSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/telegram', {
    telegram_bot_token: '',
    telegram_chat_id: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="Telegram Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telegram_bot_token">Telegram Bot Token</Label>
            <Input
              id="telegram_bot_token"
              value={formData.telegram_bot_token}
              onChange={(e) => setFormData({ ...formData, telegram_bot_token: e.target.value })}
              placeholder="Enter Bot Token"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram_chat_id">Telegram Chat ID</Label>
            <Input
              id="telegram_chat_id"
              value={formData.telegram_chat_id || ''}
              onChange={(e) => setFormData({ ...formData, telegram_chat_id: e.target.value })}
              placeholder="Enter Chat ID"
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
