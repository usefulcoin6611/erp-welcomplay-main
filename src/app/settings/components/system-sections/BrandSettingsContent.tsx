"use client"

import { useState, useEffect } from 'react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Upload, Trash2, Palette, Layout, Sun, AlignLeft, Save, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export function BrandSettingsContent() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'

  const { formData, setFormData, save, loading } = useSettings('/api/settings/brand', {
    logo_dark: '',
    logo_light: '',
    favicon: '',
    title_text: '',
    footer_text: '',
    default_language: 'en',
    landing_page: true,
    enable_signup: true,
    email_verification: false,
    primary_color: '#000000',
    transparent_layout: true,
    dark_layout: false,
    rtl_layout: false,
    enable_coupon: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<{ [key: string]: string }>({
    logo_dark: '',
    logo_light: '',
    favicon: '',
  })
  const [pendingFiles, setPendingFiles] = useState<{ [key: string]: File | null }>({
    logo_dark: null,
    logo_light: null,
    favicon: null,
  })

  // Sync previews on initial load and when formData changes from server
  useEffect(() => {
    if (!loading) {
      setLogoPreview({
        logo_dark: (formData.logo_dark as string) || '',
        logo_light: (formData.logo_light as string) || '',
        favicon: (formData.favicon as string) || '',
      })
    }
  }, [loading, formData.logo_dark, formData.logo_light, formData.favicon])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<'logo_dark' | 'logo_light' | 'favicon' | null>(null)

  const handleFileChange = (field: 'logo_dark' | 'logo_light' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB')
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(prev => ({ ...prev, [field]: previewUrl }))
      setPendingFiles(prev => ({ ...prev, [field]: file }))
      e.target.value = ''
    }
  }

  const openDeleteDialog = (field: 'logo_dark' | 'logo_light' | 'favicon') => {
    setFieldToDelete(field)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (fieldToDelete) {
      setFormData(prev => ({ ...prev, [fieldToDelete]: '' }))
      setLogoPreview(prev => ({ ...prev, [fieldToDelete]: '' }))
      setPendingFiles(prev => ({ ...prev, [fieldToDelete]: null }))
      setDeleteDialogOpen(false)
      setFieldToDelete(null)
    }
  }

  const uploadToBlob = async (file: File) => {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      body: file,
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Upload failed')
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updatedData = { ...formData }

      // Upload pending files first
      for (const field of ['logo_dark', 'logo_light', 'favicon'] as const) {
        if (pendingFiles[field]) {
          const url = await uploadToBlob(pendingFiles[field]!)
          updatedData[field] = url
        }
      }

      const result = await save(updatedData)
      if (result) {
        setPendingFiles({ logo_dark: null, logo_light: null, favicon: null })
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to upload images or save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesian' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ]

  const colorSwatches = [
    '#22c55e', '#a855f7', '#3b82f6', '#06b6d4', '#ec4899',
    '#14b8a6', '#8b5cf6', '#f59e0b', '#6b7280', '#000000'
  ]

  if (loading) {
    return (
      <Card className="rounded-xl shadow-none border border-border/50 bg-card overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-border/50 bg-muted/5">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl shadow-none border border-border/50 bg-card overflow-hidden transition-all duration-200">
      <CardHeader className="px-6 py-5 border-b border-border/50 bg-muted/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold tracking-tight">Brand Settings</CardTitle>
            <p className="text-sm text-muted-foreground">Manage your company branding and appearance</p>
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-blue-500 font-medium">
              <Spinner className="size-4" />
              <span>Saving changes...</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo Dark Card */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Logo Dark
              </Label>
              <Card className="group relative rounded-xl border-dashed bg-muted/20 hover:bg-muted/30 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full h-32 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-inner overflow-hidden border">
                      {logoPreview.logo_dark ? (
                        <img src={logoPreview.logo_dark} alt="Logo Dark" className="max-w-[80%] max-h-[80%] object-contain transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                          <Upload className="h-8 w-8" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full">
                      <Label htmlFor="logo_dark" className="cursor-pointer flex-1">
                        <div className="bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all font-medium">
                          <Upload className="h-4 w-4" />
                          {logoPreview.logo_dark ? 'Change' : 'Upload'}
                        </div>
                        <Input
                          id="logo_dark"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange('logo_dark', e)}
                        />
                      </Label>
                      {logoPreview.logo_dark && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog('logo_dark')}
                          className="rounded-lg active:scale-[0.98] transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-[11px] text-muted-foreground text-center">Recommended size: 200x50px</p>
            </div>

            {/* Logo Light Card */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Logo Light
              </Label>
              <Card className="group relative rounded-xl border-dashed bg-muted/20 hover:bg-muted/30 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full h-32 flex items-center justify-center bg-gray-950 rounded-lg shadow-inner overflow-hidden border border-white/10">
                      {logoPreview.logo_light ? (
                        <img src={logoPreview.logo_light} alt="Logo Light" className="max-w-[80%] max-h-[80%] object-contain transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/20">
                          <Upload className="h-8 w-8" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full">
                      <Label htmlFor="logo_light" className="cursor-pointer flex-1">
                        <div className="bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all font-medium shadow-sm shadow-blue-500/20">
                          <Upload className="h-4 w-4" />
                          {logoPreview.logo_light ? 'Change' : 'Upload'}
                        </div>
                        <Input
                          id="logo_light"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange('logo_light', e)}
                        />
                      </Label>
                      {logoPreview.logo_light && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog('logo_light')}
                          className="rounded-lg shadow-sm shadow-destructive/20 active:scale-[0.98] transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-[11px] text-muted-foreground text-center">For dark backgrounds</p>
            </div>

            {/* Favicon Card */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Favicon
              </Label>
              <Card className="group relative rounded-xl border-dashed bg-muted/20 hover:bg-muted/30 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full h-32 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-inner overflow-hidden border">
                      {logoPreview.favicon ? (
                        <img src={logoPreview.favicon} alt="Favicon" className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                          <Upload className="h-8 w-8" />
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full">
                      <Label htmlFor="favicon" className="cursor-pointer flex-1 text-center">
                        <div className="bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all font-medium shadow-sm shadow-blue-500/20">
                          <Upload className="h-4 w-4" />
                          {logoPreview.favicon ? 'Change' : 'Upload'}
                        </div>
                        <Input
                          id="favicon"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange('favicon', e)}
                        />
                      </Label>
                      {logoPreview.favicon && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog('favicon')}
                          className="rounded-lg shadow-sm shadow-destructive/20 active:scale-[0.98] transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-[11px] text-muted-foreground text-center">Square icon (e.g. 32x32px)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2.5">
              <Label htmlFor="title_text" className="text-sm font-semibold tracking-tight text-foreground/80">Title Text</Label>
              <Input
                id="title_text"
                value={formData.title_text ?? ''}
                placeholder="Welcom ERP"
                variant="modern"
                className="rounded-xl border-muted-foreground/20"
                onChange={(e) =>
                  setFormData({ ...formData, title_text: e.target.value })
                }
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="footer_text" className="text-sm font-semibold tracking-tight text-foreground/80">Footer Text</Label>
              <Input
                id="footer_text"
                value={formData.footer_text ?? ''}
                placeholder="© 2026 Welcom ERP"
                variant="modern"
                className="rounded-xl border-muted-foreground/20"
                onChange={(e) =>
                  setFormData({ ...formData, footer_text: e.target.value })
                }
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="default_language" className="text-sm font-semibold tracking-tight text-foreground/80">Default Language</Label>
              <Select
                value={formData.default_language}
                onValueChange={(value) =>
                  setFormData({ ...formData, default_language: value })
                }
              >
                <SelectTrigger id="default_language" variant="modern" className="rounded-xl border-muted-foreground/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-xl border-none bg-muted/30 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="landing_page" className="text-sm font-semibold text-foreground/90">Landing Page</Label>
                      <p className="text-[11px] text-muted-foreground">Toggle public landing page</p>
                    </div>
                    <Switch
                      id="landing_page"
                      checked={formData.landing_page}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, landing_page: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-none bg-muted/30 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable_signup" className="text-sm font-semibold text-foreground/90">Registration</Label>
                      <p className="text-[11px] text-muted-foreground">Allow new user sign-ups</p>
                    </div>
                    <Switch
                      id="enable_signup"
                      checked={formData.enable_signup}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, enable_signup: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-none bg-muted/30 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_verification" className="text-sm font-semibold text-foreground/90">Verification</Label>
                      <p className="text-[11px] text-muted-foreground">Require email check</p>
                    </div>
                    <Switch
                      id="email_verification"
                      checked={formData.email_verification}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, email_verification: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-none bg-muted/30 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable_coupon" className="text-sm font-semibold text-foreground/90">Coupon System</Label>
                      <p className="text-[11px] text-muted-foreground">Toggle coupon feature</p>
                    </div>
                    <Switch
                      id="enable_coupon"
                      checked={formData.enable_coupon}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, enable_coupon: checked })
                      }
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-6 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Palette className="h-4 w-4 text-blue-500" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Theme Customizer</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                  Primary Color Settings
                  <div className="w-4 h-4 rounded shadow-sm border" style={{ backgroundColor: formData.primary_color }} />
                </Label>
                <div className="grid grid-cols-5 gap-2.5">
                  {colorSwatches.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, primary_color: color })}
                      className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 active:scale-90 ${formData.primary_color === color
                        ? 'border-white ring-2 ring-blue-500 ring-offset-2'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-sm border shadow-sm" style={{ backgroundColor: formData.primary_color }} />
                  <Input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="h-9 truncate pl-9 text-xs font-mono rounded-lg border-muted-foreground/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Layout className="h-3.5 w-3.5" /> Sidebar
                </Label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-muted-foreground/10">
                  <span className="text-sm">Transparent</span>
                  <Switch
                    checked={formData.transparent_layout}
                    onCheckedChange={(c) => setFormData({ ...formData, transparent_layout: c })}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <Sun className="h-3.5 w-3.5" /> Display
                </Label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-muted-foreground/10">
                  <span className="text-sm">Dark Mode</span>
                  <Switch
                    checked={formData.dark_layout}
                    onCheckedChange={(c) => setFormData({ ...formData, dark_layout: c })}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <AlignLeft className="h-3.5 w-3.5" /> RTL Support
                </Label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-muted-foreground/10">
                  <span className="text-sm">Right-to-Left</span>
                  <Switch
                    checked={formData.rtl_layout}
                    onCheckedChange={(c) => setFormData({ ...formData, rtl_layout: c })}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="blue"
              className="h-11 px-8 rounded-xl active:scale-[0.98] transition-all duration-200"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Remove Asset</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Are you sure you want to remove the {fieldToDelete?.replace('_', ' ')}?
                This will revert to the default placeholder until you upload a new one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600 rounded-xl">
                Remove Asset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
