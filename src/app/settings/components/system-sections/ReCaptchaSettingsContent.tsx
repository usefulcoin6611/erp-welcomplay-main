"use client"

import { useSettings } from '@/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save } from 'lucide-react'

export function ReCaptchaSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/recaptcha', {
    google_recaptcha_enabled: false,
    google_recaptcha_version: 'v2-checkbox',
    google_recaptcha_key: '',
    google_recaptcha_secret: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium leading-none">Google ReCaptcha Settings</CardTitle>
          </div>
          <Switch
            checked={formData.google_recaptcha_enabled}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, google_recaptcha_enabled: checked })
            }
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="google_recaptcha_version" className="text-sm font-medium text-gray-700 dark:text-gray-300">ReCaptcha Version</Label>
              <Select
                value={formData.google_recaptcha_version}
                onValueChange={(value) =>
                  setFormData({ ...formData, google_recaptcha_version: value })
                }
              >
                <SelectTrigger id="google_recaptcha_version" variant="modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2-checkbox">v2 Checkbox</SelectItem>
                  <SelectItem value="v2-invisible">v2 Invisible</SelectItem>
                  <SelectItem value="v3">v3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_recaptcha_key" className="text-sm font-medium text-gray-700 dark:text-gray-300">ReCaptcha Key</Label>
              <Input
                id="google_recaptcha_key"
                value={formData.google_recaptcha_key}
                placeholder="Enter Google Recaptcha Key"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, google_recaptcha_key: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_recaptcha_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">ReCaptcha Secret</Label>
              <Input
                id="google_recaptcha_secret"
                type="password"
                value={formData.google_recaptcha_secret}
                placeholder="Enter Google Recaptcha Secret"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, google_recaptcha_secret: e.target.value })
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
