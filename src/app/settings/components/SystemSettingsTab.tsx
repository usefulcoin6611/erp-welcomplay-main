"use client"

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Save, Upload, Mail } from 'lucide-react'
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

// Brand Settings Component
function BrandSettingsContent() {
  const [formData, setFormData] = useState({
    logo_dark: null as File | null,
    logo_light: null as File | null,
    favicon: null as File | null,
    site_name: 'ERP System',
    site_title: 'ERP Management System',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Brand settings:', formData)
    alert('Brand settings saved!')
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Brand Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {/* Logo Dark */}
            <div className="space-y-3">
              <Label>Logo Dark</Label>
              <div className="border rounded-lg p-4 flex flex-col items-center justify-center aspect-square">
                <div className="w-full h-24 bg-muted rounded flex items-center justify-center mb-3">
                  <span className="text-xs text-muted-foreground">Logo Preview</span>
                </div>
                <Label htmlFor="logo_dark" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Choose file
                  </div>
                  <Input
                    id="logo_dark"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logo_dark: e.target.files?.[0] || null,
                      })
                    }
                  />
                </Label>
              </div>
            </div>

            {/* Logo Light */}
            <div className="space-y-3">
              <Label>Logo Light</Label>
              <div className="border rounded-lg p-4 flex flex-col items-center justify-center aspect-square">
                <div className="w-full h-24 bg-muted rounded flex items-center justify-center mb-3">
                  <span className="text-xs text-muted-foreground">Logo Preview</span>
                </div>
                <Label htmlFor="logo_light" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Choose file
                  </div>
                  <Input
                    id="logo_light"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        logo_light: e.target.files?.[0] || null,
                      })
                    }
                  />
                </Label>
              </div>
            </div>

            {/* Favicon */}
            <div className="space-y-3">
              <Label>Favicon</Label>
              <div className="border rounded-lg p-4 flex flex-col items-center justify-center aspect-square">
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center mb-3">
                  <span className="text-xs text-muted-foreground">Icon</span>
                </div>
                <Label htmlFor="favicon" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Choose file
                  </div>
                  <Input
                    id="favicon"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        favicon: e.target.files?.[0] || null,
                      })
                    }
                  />
                </Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) =>
                  setFormData({ ...formData, site_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title</Label>
              <Input
                id="site_title"
                value={formData.site_title}
                onChange={(e) =>
                  setFormData({ ...formData, site_title: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
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
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          This SMTP will be used for system-level email sending. Additionally, if a company user
          does not set their SMTP, then this SMTP will be used for sending emails.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mail_driver">Mail Driver</Label>
              <Select
                value={formData.mail_driver}
                onValueChange={(value) =>
                  setFormData({ ...formData, mail_driver: value })
                }
              >
                <SelectTrigger id="mail_driver">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="sendmail">Sendmail</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                  <SelectItem value="ses">Amazon SES</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_host">Mail Host</Label>
              <Input
                id="mail_host"
                value={formData.mail_host}
                onChange={(e) =>
                  setFormData({ ...formData, mail_host: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_port">Mail Port</Label>
              <Input
                id="mail_port"
                type="number"
                value={formData.mail_port}
                onChange={(e) =>
                  setFormData({ ...formData, mail_port: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_encryption">Encryption</Label>
              <Select
                value={formData.mail_encryption || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, mail_encryption: value === 'none' ? '' : value })
                }
              >
                <SelectTrigger id="mail_encryption">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_username">Mail Username</Label>
              <Input
                id="mail_username"
                value={formData.mail_username}
                onChange={(e) =>
                  setFormData({ ...formData, mail_username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_password">Mail Password</Label>
              <Input
                id="mail_password"
                type="password"
                value={formData.mail_password}
                onChange={(e) =>
                  setFormData({ ...formData, mail_password: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_from_address">From Address</Label>
              <Input
                id="mail_from_address"
                type="email"
                value={formData.mail_from_address}
                onChange={(e) =>
                  setFormData({ ...formData, mail_from_address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail_from_name">From Name</Label>
              <Input
                id="mail_from_name"
                value={formData.mail_from_name}
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
            <Button type="submit" className="shadow-none">
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
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          These details will be used to collect subscription plan payments. Each subscription plan
          will have a payment button based on the below configuration.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Note: Add currency code as per three-letter ISO code
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency_symbol">Currency Symbol</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol}
                onChange={(e) =>
                  setFormData({ ...formData, currency_symbol: e.target.value })
                }
              />
            </div>
          </div>

          {/* Stripe */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="stripe">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <span>Stripe</span>
                  <Switch
                    checked={formData.stripe_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, stripe_enabled: checked })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe_key">Stripe Key</Label>
                    <Input
                      id="stripe_key"
                      value={formData.stripe_key}
                      onChange={(e) =>
                        setFormData({ ...formData, stripe_key: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe_secret">Stripe Secret</Label>
                    <Input
                      id="stripe_secret"
                      type="password"
                      value={formData.stripe_secret}
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
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <span>PayPal</span>
                  <Switch
                    checked={formData.paypal_enabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, paypal_enabled: checked })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypal_mode">PayPal Mode</Label>
                    <Select
                      value={formData.paypal_mode}
                      onValueChange={(value) =>
                        setFormData({ ...formData, paypal_mode: value })
                      }
                    >
                      <SelectTrigger id="paypal_mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="live">Live</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal_client_id">PayPal Client ID</Label>
                    <Input
                      id="paypal_client_id"
                      value={formData.paypal_client_id}
                      onChange={(e) =>
                        setFormData({ ...formData, paypal_client_id: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypal_secret">PayPal Secret</Label>
                    <Input
                      id="paypal_secret"
                      type="password"
                      value={formData.paypal_secret}
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
            <Button type="submit" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Company Settings Component (simplified)
function CompanySettingsContent() {
  const [formData, setFormData] = useState({
    company_name: 'PT Maju Jaya',
    company_email: 'info@majujaya.com',
    company_address: '',
  })

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={formData.company_name}
                onChange={(e) =>
                  setFormData({ ...formData, company_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Company Email</Label>
              <Input
                type="email"
                value={formData.company_email}
                onChange={(e) =>
                  setFormData({ ...formData, company_email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Company Address</Label>
            <Textarea
              value={formData.company_address}
              onChange={(e) =>
                setFormData({ ...formData, company_address: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="shadow-none">
              <Save className="mr-2 h-4 w-4" /> Save
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
    { id: 'company-settings', label: 'Company Settings' },
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
    const currentTab = searchParams.get('tab') || 'system-settings'
    router.push(`/settings?tab=${currentTab}&subtab=${itemId}`, { scroll: false })
  }

  const renderContent = () => {
    switch (activeSubTab) {
      case 'brand-settings':
        return <BrandSettingsContent />
      case 'company-settings':
        return <CompanySettingsContent />
      case 'email-settings':
        return <EmailSettingsContent />
      case 'payment-settings':
        return <PaymentSettingsContent />
      case 'pusher-settings':
        return (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Pusher Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Pusher settings configuration</p>
            </CardContent>
          </Card>
        )
      case 'recaptcha-settings':
        return (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>ReCaptcha Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">ReCaptcha settings configuration</p>
            </CardContent>
          </Card>
        )
      case 'storage-settings':
        return (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Storage settings configuration</p>
            </CardContent>
          </Card>
        )
      case 'seo-settings':
        return (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">SEO settings configuration</p>
            </CardContent>
          </Card>
        )
      case 'cookie-settings':
        return (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Cookie Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Cookie settings configuration</p>
            </CardContent>
          </Card>
        )
      case 'cache-settings':
        return (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Cache Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Cache settings configuration</p>
            </CardContent>
          </Card>
        )
      case 'chatgpt-settings':
        return (
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Chat GPT Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Chat GPT settings configuration</p>
            </CardContent>
          </Card>
        )
      default:
        return <BrandSettingsContent />
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      {/* Vertical Sidebar - col-xl-3 (25%) */}
      <div className="xl:col-span-3">
        <Card className="h-fit xl:sticky xl:top-6 shadow-none border-r">
          <CardContent className="p-0">
            <div className="space-y-0">
              {systemMenuItems.map((item) => {
                const isActive = activeSubTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-0 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="text-blue-600 dark:text-blue-400">→</span>}
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
