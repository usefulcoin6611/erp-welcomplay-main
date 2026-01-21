"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Save, Upload, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

// Types
interface LandingPageSettings {
  // Topbar & Navbar
  topbar_enabled: boolean
  topbar_message: string
  navbar_enabled: boolean

  // Header/Hero Section
  header_title: string
  header_subtitle: string
  header_description: string
  header_button_text: string
  header_button_link: string
  header_image: string | null
  
  // Features Section
  features_enabled: boolean
  features_title: string
  features_subtitle: string
  features: Array<{
    id: string
    title: string
    description: string
    icon: string
  }>
  
  // Pricing Section
  pricing_enabled: boolean
  pricing_title: string
  pricing_subtitle: string
  
  // Testimonials Section
  testimonials_enabled: boolean
  testimonials_title: string
  testimonials: Array<{
    id: string
    name: string
    position: string
    company: string
    content: string
    avatar: string | null
  }>
  
  // Footer Section
  footer_enabled: boolean
  footer_copyright: string
  footer_links: Array<{
    id: string
    title: string
    url: string
  }>

  // Discover Section
  discover_enabled: boolean
  discover_heading: string
  discover_description: string
  discover_live_demo_link: string
  discover_buy_now_link: string

  // Screenshots Section
  screenshots_enabled: boolean
  screenshots_title: string
  screenshots_heading: string
  screenshots_description: string

  // FAQ Section
  faq_enabled: boolean
  faq_title: string
  faq_heading: string
  faq_description: string

  // Join Us Section
  joinus_enabled: boolean
  joinus_heading: string
  joinus_description: string

  // SEO Settings
  meta_title: string
  meta_description: string
  meta_keywords: string
}

// Mock data
const initialSettings: LandingPageSettings = {
  topbar_enabled: true,
  topbar_message: 'Big update! New features released for ERPGo SaaS.',
  navbar_enabled: true,

  header_title: 'Best Ultimate Accounts & CRM Software System',
  header_subtitle: 'Powerful ERP solution for modern businesses',
  header_description:
    'Manage accounting, CRM, HRM, projects, POS, and more in a single, integrated platform. Designed for growing teams who need flexibility and control.',
  header_button_text: 'Get Started',
  header_button_link: '/register',
  header_image: null,
  
  features_enabled: true,
  features_title: 'Why Choose Us',
  features_subtitle: 'Discover the features that make us stand out',
  features: [
    {
      id: '1',
      title: 'Easy to Use',
      description: 'Intuitive interface designed for users of all levels',
      icon: '🎯',
    },
    {
      id: '2',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security to protect your data',
      icon: '🔒',
    },
    {
      id: '3',
      title: '24/7 Support',
      description: 'Round-the-clock assistance whenever you need it',
      icon: '💬',
    },
    {
      id: '4',
      title: 'Scalable',
      description: 'Grows with your business needs',
      icon: '📈',
    },
  ],
  
  pricing_enabled: true,
  pricing_title: 'Choose Your Plan',
  pricing_subtitle: 'Select the perfect plan for your business',
  
  testimonials_enabled: true,
  testimonials_title: 'What Our Customers Say',
  testimonials: [
    {
      id: '1',
      name: 'John Doe',
      position: 'CEO',
      company: 'Tech Corp',
      content: 'This ERP system has transformed how we manage our business operations.',
      avatar: null,
    },
    {
      id: '2',
      name: 'Jane Smith',
      position: 'CFO',
      company: 'Finance Inc',
      content: 'The best investment we made for our company. Highly recommended!',
      avatar: null,
    },
  ],
  
  footer_enabled: true,
  footer_copyright: '© 2024 ERP System. All rights reserved.',
  footer_links: [
    { id: '1', title: 'About Us', url: '/about' },
    { id: '2', title: 'Contact', url: '/contact' },
    { id: '3', title: 'Privacy Policy', url: '/privacy' },
    { id: '4', title: 'Terms of Service', url: '/terms' },
  ],

  discover_enabled: true,
  discover_heading: 'Discover powerful modules built for every department',
  discover_description:
    'From finance to HR to sales, ERPGo SaaS includes everything you need to run your business in one place.',
  discover_live_demo_link: '#',
  discover_buy_now_link: '#',

  screenshots_enabled: true,
  screenshots_title: 'SCREENSHOTS',
  screenshots_heading: 'Beautiful and intuitive dashboards',
  screenshots_description:
    'Explore how ERPGo SaaS presents complex data in simple, easy-to-understand views.',

  faq_enabled: true,
  faq_title: 'FAQ',
  faq_heading: 'Frequently asked questions',
  faq_description:
    'Got questions? We’ve compiled answers to the most common questions about ERPGo SaaS.',

  joinus_enabled: true,
  joinus_heading: 'Join our newsletter',
  joinus_description: 'Get product updates, tips, and best practices directly to your inbox.',

  meta_title: 'ERPGo SaaS - Landing Page',
  meta_description: 'Modern ERP landing page showcasing features, plans, FAQs, and testimonials.',
  meta_keywords: 'ERP, ERPGo SaaS, accounting, CRM, HRM, project, POS',
}

export default function LandingPagePage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  
  const [settings, setSettings] = useState<LandingPageSettings>(initialSettings)
  const [previewMode, setPreviewMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Landing page settings:', settings)
    alert('Landing page settings saved successfully!')
  }

  const handleAddFeature = () => {
    const newFeature = {
      id: Date.now().toString(),
      title: '',
      description: '',
      icon: '⭐',
    }
    setSettings({
      ...settings,
      features: [...settings.features, newFeature],
    })
  }

  const handleRemoveFeature = (id: string) => {
    setSettings({
      ...settings,
      features: settings.features.filter((f) => f.id !== id),
    })
  }

  const handleUpdateFeature = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      features: settings.features.map((f) =>
        f.id === id ? { ...f, [field]: value } : f
      ),
    })
  }

  const handleAddTestimonial = () => {
    const newTestimonial = {
      id: Date.now().toString(),
      name: '',
      position: '',
      company: '',
      content: '',
      avatar: null,
    }
    setSettings({
      ...settings,
      testimonials: [...settings.testimonials, newTestimonial],
    })
  }

  const handleRemoveTestimonial = (id: string) => {
    setSettings({
      ...settings,
      testimonials: settings.testimonials.filter((t) => t.id !== id),
    })
  }

  const handleUpdateTestimonial = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      testimonials: settings.testimonials.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    })
  }

  const handleAddFooterLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: '',
      url: '',
    }
    setSettings({
      ...settings,
      footer_links: [...settings.footer_links, newLink],
    })
  }

  const handleRemoveFooterLink = (id: string) => {
    setSettings({
      ...settings,
      footer_links: settings.footer_links.filter((l) => l.id !== id),
    })
  }

  const handleUpdateFooterLink = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      footer_links: settings.footer_links.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    })
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Landing Page Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Konfigurasi konten landing page ERPGo SaaS (hero, fitur, plan, FAQ, testimonial, footer).
                </p>
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="shadow-none"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {previewMode ? 'Edit Mode' : 'Preview Hero'}
                  </Button>
                </div>
              )}
            </div>

            {previewMode ? (
              <Card className="shadow-none">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <h2 className="text-3xl font-bold mb-4">{settings.header_title}</h2>
                    <p className="text-xl text-muted-foreground mb-2">{settings.header_subtitle}</p>
                    <p className="text-muted-foreground mb-6">{settings.header_description}</p>
                    <Button variant="blue" className="shadow-none">
                      {settings.header_button_text}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Topbar & Navbar */}
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      Topbar & Navbar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 max-w-xl">
                        <Label htmlFor="topbar_message">Topbar Notification Message</Label>
                        <Textarea
                          id="topbar_message"
                          value={settings.topbar_message}
                          onChange={(e) =>
                            setSettings({ ...settings, topbar_message: e.target.value })
                          }
                          rows={2}
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="topbar_enabled">Show Topbar</Label>
                          <Switch
                            id="topbar_enabled"
                            checked={settings.topbar_enabled}
                            onCheckedChange={(checked) =>
                              setSettings({ ...settings, topbar_enabled: checked })
                            }
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="navbar_enabled">Show Navbar</Label>
                          <Switch
                            id="navbar_enabled"
                            checked={settings.navbar_enabled}
                            onCheckedChange={(checked) =>
                              setSettings({ ...settings, navbar_enabled: checked })
                            }
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Header/Hero Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      Header / Hero Section
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="header_title">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="header_title"
                          value={settings.header_title}
                          onChange={(e) =>
                            setSettings({ ...settings, header_title: e.target.value })
                          }
                          required
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="header_subtitle">Subtitle</Label>
                        <Input
                          id="header_subtitle"
                          value={settings.header_subtitle}
                          onChange={(e) =>
                            setSettings({ ...settings, header_subtitle: e.target.value })
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="header_description">Description</Label>
                      <Textarea
                        id="header_description"
                        value={settings.header_description}
                        onChange={(e) =>
                          setSettings({ ...settings, header_description: e.target.value })
                        }
                        rows={3}
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="header_button_text">Button Text</Label>
                        <Input
                          id="header_button_text"
                          value={settings.header_button_text}
                          onChange={(e) =>
                            setSettings({ ...settings, header_button_text: e.target.value })
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="header_button_link">Button Link</Label>
                        <Input
                          id="header_button_link"
                          value={settings.header_button_link}
                          onChange={(e) =>
                            setSettings({ ...settings, header_button_link: e.target.value })
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="header_image">Header Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="header_image"
                          type="file"
                          accept="image/*"
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                        <Button type="button" variant="outline" size="sm" className="shadow-none">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Features Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="features_enabled">Enable</Label>
                        <Switch
                          id="features_enabled"
                          checked={settings.features_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, features_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.features_enabled && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="features_title">Title</Label>
                          <Input
                            id="features_title"
                            value={settings.features_title}
                            onChange={(e) =>
                              setSettings({ ...settings, features_title: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="features_subtitle">Subtitle</Label>
                          <Input
                            id="features_subtitle"
                            value={settings.features_subtitle}
                            onChange={(e) =>
                              setSettings({ ...settings, features_subtitle: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Features List</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddFeature}
                            className="shadow-none"
                          >
                            Add Feature
                          </Button>
                        </div>
                        {settings.features.map((feature, index) => (
                          <div
                            key={feature.id}
                            className="p-4 border rounded-md space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Feature {index + 1}</span>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFeature(feature.id)}
                                className="shadow-none"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Icon</Label>
                                <Input
                                  value={feature.icon}
                                  onChange={(e) =>
                                    handleUpdateFeature(feature.id, 'icon', e.target.value)
                                  }
                                  placeholder="🎯"
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                  value={feature.title}
                                  onChange={(e) =>
                                    handleUpdateFeature(feature.id, 'title', e.target.value)
                                  }
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={feature.description}
                                onChange={(e) =>
                                  handleUpdateFeature(feature.id, 'description', e.target.value)
                                }
                                rows={2}
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Pricing Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Pricing Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="pricing_enabled">Enable</Label>
                        <Switch
                          id="pricing_enabled"
                          checked={settings.pricing_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, pricing_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.pricing_enabled && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pricing_title">Title</Label>
                          <Input
                            id="pricing_title"
                            value={settings.pricing_title}
                            onChange={(e) =>
                              setSettings({ ...settings, pricing_title: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pricing_subtitle">Subtitle</Label>
                          <Input
                            id="pricing_subtitle"
                            value={settings.pricing_subtitle}
                            onChange={(e) =>
                              setSettings({ ...settings, pricing_subtitle: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pricing plans will be automatically pulled from your subscription plans.
                      </p>
                    </CardContent>
                  )}
                </Card>

                {/* Testimonials Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Testimonials Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="testimonials_enabled">Enable</Label>
                        <Switch
                          id="testimonials_enabled"
                          checked={settings.testimonials_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, testimonials_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.testimonials_enabled && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="testimonials_title">Title</Label>
                        <Input
                          id="testimonials_title"
                          value={settings.testimonials_title}
                          onChange={(e) =>
                            setSettings({ ...settings, testimonials_title: e.target.value })
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Testimonials List</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddTestimonial}
                            className="shadow-none"
                          >
                            Add Testimonial
                          </Button>
                        </div>
                        {settings.testimonials.map((testimonial, index) => (
                          <div
                            key={testimonial.id}
                            className="p-4 border rounded-md space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Testimonial {index + 1}</span>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveTestimonial(testimonial.id)}
                                className="shadow-none"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={testimonial.name}
                                  onChange={(e) =>
                                    handleUpdateTestimonial(testimonial.id, 'name', e.target.value)
                                  }
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Position</Label>
                                <Input
                                  value={testimonial.position}
                                  onChange={(e) =>
                                    handleUpdateTestimonial(testimonial.id, 'position', e.target.value)
                                  }
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Company</Label>
                                <Input
                                  value={testimonial.company}
                                  onChange={(e) =>
                                    handleUpdateTestimonial(testimonial.id, 'company', e.target.value)
                                  }
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Content</Label>
                              <Textarea
                                value={testimonial.content}
                                onChange={(e) =>
                                  handleUpdateTestimonial(testimonial.id, 'content', e.target.value)
                                }
                                rows={3}
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Footer Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Footer Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="footer_enabled">Enable</Label>
                        <Switch
                          id="footer_enabled"
                          checked={settings.footer_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, footer_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.footer_enabled && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="footer_copyright">Copyright Text</Label>
                        <Input
                          id="footer_copyright"
                          value={settings.footer_copyright}
                          onChange={(e) =>
                            setSettings({ ...settings, footer_copyright: e.target.value })
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Footer Links</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddFooterLink}
                            className="shadow-none"
                          >
                            Add Link
                          </Button>
                        </div>
                        {settings.footer_links.map((link, index) => (
                          <div
                            key={link.id}
                            className="p-4 border rounded-md space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Link {index + 1}</span>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFooterLink(link.id)}
                                className="shadow-none"
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                  value={link.title}
                                  onChange={(e) =>
                                    handleUpdateFooterLink(link.id, 'title', e.target.value)
                                  }
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>URL</Label>
                                <Input
                                  value={link.url}
                                  onChange={(e) =>
                                    handleUpdateFooterLink(link.id, 'url', e.target.value)
                                  }
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Discover Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Discover Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="discover_enabled">Enable</Label>
                        <Switch
                          id="discover_enabled"
                          checked={settings.discover_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, discover_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.discover_enabled && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="discover_heading">Heading</Label>
                        <Input
                          id="discover_heading"
                          value={settings.discover_heading}
                          onChange={(e) =>
                            setSettings({ ...settings, discover_heading: e.target.value })
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discover_description">Description</Label>
                        <Textarea
                          id="discover_description"
                          value={settings.discover_description}
                          onChange={(e) =>
                            setSettings({ ...settings, discover_description: e.target.value })
                          }
                          rows={3}
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="discover_live_demo_link">Live Demo Link</Label>
                          <Input
                            id="discover_live_demo_link"
                            value={settings.discover_live_demo_link}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                discover_live_demo_link: e.target.value,
                              })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discover_buy_now_link">Buy Now Link</Label>
                          <Input
                            id="discover_buy_now_link"
                            value={settings.discover_buy_now_link}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                discover_buy_now_link: e.target.value,
                              })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Screenshots Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Screenshots Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="screenshots_enabled">Enable</Label>
                        <Switch
                          id="screenshots_enabled"
                          checked={settings.screenshots_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, screenshots_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.screenshots_enabled && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="screenshots_title">Section Label</Label>
                          <Input
                            id="screenshots_title"
                            value={settings.screenshots_title}
                            onChange={(e) =>
                              setSettings({ ...settings, screenshots_title: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="screenshots_heading">Heading</Label>
                          <Input
                            id="screenshots_heading"
                            value={settings.screenshots_heading}
                            onChange={(e) =>
                              setSettings({ ...settings, screenshots_heading: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="screenshots_description">Description</Label>
                        <Textarea
                          id="screenshots_description"
                          value={settings.screenshots_description}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              screenshots_description: e.target.value,
                            })
                          }
                          rows={3}
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gambar screenshot akan diambil dari konfigurasi file atau media library
                        sesuai implementasi backend.
                      </p>
                    </CardContent>
                  )}
                </Card>

                {/* FAQ Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        FAQ Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="faq_enabled">Enable</Label>
                        <Switch
                          id="faq_enabled"
                          checked={settings.faq_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, faq_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.faq_enabled && (
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="faq_title">Section Label</Label>
                          <Input
                            id="faq_title"
                            value={settings.faq_title}
                            onChange={(e) =>
                              setSettings({ ...settings, faq_title: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="faq_heading">Heading</Label>
                          <Input
                            id="faq_heading"
                            value={settings.faq_heading}
                            onChange={(e) =>
                              setSettings({ ...settings, faq_heading: e.target.value })
                            }
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="faq_description">Description</Label>
                        <Textarea
                          id="faq_description"
                          value={settings.faq_description}
                          onChange={(e) =>
                            setSettings({ ...settings, faq_description: e.target.value })
                          }
                          rows={3}
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Detail pertanyaan & jawaban FAQ dapat dikonfigurasi lebih lanjut pada modul
                        khusus atau backend.
                      </p>
                    </CardContent>
                  )}
                </Card>

                {/* Join Us Section */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        Join Us Section
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="joinus_enabled">Enable</Label>
                        <Switch
                          id="joinus_enabled"
                          checked={settings.joinus_enabled}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, joinus_enabled: checked })
                          }
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  {settings.joinus_enabled && (
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="joinus_heading">Heading</Label>
                        <Input
                          id="joinus_heading"
                          value={settings.joinus_heading}
                          onChange={(e) =>
                            setSettings({ ...settings, joinus_heading: e.target.value })
                          }
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="joinus_description">Description</Label>
                        <Textarea
                          id="joinus_description"
                          value={settings.joinus_description}
                          onChange={(e) =>
                            setSettings({ ...settings, joinus_description: e.target.value })
                          }
                          rows={3}
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* SEO Settings */}
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                      SEO Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="meta_title">
                        Meta Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="meta_title"
                        value={settings.meta_title}
                        onChange={(e) =>
                          setSettings({ ...settings, meta_title: e.target.value })
                        }
                        required
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={settings.meta_description}
                        onChange={(e) =>
                          setSettings({ ...settings, meta_description: e.target.value })
                        }
                        rows={3}
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="meta_keywords">Meta Keywords</Label>
                      <Input
                        id="meta_keywords"
                        value={settings.meta_keywords}
                        onChange={(e) =>
                          setSettings({ ...settings, meta_keywords: e.target.value })
                        }
                        placeholder="keyword1, keyword2, keyword3"
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button type="submit" variant="blue" className="shadow-none">
                    <Save className="mr-2 h-4 w-4" /> Save Settings
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
