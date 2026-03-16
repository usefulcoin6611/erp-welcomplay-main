"use client"

import { useSettings } from '@/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'

export function PusherSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/pusher', {
    pusher_app_id: '',
    pusher_app_key: '',
    pusher_app_secret: '',
    pusher_app_cluster: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Pusher Settings</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pusher_app_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pusher App Id</Label>
              <Input
                id="pusher_app_id"
                value={formData.pusher_app_id}
                placeholder="Pusher App Id"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, pusher_app_id: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pusher_app_key" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pusher App Key</Label>
              <Input
                id="pusher_app_key"
                value={formData.pusher_app_key}
                placeholder="Pusher App Key"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, pusher_app_key: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pusher_app_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pusher App Secret</Label>
              <Input
                id="pusher_app_secret"
                type="password"
                value={formData.pusher_app_secret}
                placeholder="Pusher App Secret"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, pusher_app_secret: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pusher_app_cluster" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pusher App Cluster</Label>
              <Input
                id="pusher_app_cluster"
                value={formData.pusher_app_cluster}
                placeholder="Pusher App Cluster"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, pusher_app_cluster: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="blue" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
