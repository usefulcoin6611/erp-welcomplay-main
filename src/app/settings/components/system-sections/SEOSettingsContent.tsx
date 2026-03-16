"use client"

import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/use-settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Save, Eye } from 'lucide-react'

export function SEOSettingsContent() {
  const { formData, setFormData, save } = useSettings('/api/settings/seo', {
    meta_title: '',
    meta_desc: '',
    meta_image: null as string | null,
  })

  const [metaImagePreview, setMetaImagePreview] = useState('')

  useEffect(() => {
    if (formData.meta_image && typeof formData.meta_image === 'string') {
      setMetaImagePreview(formData.meta_image)
    }
  }, [formData.meta_image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMetaImagePreview(reader.result as string)
        setFormData({ ...formData, meta_image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    save()
  }

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="px-6 py-4 rounded-t-lg border-b">
        <CardTitle className="text-base font-medium leading-none">SEO Settings</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title" className="text-sm font-medium">Meta Keywords</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  placeholder="Meta Keywords"
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_desc" className="text-sm font-medium">Meta Description</Label>
                <Textarea
                  id="meta_desc"
                  value={formData.meta_desc}
                  placeholder="Meta Description"
                  rows={7}
                  variant="modern"
                  onChange={(e) =>
                    setFormData({ ...formData, meta_desc: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Meta Image</Label>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-full h-[180px] bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                    {metaImagePreview ? (
                      <img src={metaImagePreview} alt="SEO Meta" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Upload className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-xs">No image selected</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Label htmlFor="meta_image" className="cursor-pointer flex-1">
                      <div className="bg-blue-500 hover:bg-blue-600 text-white h-9 px-4 rounded-md text-sm flex items-center justify-center gap-2 transition-colors w-full">
                        <Upload className="h-4 w-4" />
                        Upload Meta Image
                      </div>
                      <Input
                        id="meta_image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </Label>
                    {metaImagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(metaImagePreview, '_blank')}
                        className="h-9 w-9"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Recommended size: 1200x630px for better visibility on social media.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="blue" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save SEO Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
