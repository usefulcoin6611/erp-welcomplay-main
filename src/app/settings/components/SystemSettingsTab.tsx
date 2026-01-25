"use client"

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Save, Upload, Mail, Palette, Layout, Sun, AlignLeft, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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

// Modern minimalist input styling
const modernInputClass = cn(
  'border-gray-200 dark:border-gray-700',
  'bg-white dark:bg-gray-900/50',
  'transition-all duration-200 ease-in-out',
  'hover:border-gray-300 dark:hover:border-gray-600',
  'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
  'focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20',
  'focus-visible:ring-offset-0',
  'shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] hover:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)] focus-visible:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)]',
  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'text-gray-900 dark:text-gray-100'
)

const modernTextareaClass = cn(
  'border-gray-200 dark:border-gray-700',
  'bg-white dark:bg-gray-900/50',
  'transition-all duration-200 ease-in-out',
  'hover:border-gray-300 dark:hover:border-gray-600',
  'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
  'focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20',
  'focus-visible:ring-offset-0',
  'shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] hover:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)] focus-visible:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)]',
  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'text-gray-900 dark:text-gray-100',
  'resize-none'
)

// Modern minimalist select styling
const modernSelectTriggerClass = cn(
  'w-full', // Full width seperti Input
  'h-9', // Height sama dengan Input
  'border-gray-200 dark:border-gray-700',
  'bg-white dark:bg-gray-900/50',
  'transition-all duration-200 ease-in-out',
  'hover:border-gray-300 dark:hover:border-gray-600',
  'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
  'focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20',
  'focus-visible:ring-offset-0',
  'shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] hover:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)] focus-visible:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)]',
  'text-gray-900 dark:text-gray-100',
  'data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500'
)

// Brand Settings Component
function BrandSettingsContent() {
  const [formData, setFormData] = useState({
    logo_dark: null as File | null,
    logo_light: null as File | null,
    favicon: null as File | null,
    title_text: 'ERPGo SaaS',
    footer_text: 'ERPGo SaaS',
    default_language: 'en',
    landing_page: true,
    enable_signup: true,
    email_verification: false,
    primary_color: '#000000',
    transparent_layout: true,
    dark_layout: false,
    rtl_layout: false,
  })

  const [logoPreview, setLogoPreview] = useState({
    logo_dark: '',
    logo_light: '',
    favicon: '',
  })

  const [existingImages, setExistingImages] = useState({
    logo_dark: '',
    logo_light: '',
    favicon: '',
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<'logo_dark' | 'logo_light' | 'favicon' | null>(null)

  const handleFileChange = (field: 'logo_dark' | 'logo_light' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, [field]: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview({ ...logoPreview, [field]: reader.result as string })
      }
      reader.readAsDataURL(file)
      // Reset file input untuk memungkinkan upload file yang sama lagi
      e.target.value = ''
    }
  }

  const openDeleteDialog = (field: 'logo_dark' | 'logo_light' | 'favicon') => {
    setFieldToDelete(field)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (fieldToDelete) {
      setFormData({ ...formData, [fieldToDelete]: null })
      setLogoPreview({ ...logoPreview, [fieldToDelete]: '' })
      setExistingImages({ ...existingImages, [fieldToDelete]: '' })
      setDeleteDialogOpen(false)
      setFieldToDelete(null)
    }
  }

  const getImageSrc = (field: 'logo_dark' | 'logo_light' | 'favicon') => {
    if (logoPreview[field]) return logoPreview[field]
    if (existingImages[field]) return existingImages[field]
    return null
  }

  const hasImage = (field: 'logo_dark' | 'logo_light' | 'favicon') => {
    return !!getImageSrc(field)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Brand settings:', formData)
    alert('Brand settings saved!')
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesian' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ]

  const colorSwatches = [
    '#22c55e', // green
    '#a855f7', // purple
    '#3b82f6', // dark blue
    '#06b6d4', // light blue
    '#ec4899', // pink
    '#14b8a6', // light cyan
    '#8b5cf6', // purple
    '#f59e0b', // yellow-brown
    '#6b7280', // dark gray
    '#000000', // black
  ]

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Brand Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Logo Dark Card */}
            <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
              <CardHeader className="px-3 py-2 rounded-t-lg">
                <CardTitle className="text-sm font-medium">Logo Dark</CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-3">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-full h-[100px] flex items-center justify-center bg-muted rounded-lg p-2">
                    {hasImage('logo_dark') ? (
                      <img id="image" src={getImageSrc('logo_dark')!} alt="Logo Dark" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <img id="image" src="/placeholder-logo.svg" alt="Logo Dark" className="max-w-full max-h-full object-contain opacity-50" />
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Label htmlFor="logo_dark" className="cursor-pointer flex-1 flex justify-center">
                      <div className={`${hasImage('logo_dark') ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-1.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full`}>
                        <Upload className="h-4 w-4" />
                        {hasImage('logo_dark') ? 'Update' : 'Choose file here'}
                      </div>
                      <Input
                        id="logo_dark"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange('logo_dark', e)}
                      />
                    </Label>
                    {hasImage('logo_dark') && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog('logo_dark')}
                        className="px-4 py-1.5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Light Card */}
            <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
              <CardHeader className="px-3 py-2 rounded-t-lg">
                <CardTitle className="text-sm font-medium">Logo Light</CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-3">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-full h-[100px] flex items-center justify-center bg-gray-900 rounded-lg p-2">
                    {hasImage('logo_light') ? (
                      <img id="image1" src={getImageSrc('logo_light')!} alt="Logo Light" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <img id="image1" src="/placeholder-logo.svg" alt="Logo Light" className="max-w-full max-h-full object-contain opacity-50" />
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Label htmlFor="logo_light" className="cursor-pointer flex-1 flex justify-center">
                      <div className={`${hasImage('logo_light') ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-1.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full`}>
                        <Upload className="h-4 w-4" />
                        {hasImage('logo_light') ? 'Update' : 'Choose file here'}
                      </div>
                      <Input
                        id="logo_light"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange('logo_light', e)}
                      />
                    </Label>
                    {hasImage('logo_light') && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog('logo_light')}
                        className="px-4 py-1.5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favicon Card */}
            <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
              <CardHeader className="px-3 py-2 rounded-t-lg">
                <CardTitle className="text-sm font-medium">Favicon</CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-3">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-[100px] h-[100px] flex items-center justify-center bg-muted rounded-lg p-2 mx-auto">
                    {hasImage('favicon') ? (
                      <img id="image2" src={getImageSrc('favicon')!} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <img id="image2" src="/placeholder-logo.svg" alt="Favicon" className="w-full h-full object-contain opacity-50" />
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Label htmlFor="favicon" className="cursor-pointer flex-1 flex justify-center">
                      <div className={`${hasImage('favicon') ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-1.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors w-full`}>
                        <Upload className="h-4 w-4" />
                        {hasImage('favicon') ? 'Update' : 'Choose file here'}
                      </div>
                      <Input
                        id="favicon"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange('favicon', e)}
                      />
                    </Label>
                    {hasImage('favicon') && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog('favicon')}
                        className="px-4 py-1.5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Title Text, Footer Text, Default Language */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_text" className="text-sm font-medium text-gray-700 dark:text-gray-300">Title Text</Label>
              <Input
                id="title_text"
                value={formData.title_text}
                placeholder="Title Text"
                className={modernInputClass}
                onChange={(e) =>
                  setFormData({ ...formData, title_text: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer_text" className="text-sm font-medium text-gray-700 dark:text-gray-300">Footer Text</Label>
              <Input
                id="footer_text"
                value={formData.footer_text}
                placeholder="Enter Footer Text"
                className={modernInputClass}
                onChange={(e) =>
                  setFormData({ ...formData, footer_text: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_language" className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Language</Label>
              <Select
                value={formData.default_language}
                onValueChange={(value) =>
                  setFormData({ ...formData, default_language: value })
                }
              >
                <SelectTrigger id="default_language" className={modernSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
              <CardHeader className="px-2 py-1.5 border-b rounded-t-lg">
                <CardTitle className="text-sm font-medium">Landing Page</CardTitle>
              </CardHeader>
              <CardContent className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="landing_page" className="text-sm">Enable Landing Page</Label>
                  <Switch
                    id="landing_page"
                    checked={formData.landing_page}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, landing_page: checked })
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
              <CardHeader className="px-2 py-1.5 border-b rounded-t-lg">
                <CardTitle className="text-sm font-medium">Enable Sign-Up Page</CardTitle>
              </CardHeader>
              <CardContent className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable_signup" className="text-sm">Enable Sign-Up Page</Label>
                  <Switch
                    id="enable_signup"
                    checked={formData.enable_signup}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, enable_signup: checked })
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
              <CardHeader className="px-2 py-1.5 border-b rounded-t-lg">
                <CardTitle className="text-sm font-medium">Email Verification</CardTitle>
              </CardHeader>
              <CardContent className="px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email_verification" className="text-sm">Email Verification</Label>
                  <Switch
                    id="email_verification"
                    checked={formData.email_verification}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, email_verification: checked })
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Theme Customizer */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Theme Customizer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Primary Color Settings */}
              <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
                <CardHeader className="px-2 py-1.5 border-b rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Primary color settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-2 py-1.5">
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {colorSwatches.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData({ ...formData, primary_color: color })}
                        className={`w-7 h-7 rounded border-2 transition-all ${
                          formData.primary_color === color
                            ? 'border-white ring-2 ring-blue-500 ring-offset-1'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded border-2 border-white ring-2 ring-blue-500 ring-offset-1"
                      style={{ backgroundColor: formData.primary_color }}
                    />
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) =>
                          setFormData({ ...formData, primary_color: e.target.value })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar Settings */}
              <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
                <CardHeader className="px-2 py-1.5 border-b rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Sidebar settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transparent_layout" className="text-sm">Transparent layout</Label>
                    <Switch
                      id="transparent_layout"
                      checked={formData.transparent_layout}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, transparent_layout: checked })
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Layout Settings */}
              <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
                <CardHeader className="px-2 py-1.5 border-b rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Layout settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark_layout" className="text-sm">Dark Layout</Label>
                    <Switch
                      id="dark_layout"
                      checked={formData.dark_layout}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, dark_layout: checked })
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Enable RTL */}
              <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
                <CardHeader className="px-2 py-1.5 border-b rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Enable RTL</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rtl_layout" className="text-sm">RTL Layout</Label>
                    <Switch
                      id="rtl_layout"
                      checked={formData.rtl_layout}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, rtl_layout: checked })
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="blue" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Image</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {fieldToDelete?.replace('_', ' ')}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

// Email Settings Component
function EmailSettingsContent() {
  const [formData, setFormData] = useState({
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
    console.log('Email settings:', formData)
    alert('Email settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Email Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          This SMTP will be used for system-level email sending. Additionally, if a company user
          does not set their SMTP, then this SMTP will be used for sending emails.
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mail_driver" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mail Driver</Label>
              <Input
                id="mail_driver"
                value={formData.mail_driver}
                placeholder="Enter Mail Driver"
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
                onChange={(e) =>
                  setFormData({ ...formData, mail_from_name: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline" className="shadow-none">
              <Mail className="mr-2 h-4 w-4" /> Send Test Mail
            </Button>
            <Button type="submit" variant="blue" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Payment Settings Component
function PaymentSettingsContent() {
  const [formData, setFormData] = useState({
    currency: 'USD',
    currency_symbol: '$',
    manually_enabled: false,
    bank_transfer_enabled: false,
    bank_details: '',
    stripe_enabled: false,
    stripe_key: '',
    stripe_secret: '',
    paypal_enabled: false,
    paypal_mode: 'sandbox',
    paypal_client_id: '',
    paypal_secret: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Payment settings:', formData)
    alert('Payment settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Payment Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          These details will be used to collect subscription plan payments. Each subscription plan
          will have a payment button based on the below configuration.
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                placeholder="Enter Currency"
                className={modernInputClass}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Note: Add currency code as per three-letter ISO code.{' '}
                <a href="https://stripe.com/docs/currencies" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  You can find out how to do that here.
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency_symbol" className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency Symbol</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol}
                placeholder="Enter Currency Symbol"
                className={modernInputClass}
                onChange={(e) =>
                  setFormData({ ...formData, currency_symbol: e.target.value })
                }
              />
            </div>
          </div>

          {/* Payment Methods Accordion */}
          <Accordion type="single" collapsible className="w-full">
            {/* Manually */}
            <AccordionItem value="manually">
              <div className="flex items-center justify-between w-full pr-4 border-b">
                <AccordionTrigger className="flex-1">
                  <span>Manually</span>
                </AccordionTrigger>
                <div className="px-4" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={formData.manually_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, manually_enabled: checked })
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    Requesting manual payment for the planned amount for the subscriptions plan.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Bank Transfer */}
            <AccordionItem value="bank_transfer">
              <div className="flex items-center justify-between w-full pr-4 border-b">
                <AccordionTrigger className="flex-1">
                  <span>Bank Transfer</span>
                </AccordionTrigger>
                <div className="px-4" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={formData.bank_transfer_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, bank_transfer_enabled: checked })
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>
              <AccordionContent>
                <div className="pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_details" className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Details</Label>
                      <Textarea
                        id="bank_details"
                        value={formData.bank_details}
                        placeholder="Enter Your Bank Details"
                        rows={4}
                        className={modernTextareaClass}
                        onChange={(e) =>
                          setFormData({ ...formData, bank_details: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Example : Bank : bank name {'</br>'} Account Number : 0000 0000 {'</br>'}
                      </p>
                    </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Stripe */}
            <AccordionItem value="stripe">
              <div className="flex items-center justify-between w-full pr-4 border-b">
                <AccordionTrigger className="flex-1">
                  <span>Stripe</span>
                </AccordionTrigger>
                <div className="px-4" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={formData.stripe_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, stripe_enabled: checked })
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe_key" className="text-sm font-medium text-gray-700 dark:text-gray-300">Stripe Key</Label>
                    <Input
                      id="stripe_key"
                      value={formData.stripe_key}
                      placeholder="Enter Stripe Key"
                      className={modernInputClass}
                      onChange={(e) =>
                        setFormData({ ...formData, stripe_key: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">Stripe Secret</Label>
                    <Input
                      id="stripe_secret"
                      type="password"
                      value={formData.stripe_secret}
                      placeholder="Enter Stripe Secret"
                      className={modernInputClass}
                      onChange={(e) =>
                        setFormData({ ...formData, stripe_secret: e.target.value })
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* PayPal */}
            <AccordionItem value="paypal">
              <div className="flex items-center justify-between w-full pr-4 border-b">
                <AccordionTrigger className="flex-1">
                  <span>PayPal</span>
                </AccordionTrigger>
                <div className="px-4" onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={formData.paypal_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, paypal_enabled: checked })
                    }
                    className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </div>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal_mode">PayPal Mode</Label>
                    <Select
                      value={formData.paypal_mode}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paypal_mode: value })
                      }
                    >
                      <SelectTrigger id="paypal_mode" className={modernSelectTriggerClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal_client_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">PayPal Client ID</Label>
                    <Input
                      id="paypal_client_id"
                      value={formData.paypal_client_id}
                      placeholder="Enter PayPal Client ID"
                      className={modernInputClass}
                      onChange={(e) =>
                        setFormData({ ...formData, paypal_client_id: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">PayPal Secret</Label>
                    <Input
                      id="paypal_secret"
                      type="password"
                      value={formData.paypal_secret}
                      placeholder="Enter PayPal Secret"
                      className={modernInputClass}
                      onChange={(e) =>
                        setFormData({ ...formData, paypal_secret: e.target.value })
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

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

// Pusher Settings Component
function PusherSettingsContent() {
  const [formData, setFormData] = useState({
    pusher_app_id: '',
    pusher_app_key: '',
    pusher_app_secret: '',
    pusher_app_cluster: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Pusher settings:', formData)
    alert('Pusher settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Pusher Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pusher_app_id" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pusher App Id</Label>
              <Input
                id="pusher_app_id"
                value={formData.pusher_app_id}
                placeholder="Pusher App Id"
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
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
                className={modernInputClass}
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

// ReCaptcha Settings Component
function ReCaptchaSettingsContent() {
  const [formData, setFormData] = useState({
    recaptcha_module: false,
    google_recaptcha_version: 'v2-checkbox',
    google_recaptcha_key: '',
    google_recaptcha_secret: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ReCaptcha settings:', formData)
    alert('ReCaptcha settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 !flex !flex-row !items-start !justify-between">
        <div>
          <CardTitle className="text-base font-medium leading-none">ReCaptcha Settings</CardTitle>
          <a
            href="https://phppot.com/php/how-to-get-google-recaptcha-site-and-secret-key/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            (How to Get Google reCaptcha Site and Secret key)
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="recaptcha_module" className="text-sm">Enable:</Label>
          <Switch
            id="recaptcha_module"
            checked={formData.recaptcha_module}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, recaptcha_module: checked })
            }
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="google_recaptcha_version">Google Recaptcha Version</Label>
              <Select
                value={formData.google_recaptcha_version}
                onValueChange={(value) =>
                  setFormData({ ...formData, google_recaptcha_version: value })
                }
              >
                <SelectTrigger id="google_recaptcha_version" className={modernSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2-checkbox">v2</SelectItem>
                  <SelectItem value="v3">v3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_recaptcha_key" className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Recaptcha Key</Label>
              <Input
                id="google_recaptcha_key"
                value={formData.google_recaptcha_key}
                placeholder="Enter Google Recaptcha Key"
                className={modernInputClass}
                onChange={(e) =>
                  setFormData({ ...formData, google_recaptcha_key: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_recaptcha_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Recaptcha Secret</Label>
              <Input
                id="google_recaptcha_secret"
                type="password"
                value={formData.google_recaptcha_secret}
                placeholder="Enter Google Recaptcha Secret"
                className={modernInputClass}
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

// Storage Settings Component
function StorageSettingsContent() {
  const [formData, setFormData] = useState({
    storage_setting: 'local',
    local_storage_validation: [] as string[],
    local_storage_max_upload_size: '',
    s3_key: '',
    s3_secret: '',
    s3_region: '',
    s3_bucket: '',
    s3_url: '',
    s3_endpoint: '',
    s3_storage_validation: [] as string[],
    s3_max_upload_size: '',
    wasabi_key: '',
    wasabi_secret: '',
    wasabi_region: '',
    wasabi_bucket: '',
    wasabi_url: '',
    wasabi_root: '',
    wasabi_storage_validation: [] as string[],
    wasabi_max_upload_size: '',
  })

  const fileTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Storage settings:', formData)
    alert('Storage settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Storage Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Storage Type Selection */}
          <div className="flex gap-2 flex-wrap">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="storage_setting"
                value="local"
                checked={formData.storage_setting === 'local'}
                onChange={(e) => setFormData({ ...formData, storage_setting: e.target.value })}
                className="sr-only peer"
              />
              <div className="px-4 py-2 border rounded-lg peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-gray-50 transition-colors">
                Local
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="storage_setting"
                value="s3"
                checked={formData.storage_setting === 's3'}
                onChange={(e) => setFormData({ ...formData, storage_setting: e.target.value })}
                className="sr-only peer"
              />
              <div className="px-4 py-2 border rounded-lg peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-gray-50 transition-colors">
                AWS S3
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="storage_setting"
                value="wasabi"
                checked={formData.storage_setting === 'wasabi'}
                onChange={(e) => setFormData({ ...formData, storage_setting: e.target.value })}
                className="sr-only peer"
              />
              <div className="px-4 py-2 border rounded-lg peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 hover:bg-gray-50 transition-colors">
                Wasabi
              </div>
            </label>
          </div>

          {/* Local Storage Settings */}
          {formData.storage_setting === 'local' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Only Upload Files</Label>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.local_storage_validation.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              local_storage_validation: [...formData.local_storage_validation, type],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              local_storage_validation: formData.local_storage_validation.filter((t) => t !== type),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="local_storage_max_upload_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max upload size (In KB)</Label>
                <Input
                  id="local_storage_max_upload_size"
                  type="number"
                  value={formData.local_storage_max_upload_size}
                  placeholder="Max upload size"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, local_storage_max_upload_size: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* S3 Storage Settings */}
          {formData.storage_setting === 's3' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="s3_key">S3 Key</Label>
                <Input
                  id="s3_key"
                  value={formData.s3_key}
                  placeholder="S3 Key"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, s3_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Secret</Label>
                <Input
                  id="s3_secret"
                  type="password"
                  value={formData.s3_secret}
                  placeholder="S3 Secret"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, s3_secret: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_region" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Region</Label>
                <Input
                  id="s3_region"
                  value={formData.s3_region}
                  placeholder="S3 Region"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, s3_region: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_bucket" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Bucket</Label>
                <Input
                  id="s3_bucket"
                  value={formData.s3_bucket}
                  placeholder="S3 Bucket"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, s3_bucket: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 URL</Label>
                <Input
                  id="s3_url"
                  value={formData.s3_url}
                  placeholder="S3 URL"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, s3_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_endpoint" className="text-sm font-medium text-gray-700 dark:text-gray-300">S3 Endpoint</Label>
                <Input
                  id="s3_endpoint"
                  value={formData.s3_endpoint}
                  placeholder="S3 Endpoint"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, s3_endpoint: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Only Upload Files</Label>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.s3_storage_validation.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              s3_storage_validation: [...formData.s3_storage_validation, type],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              s3_storage_validation: formData.s3_storage_validation.filter((t) => t !== type),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s3_max_upload_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max upload size (In KB)</Label>
                <Input
                  id="s3_max_upload_size"
                  type="number"
                  value={formData.s3_max_upload_size}
                  placeholder="Max upload size"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, s3_max_upload_size: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Wasabi Storage Settings */}
          {formData.storage_setting === 'wasabi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="wasabi_key" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Key</Label>
                <Input
                  id="wasabi_key"
                  value={formData.wasabi_key}
                  placeholder="Wasabi Key"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, wasabi_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_secret" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Secret</Label>
                <Input
                  id="wasabi_secret"
                  type="password"
                  value={formData.wasabi_secret}
                  placeholder="Wasabi Secret"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, wasabi_secret: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_region" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Region</Label>
                <Input
                  id="wasabi_region"
                  value={formData.wasabi_region}
                  placeholder="Wasabi Region"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, wasabi_region: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_bucket" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Bucket</Label>
                <Input
                  id="wasabi_bucket"
                  value={formData.wasabi_bucket}
                  placeholder="Wasabi Bucket"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, wasabi_bucket: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi URL</Label>
                <Input
                  id="wasabi_url"
                  value={formData.wasabi_url}
                  placeholder="Wasabi URL"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, wasabi_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_root" className="text-sm font-medium text-gray-700 dark:text-gray-300">Wasabi Root</Label>
                <Input
                  id="wasabi_root"
                  value={formData.wasabi_root}
                  placeholder="Wasabi Root"
                  className={modernInputClass}
                  onChange={(e) => setFormData({ ...formData, wasabi_root: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Only Upload Files</Label>
                <div className="flex flex-wrap gap-2">
                  {fileTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wasabi_storage_validation.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              wasabi_storage_validation: [...formData.wasabi_storage_validation, type],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              wasabi_storage_validation: formData.wasabi_storage_validation.filter((t) => t !== type),
                            })
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wasabi_max_upload_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Max upload size (In KB)</Label>
                <Input
                  id="wasabi_max_upload_size"
                  type="number"
                  value={formData.wasabi_max_upload_size}
                  placeholder="Max upload size"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, wasabi_max_upload_size: e.target.value })
                  }
                />
              </div>
            </div>
          )}

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

// SEO Settings Component
function SEOSettingsContent() {
  const [formData, setFormData] = useState({
    meta_title: '',
    meta_desc: '',
    meta_image: null as File | null,
  })

  const [metaImagePreview, setMetaImagePreview] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, meta_image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setMetaImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('SEO settings:', formData)
    alert('SEO settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">SEO Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keywords</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  placeholder="Meta Keywords"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_desc" className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description</Label>
                <Textarea
                  id="meta_desc"
                  value={formData.meta_desc}
                  placeholder="Meta Description"
                  rows={7}
                  className={modernTextareaClass}
                  onChange={(e) =>
                    setFormData({ ...formData, meta_desc: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meta Image</Label>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-full flex items-center justify-center bg-muted rounded-lg p-4 min-h-[200px]">
                  {metaImagePreview ? (
                    <img src={metaImagePreview} alt="Meta Image" className="max-w-full max-h-48 object-contain" />
                  ) : (
                    <img src="/placeholder.jpg" alt="Meta Image" className="max-w-full max-h-48 object-contain opacity-50" />
                  )}
                </div>
                <Label htmlFor="meta_image" className="cursor-pointer w-full flex justify-center">
                  <div className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors">
                    <Upload className="h-4 w-4" />
                    Choose file here
                  </div>
                  <Input
                    id="meta_image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
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

// Cookie Settings Component
function CookieSettingsContent() {
  const [formData, setFormData] = useState({
    enable_cookie: false,
    cookie_logging: false,
    cookie_title: '',
    cookie_description: '',
    strictly_cookie_title: '',
    strictly_cookie_description: '',
    more_information_description: '',
    contactus_url: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Cookie settings:', formData)
    alert('Cookie settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 !flex !flex-row !items-center !justify-between">
        <CardTitle className="text-base font-medium leading-none">Cookie Settings</CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor="enable_cookie" className="text-sm font-medium">Enable cookie:</Label>
          <Switch
            id="enable_cookie"
            checked={formData.enable_cookie}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enable_cookie: checked })
            }
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
        </div>
      </CardHeader>
      <CardContent className={`p-3 ${!formData.enable_cookie ? 'opacity-50 pointer-events-none' : ''}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
                <CardContent className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cookie_logging" className="text-sm">Enable logging</Label>
                    <Switch
                      id="cookie_logging"
                      checked={formData.cookie_logging}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, cookie_logging: checked })
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2">
                <Label htmlFor="cookie_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Cookie Title</Label>
                <Input
                  id="cookie_title"
                  value={formData.cookie_title}
                  placeholder="Cookie Title"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, cookie_title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookie_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Cookie Description</Label>
                <Textarea
                  id="cookie_description"
                  value={formData.cookie_description}
                  placeholder="Cookie Description"
                  rows={3}
                  className={modernTextareaClass}
                  onChange={(e) =>
                    setFormData({ ...formData, cookie_description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-4">
              <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
                <CardContent className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="necessary_cookies" className="text-sm">Strictly necessary cookies</Label>
                    <Switch
                      id="necessary_cookies"
                      checked={true}
                      disabled
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-2">
                <Label htmlFor="strictly_cookie_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Strictly Cookie Title</Label>
                <Input
                  id="strictly_cookie_title"
                  value={formData.strictly_cookie_title}
                  placeholder="Strictly Cookie Title"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, strictly_cookie_title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strictly_cookie_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Strictly Cookie Description</Label>
                <Textarea
                  id="strictly_cookie_description"
                  value={formData.strictly_cookie_description}
                  placeholder="Strictly Cookie Description"
                  rows={3}
                  className={modernTextareaClass}
                  onChange={(e) =>
                    setFormData({ ...formData, strictly_cookie_description: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t">
            <h5 className="text-sm font-medium">More Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="more_information_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Us Description</Label>
                <Input
                  id="more_information_description"
                  value={formData.more_information_description}
                  placeholder="Contact Us Description"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, more_information_description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactus_url" className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Us URL</Label>
                <Input
                  id="contactus_url"
                  value={formData.contactus_url}
                  placeholder="Contact Us URL"
                  className={modernInputClass}
                  onChange={(e) =>
                    setFormData({ ...formData, contactus_url: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            {formData.cookie_logging && (
              <Button type="button" variant="outline" className="shadow-none">
                <Save className="mr-2 h-4 w-4" /> Download cookie accepted data
              </Button>
            )}
            <Button type="submit" variant="blue" className="shadow-none ml-auto">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Cache Settings Component
function CacheSettingsContent() {
  const [cacheSize] = useState('0.00') // Mock cache size

  const handleClearCache = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Clearing cache...')
    alert('Cache cleared successfully!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Cache Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          This is a page meant for more advanced users, simply ignore it if you don't understand what cache is.
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleClearCache} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cache_size" className="text-sm font-medium text-gray-700 dark:text-gray-300">Current cache size</Label>
            <div className="flex">
              <Input
                id="cache_size"
                value={cacheSize}
                readOnly
                className={cn(modernInputClass, "rounded-r-none")}
              />
              <div className="px-4 py-2 bg-muted border border-l-0 rounded-r-lg flex items-center">
                <span className="text-sm">MB</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" variant="blue" className="shadow-none">
              Cache Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Chat GPT Settings Component
function ChatGPTSettingsContent() {
  const [formData, setFormData] = useState({
    chat_gpt_key: '',
    chat_gpt_model: '',
  })

  const aiModels = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Chat GPT settings:', formData)
    alert('Chat GPT settings saved!')
  }

  return (
    <Card className="shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg">
      <CardHeader className="p-3 rounded-t-lg">
        <CardTitle className="text-base font-medium leading-none">Chat GPT Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chat_gpt_key" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat GPT key</Label>
              <Input
                id="chat_gpt_key"
                value={formData.chat_gpt_key}
                placeholder="Enter Chat GPT API Key"
                className={modernInputClass}
                onChange={(e) =>
                  setFormData({ ...formData, chat_gpt_key: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chat_gpt_model" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat GPT Model Name</Label>
              <Select
                value={formData.chat_gpt_model}
                onValueChange={(value) =>
                  setFormData({ ...formData, chat_gpt_model: value })
                }
              >
                <SelectTrigger id="chat_gpt_model" className={modernSelectTriggerClass}>
                  <SelectValue placeholder="Select Chat GPT Model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

function SystemSettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subTabParam = searchParams.get('subtab')
  const activeSubTab = subTabParam || 'brand-settings'

  const systemMenuItems = [
    { id: 'brand-settings', label: 'Brand Settings' },
    { id: 'email-settings', label: 'Email Settings' },
    { id: 'payment-settings', label: 'Payment Settings' },
    { id: 'pusher-settings', label: 'Pusher Settings' },
    { id: 'recaptcha-settings', label: 'ReCaptcha Settings' },
    { id: 'storage-settings', label: 'Storage Settings' },
    { id: 'seo-settings', label: 'SEO Settings' },
    { id: 'cookie-settings', label: 'Cookie Settings' },
    { id: 'cache-settings', label: 'Cache Settings' },
    { id: 'chatgpt-settings', label: 'Chat GPT Settings' },
  ]

  const handleMenuClick = (itemId: string) => {
    router.push(`/settings?subtab=${itemId}`, { scroll: false })
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'brand-settings':
        return <BrandSettingsContent />
      case 'email-settings':
        return <EmailSettingsContent />
      case 'payment-settings':
        return <PaymentSettingsContent />
      case 'pusher-settings':
        return <PusherSettingsContent />
      case 'recaptcha-settings':
        return <ReCaptchaSettingsContent />
      case 'storage-settings':
        return <StorageSettingsContent />
      case 'seo-settings':
        return <SEOSettingsContent />
      case 'cookie-settings':
        return <CookieSettingsContent />
      case 'cache-settings':
        return <CacheSettingsContent />
      case 'chatgpt-settings':
        return <ChatGPTSettingsContent />
      default:
        return <BrandSettingsContent />
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      {/* Vertical Sidebar - col-xl-3 (25%) */}
      <div className="xl:col-span-3">
        <Card className="h-fit xl:sticky xl:top-6 shadow-[0_1px_1px_0_rgb(0_0_0_/_.02)] rounded-lg border-r">
          <CardContent className="p-1">
            <div className="space-y-0">
              {systemMenuItems.map((item) => {
                const isActive = activeSubTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`relative w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-300 ease-out border-0 cursor-pointer rounded-md mx-1 my-0.5 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50/80 to-transparent dark:from-blue-950/50 dark:to-transparent text-blue-700 dark:text-blue-300 font-medium border-l-2 border-blue-500 dark:border-blue-400'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <span className="relative z-10 text-blue-600 dark:text-blue-400 text-xs font-medium">→</span>
                    )}
                    {!isActive && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground text-xs">→</span>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Area - col-xl-9 (75%) */}
      <div className="xl:col-span-9 space-y-4">{renderContent()}</div>
    </div>
  )
}

export function SystemSettingsTab() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SystemSettingsContent />
    </Suspense>
  )
}
