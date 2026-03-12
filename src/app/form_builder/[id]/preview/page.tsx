'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { IconArrowLeft } from '@tabler/icons-react'

type FormField = {
  id: string
  name: string
  type: string
  required: boolean
}

type FormPreview = {
  id: string
  name: string
  code: string
  isActive: boolean
  fields: FormField[]
}

export default function FormBuilderPreviewPage() {
  const params = useParams()
  const id = params.id as string
  const [form, setForm] = useState<FormPreview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/form-builder/${id}`)
        const json = await res.json()
        if (json?.success && json.data) {
          setForm({
            id: json.data.id,
            name: json.data.name,
            code: json.data.code,
            isActive: json.data.isActive,
            fields: json.data.fields ?? [],
          })
        }
      } catch {
        setForm(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchForm()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-muted-foreground">Loading form...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 p-4">
        <p className="text-muted-foreground">Form not found.</p>
        <Button variant="outline" asChild>
          <Link href="/form_builder">Back to Form Builder</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-lg space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="shadow-none" asChild>
            <Link href={`/form_builder/${id}`}>
              <IconArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>
        <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{form.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{form.code}</p>
            {!form.isActive && (
              <Badge variant="secondary" className="w-fit">Inactive</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Form preview (read-only). Responses are not submitted.</p>
            {form.fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">No fields defined.</p>
            ) : (
              form.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {field.name}
                    {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  {field.type === 'textarea' && (
                    <Textarea placeholder={`Enter ${field.name}`} disabled className="bg-muted" />
                  )}
                  {field.type === 'checkbox' && (
                    <Checkbox disabled />
                  )}
                  {!['textarea', 'checkbox'].includes(field.type) && (
                    <Input
                      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                      placeholder={`Enter ${field.name}`}
                      disabled
                      className="bg-muted"
                    />
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
