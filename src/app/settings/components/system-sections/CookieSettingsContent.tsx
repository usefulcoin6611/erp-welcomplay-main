"use client"

import { useSettings } from '@/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Save } from 'lucide-react'

export function CookieSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/cookie', {
    enable_cookie: true,
    cookie_logging: true,
    cookie_title: 'We use cookies',
    cookie_description: 'We use cookies to enhance your experience.',
    strictly_cookie_title: 'Strictly Necessary Cookies',
    strictly_cookie_description: 'These cookies are essential for the website to function.',
    more_information_description: 'For more information please contact us.',
    contactus_url: '#',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium leading-none">Cookie Consent Settings</CardTitle>
          <Switch
            checked={formData.enable_cookie}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_cookie: checked })
            }
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Cookie Logging</p>
                  <p className="text-xs text-muted-foreground">Log cookie consent activities</p>
                </div>
                <Switch
                  checked={formData.cookie_logging}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, cookie_logging: checked })
                  }
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookie_title" className="text-sm font-medium">Cookie Title</Label>
                <Input
                  id="cookie_title"
                  value={formData.cookie_title}
                  placeholder="Cookie Title"
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, cookie_title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookie_description" className="text-sm font-medium">Cookie Description</Label>
                <Textarea
                  id="cookie_description"
                  value={formData.cookie_description}
                  placeholder="Cookie Description"
                  rows={3}
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, cookie_description: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strictly_cookie_title" className="text-sm font-medium">Strictly Cookie Title</Label>
                <Input
                  id="strictly_cookie_title"
                  value={formData.strictly_cookie_title}
                  placeholder="Strictly Cookie Title"
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, strictly_cookie_title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strictly_cookie_description" className="text-sm font-medium">Strictly Cookie Description</Label>
                <Textarea
                  id="strictly_cookie_description"
                  value={formData.strictly_cookie_description}
                  placeholder="Strictly Cookie Description"
                  rows={3}
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, strictly_cookie_description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="more_information_description" className="text-sm font-medium">Contact Us Description</Label>
                  <Input
                    id="more_information_description"
                    value={formData.more_information_description}
                    placeholder="Contact Us Description"
                    variant="modern"
                    onChange={(e) =>
                      setFormData({ ...formData, more_information_description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactus_url" className="text-sm font-medium">Contact Us URL</Label>
                  <Input
                    id="contactus_url"
                    value={formData.contactus_url}
                    placeholder="Contact Us URL"
                    variant="modern"
                    onChange={(e) =>
                      setFormData({ ...formData, contactus_url: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="blue" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save Cookie Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
