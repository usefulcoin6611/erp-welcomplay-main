"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function EmailNotificationSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/email-notification', {
    notify_new_user: true,
    notify_new_order: true,
    notify_plan_expired: true,
    notify_payment: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  const notificationItems = [
    { id: 'notify_new_user', label: 'New User' },
    { id: 'notify_new_order', label: 'New Order' },
    { id: 'notify_plan_expired', label: 'Plan Expired' },
    { id: 'notify_payment', label: 'Payment Status' },
  ]

  return (
    <SectionCard title="Email Notification Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notificationItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-md border px-4 py-3">
              <Label htmlFor={item.id} className="text-sm font-medium">
                {item.label}
              </Label>
              <Switch
                id={item.id}
                checked={(formData as any)[item.id]}
                onCheckedChange={(checked) => setFormData({ ...formData, [item.id]: checked })}
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
              />
            </div>
          ))}
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
