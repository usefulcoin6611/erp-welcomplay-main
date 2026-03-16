"use client"

import { useSettings } from '@/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Save } from 'lucide-react'

export function EmailSettingsContent() {
  const { formData, setFormData, save, loading } = useSettings('/api/settings/email', {
    mail_driver: 'smtp',
    mail_host: 'smtp.gmail.com',
    mail_port: '587',
    mail_username: '',
    mail_password: '',
    mail_encryption: 'tls',
    mail_from_address: 'noreply@example.com',
    mail_from_name: 'ERP System',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  if (loading) {
    return (
      <Card className="rounded-xl shadow-none border border-border/50 bg-card overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-border/50 bg-muted/5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-border/50">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl shadow-none border border-border/50 bg-card overflow-hidden transition-all duration-200">
      <CardHeader className="px-6 py-5 border-b border-border/50 bg-muted/5">
        <CardTitle className="text-lg font-semibold tracking-tight">Email Settings</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          This SMTP will be used for system-level email sending.
        </p>
      </CardHeader>
      <CardContent className="px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mail_driver" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail Driver</Label>
              <Input
                id="mail_driver"
                value={formData.mail_driver}
                placeholder="Enter Mail Driver"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_driver: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_host" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail Host</Label>
              <Input
                id="mail_host"
                value={formData.mail_host}
                placeholder="Enter Mail Host"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_host: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_port" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail Port</Label>
              <Input
                id="mail_port"
                type="number"
                value={formData.mail_port}
                placeholder="Enter Mail Port"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_port: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_username" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail Username</Label>
              <Input
                id="mail_username"
                value={formData.mail_username}
                placeholder="Enter Mail Username"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail Password</Label>
              <Input
                id="mail_password"
                type="password"
                value={formData.mail_password}
                placeholder="Enter Mail Password"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_encryption" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail Encryption</Label>
              <Input
                id="mail_encryption"
                value={formData.mail_encryption}
                placeholder="Enter Mail Encryption"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_encryption: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_from_address" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail From Address</Label>
              <Input
                id="mail_from_address"
                type="email"
                value={formData.mail_from_address}
                placeholder="Enter Mail From Address"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_from_address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_from_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail From Name</Label>
              <Input
                id="mail_from_name"
                value={formData.mail_from_name}
                placeholder="Enter Mail From Name"
                variant="modern"
                onChange={(e) =>
                  setFormData({ ...formData, mail_from_name: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <Button type="button" variant="outline" className="h-11 px-6 rounded-xl active:scale-[0.98] transition-all">
              <Mail className="mr-2 h-4 w-4" /> Send Test Mail
            </Button>
            <Button type="submit" variant="blue" className="h-11 px-8 rounded-xl active:scale-[0.98] transition-all">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
