"use client"

import { useSettings } from '@/hooks/use-settings'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { SectionCard } from './SectionCard'

export function LetterTemplateContent({ title, field }: { title: string; field: string }) {
  const { formData, setFormData, save } = useSettings('/api/settings/letter-templates', {
    offer_letter: '',
    joining_letter: '',
    experience_certificate: '',
    noc: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <SectionCard title={title}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor={`${title}-template`}>Template</Label>
          <Textarea
            id={`${title}-template`}
            rows={6}
            value={(formData as any)[field] || ''}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            placeholder="Enter template content"
            variant="modern"
          />
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
