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

export function ChatGPTSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/chatgpt', {
    chatgpt_enabled: false,
    chatgpt_model: 'gpt-3.5-turbo',
    chatgpt_key: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  const models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o']

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium leading-none">ChatGPT Settings</CardTitle>
          <Switch
            checked={formData.chatgpt_enabled}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, chatgpt_enabled: checked })
            }
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chatgpt_model" className="text-sm font-medium">Model</Label>
              <Select
                value={formData.chatgpt_model}
                onValueChange={(value) =>
                  setFormData({ ...formData, chatgpt_model: value })
                }
              >
                <SelectTrigger id="chatgpt_model" variant="modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatgpt_key" className="text-sm font-medium">ChatGPT Key</Label>
              <Input
                id="chatgpt_key"
                type="password"
                value={formData.chatgpt_key}
                placeholder="ChatGPT Key"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, chatgpt_key: e.target.value })
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
