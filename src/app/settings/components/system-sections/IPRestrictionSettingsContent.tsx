"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function IPRestrictionSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/ip-restriction', {
    ip_restriction_enable: false,
    allowed_ips: '',
    blocked_ips: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title="IP Restriction Settings">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between rounded-md border px-4 py-3">
          <Label htmlFor="ip_restriction_enable" className="text-sm font-medium">
            Enable IP Restriction
          </Label>
          <Switch
            id="ip_restriction_enable"
            checked={formData.ip_restriction_enable}
            onCheckedChange={(checked) => setFormData({ ...formData, ip_restriction_enable: checked })}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="allowed_ips">Allowed IPs</Label>
            <Textarea
              id="allowed_ips"
              rows={4}
              value={formData.allowed_ips}
              onChange={(e) => setFormData({ ...formData, allowed_ips: e.target.value })}
              placeholder="Enter allowed IPs (comma separated)"
              variant="modern"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blocked_ips">Blocked IPs</Label>
            <Textarea
              id="blocked_ips"
              rows={4}
              value={formData.blocked_ips}
              onChange={(e) => setFormData({ ...formData, blocked_ips: e.target.value })}
              placeholder="Enter blocked IPs (comma separated)"
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
