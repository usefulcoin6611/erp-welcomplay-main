"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Save, ChevronRight, Plus, Pencil, Trash, Upload } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

// Types
interface LandingPageSettings {
  // Top Bar
  topbar_status: 'on' | 'off'
  topbar_notification_msg: string
  
  // Home
  home_offer_text: string
  home_title: string
  home_heading: string
  home_description: string
  home_trusted_by: string
  home_live_demo_link: string
  home_buy_now_link: string
  home_banner: string
  home_logo: string[]
  
  // Features
  feature_status: 'on' | 'off'
  feature_title: string
  feature_heading: string
  feature_description: string
  feature_buy_now_link: string
  highlight_feature_heading: string
  highlight_feature_description: string
  highlight_feature_image: string
  
  // Discover
  discover_status: 'on' | 'off'
  discover_heading: string
  discover_description: string
  discover_live_demo_link: string
  discover_buy_now_link: string
  
  // Screenshots
  screenshots_status: 'on' | 'off'
  screenshots_heading: string
  screenshots_description: string
  
  // Pricing Plan
  plan_status: 'on' | 'off'
  plan_title: string
  plan_heading: string
  plan_description: string
  
  // FAQ
  faq_status: 'on' | 'off'
  faq_title: string
  faq_heading: string
  faq_description: string
  
  // Testimonials
  testimonials_status: 'on' | 'off'
  testimonials_heading: string
  testimonials_description: string
  testimonials_long_description: string
  
  // Join Us
  joinus_status: 'on' | 'off'
  joinus_heading: string
  joinus_description: string
  
  // Custom Page
  site_logo: string
  site_description: string
}

interface Feature {
  id: string
  feature_heading: string
  feature_description: string
  feature_logo: string
}

interface DiscoverItem {
  id: string
  discover_heading: string
  discover_description: string
  discover_logo: string
}

interface Screenshot {
  id: string
  screenshots_heading: string
  screenshots: string
}

interface FAQ {
  id: string
  faq_questions: string
  faq_answer: string
}

interface Testimonial {
  id: string
  testimonials_title: string
  testimonials_description: string
  testimonials_user: string
  testimonials_designation: string
  testimonials_user_avtar: string
  testimonials_star: number
}

interface JoinUsUser {
  id: string
  email: string
}

interface CustomPage {
  id: string
  menubar_page_name: string
  page_slug: string
  template_name: 'page_content' | 'page_url'
  page_url?: string
  menubar_page_contant?: string
  header: 'on' | 'off'
  footer: 'on' | 'off'
  login: 'on' | 'off'
}

// Mock data
const initialSettings: LandingPageSettings = {
  topbar_status: 'on',
  topbar_notification_msg: '70% Special Offer. Don\'t Miss it. The offer ends in 72 hours.',
  home_offer_text: '70% Special Offer',
  home_title: 'Home',
  home_heading: 'Best Ultimate Accounts & CRM Software System',
  home_description: 'Manage accounting, CRM, HRM, projects, POS, and more in a single, integrated platform.',
  home_trusted_by: '1,000+ customers',
  home_live_demo_link: '#',
  home_buy_now_link: '#',
  home_banner: '',
  home_logo: [],
  feature_status: 'on',
  feature_title: 'Features',
  feature_heading: 'Why Choose Us',
  feature_description: 'Discover the features that make us stand out',
  feature_buy_now_link: '#',
  highlight_feature_heading: 'Highlight Feature',
  highlight_feature_description: 'Description of highlight feature',
  highlight_feature_image: '',
  discover_status: 'on',
  discover_heading: 'Discover powerful modules',
  discover_description: 'From finance to HR to sales, ERPGo SaaS includes everything you need.',
  discover_live_demo_link: '#',
  discover_buy_now_link: '#',
  screenshots_status: 'on',
  screenshots_heading: 'Beautiful and intuitive dashboards',
  screenshots_description: 'Explore how ERPGo SaaS presents complex data in simple views.',
  plan_status: 'on',
  plan_title: 'PLAN',
  plan_heading: 'Choose Your Plan',
  plan_description: 'Select the perfect plan for your business',
  faq_status: 'on',
  faq_title: 'FAQ',
  faq_heading: 'Frequently asked questions',
  faq_description: "Got questions? We've compiled answers to the most common questions.",
  testimonials_status: 'on',
  testimonials_heading: 'What Our Customers Say',
  testimonials_description: 'Testimonials from our satisfied customers',
  testimonials_long_description: 'Long description about testimonials',
  joinus_status: 'on',
  joinus_heading: 'Join our newsletter',
  joinus_description: 'Get product updates, tips, and best practices directly to your inbox.',
  site_logo: '',
  site_description: 'ERPGo SaaS - Modern ERP solution for your business',
}

const mockFeatures: Feature[] = []
const mockDiscoverItems: DiscoverItem[] = []
const mockScreenshots: Screenshot[] = []
const mockFAQs: FAQ[] = []
const mockTestimonials: Testimonial[] = []
const mockJoinUsUsers: JoinUsUser[] = []
const mockCustomPages: CustomPage[] = []

type Section = 
  | 'topbar' 
  | 'custom_page' 
  | 'home' 
  | 'features' 
  | 'discover' 
  | 'screenshots' 
  | 'pricing_plan' 
  | 'faq' 
  | 'testimonials' 
  | 'join_us'

const sections: { key: Section; label: string }[] = [
  { key: 'topbar', label: 'Top Bar' },
  { key: 'custom_page', label: 'Custom Page' },
  { key: 'home', label: 'Home' },
  { key: 'features', label: 'Features' },
  { key: 'discover', label: 'Discover' },
  { key: 'screenshots', label: 'Screenshots' },
  { key: 'pricing_plan', label: 'Pricing Plan' },
  { key: 'faq', label: 'FAQ' },
  { key: 'testimonials', label: 'Testimonials' },
  { key: 'join_us', label: 'Join Us' },
]

export default function LandingPagePage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  
  const [activeSection, setActiveSection] = useState<Section>('topbar')
  const [settings, setSettings] = useState<LandingPageSettings>(initialSettings)
  const [features, setFeatures] = useState<Feature[]>(mockFeatures)
  const [discoverItems, setDiscoverItems] = useState<DiscoverItem[]>(mockDiscoverItems)
  const [screenshots, setScreenshots] = useState<Screenshot[]>(mockScreenshots)
  const [faqs, setFaqs] = useState<FAQ[]>(mockFAQs)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials)
  const [joinUsUsers, setJoinUsUsers] = useState<JoinUsUser[]>(mockJoinUsUsers)
  const [customPages, setCustomPages] = useState<CustomPage[]>(mockCustomPages)
  const [createPageDialogOpen, setCreatePageDialogOpen] = useState(false)
  const [editPageDialogOpen, setEditPageDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null)
  const [pageFormData, setPageFormData] = useState({
    menubar_page_name: '',
    template_name: 'page_content' as 'page_content' | 'page_url',
    page_url: '',
    menubar_page_contant: '',
    header: false,
    footer: false,
    login: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Landing page settings:', settings)
    alert('Landing page settings saved successfully!')
  }

  const handleDeleteFeature = (id: string) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setFeatures(features.filter((f) => f.id !== id))
    }
  }

  const handleDeleteDiscover = (id: string) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setDiscoverItems(discoverItems.filter((d) => d.id !== id))
    }
  }

  const handleDeleteScreenshot = (id: string) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setScreenshots(screenshots.filter((s) => s.id !== id))
    }
  }

  const handleDeleteFAQ = (id: string) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setFaqs(faqs.filter((f) => f.id !== id))
    }
  }

  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setTestimonials(testimonials.filter((t) => t.id !== id))
    }
  }

  const handleDeleteJoinUsUser = (id: string) => {
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setJoinUsUsers(joinUsUsers.filter((u) => u.id !== id))
    }
  }

  const handleCreatePage = () => {
    setPageFormData({
      menubar_page_name: '',
      template_name: 'page_content',
      page_url: '',
      menubar_page_contant: '',
      header: false,
      footer: false,
      login: false,
    })
    setCreatePageDialogOpen(true)
  }

  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPage: CustomPage = {
      id: Date.now().toString(),
      menubar_page_name: pageFormData.menubar_page_name,
      page_slug: pageFormData.menubar_page_name.toLowerCase().replace(/\s+/g, '_'),
      template_name: pageFormData.template_name,
      page_url: pageFormData.template_name === 'page_url' ? pageFormData.page_url : undefined,
      menubar_page_contant: pageFormData.template_name === 'page_content' ? pageFormData.menubar_page_contant : undefined,
      header: pageFormData.header ? 'on' : 'off',
      footer: pageFormData.footer ? 'on' : 'off',
      login: pageFormData.login ? 'on' : 'off',
    }
    setCustomPages([...customPages, newPage])
    setCreatePageDialogOpen(false)
  }

  const handleEditPage = (page: CustomPage) => {
    setEditingPage(page)
    setPageFormData({
      menubar_page_name: page.menubar_page_name,
      template_name: page.template_name,
      page_url: page.page_url || '',
      menubar_page_contant: page.menubar_page_contant || '',
      header: page.header === 'on',
      footer: page.footer === 'on',
      login: page.login === 'on',
    })
    setEditPageDialogOpen(true)
  }

  const handleUpdatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPage) return

    const updatedPage: CustomPage = {
      ...editingPage,
      menubar_page_name: pageFormData.menubar_page_name,
      page_slug: pageFormData.menubar_page_name.toLowerCase().replace(/\s+/g, '_'),
      template_name: pageFormData.template_name,
      page_url: pageFormData.template_name === 'page_url' ? pageFormData.page_url : undefined,
      menubar_page_contant: pageFormData.template_name === 'page_content' ? pageFormData.menubar_page_contant : undefined,
      header: pageFormData.header ? 'on' : 'off',
      footer: pageFormData.footer ? 'on' : 'off',
      login: pageFormData.login ? 'on' : 'off',
    }

    setCustomPages(customPages.map((p) => (p.id === editingPage.id ? updatedPage : p)))
    setEditPageDialogOpen(false)
    setEditingPage(null)
  }

  const handleDeleteCustomPage = (id: string) => {
    const page = customPages.find((p) => p.id === id)
    if (page && (page.page_slug === 'terms_and_conditions' || page.page_slug === 'about_us' || page.page_slug === 'privacy_policy')) {
      alert('This page cannot be deleted.')
      return
    }
    if (confirm('Are You Sure? This action can not be undone. Do you want to continue?')) {
      setCustomPages(customPages.filter((p) => p.id !== id))
    }
  }

  if (!isSuperAdmin) {
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
              <Card className="shadow-none">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Permission denied.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
            <div className="mb-2">
              <h1 className="text-2xl font-semibold">Landing Page</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dashboard {'>'} Landing Page
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card className="shadow-none sticky" style={{ top: '30px' }}>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {sections.map((section) => (
                        <button
                          key={section.key}
                          onClick={() => setActiveSection(section.key)}
                          className={cn(
                            'px-4 py-3 text-left text-sm transition-colors border-0 bg-transparent hover:bg-muted/50 flex items-center justify-between w-full',
                            activeSection === section.key
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-foreground'
                          )}
                        >
                          <span>{section.label}</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Top Bar Section */}
                {activeSection === 'topbar' && (
                  <form onSubmit={handleSubmit}>
                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">Top Bar</CardTitle>
                          <Switch
                            id="topbar_status"
                            checked={settings.topbar_status === 'on'}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                topbar_status: checked ? 'on' : 'off',
                              })
                            }
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <Label htmlFor="topbar_notification_msg">
                            Message <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="topbar_notification_msg"
                            value={settings.topbar_notification_msg}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                topbar_notification_msg: e.target.value,
                              })
                            }
                            rows={4}
                            required
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            placeholder="Write here..."
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-6">
                        <Button type="submit" variant="blue" className="shadow-none ml-auto">
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                )}

                {/* Home Section */}
                {activeSection === 'home' && (
                  <form onSubmit={handleSubmit}>
                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold">Home Section</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="home_offer_text">Offer Text</Label>
                            <Input
                              id="home_offer_text"
                              value={settings.home_offer_text}
                              onChange={(e) =>
                                setSettings({ ...settings, home_offer_text: e.target.value })
                              }
                              placeholder="70% Special Offer"
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home_title">Title</Label>
                            <Input
                              id="home_title"
                              value={settings.home_title}
                              onChange={(e) =>
                                setSettings({ ...settings, home_title: e.target.value })
                              }
                              placeholder="Enter Title"
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_heading">Heading</Label>
                          <Input
                            id="home_heading"
                            value={settings.home_heading}
                            onChange={(e) =>
                              setSettings({ ...settings, home_heading: e.target.value })
                            }
                            placeholder="Enter Heading"
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_description">Description</Label>
                          <Input
                            id="home_description"
                            value={settings.home_description}
                            onChange={(e) =>
                              setSettings({ ...settings, home_description: e.target.value })
                            }
                            placeholder="Enter Description"
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_trusted_by">Trusted by</Label>
                          <Input
                            id="home_trusted_by"
                            value={settings.home_trusted_by}
                            onChange={(e) =>
                              setSettings({ ...settings, home_trusted_by: e.target.value })
                            }
                            placeholder="1,000+ customers"
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="home_live_demo_link">Live Demo Link</Label>
                            <Input
                              id="home_live_demo_link"
                              value={settings.home_live_demo_link}
                              onChange={(e) =>
                                setSettings({ ...settings, home_live_demo_link: e.target.value })
                              }
                              placeholder="Enter Link"
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home_buy_now_link">Buy Now Link</Label>
                            <Input
                              id="home_buy_now_link"
                              value={settings.home_buy_now_link}
                              onChange={(e) =>
                                setSettings({ ...settings, home_buy_now_link: e.target.value })
                              }
                              placeholder="Enter Link"
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_banner">Banner</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="home_banner"
                              type="file"
                              accept="image/*"
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                            <Button type="button" variant="outline" size="sm" className="shadow-none">
                              <Upload className="mr-2 h-4 w-4" />
                              Choose file here
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Logo</Label>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" className="shadow-none">
                              <Plus className="mr-2 h-4 w-4" /> Create
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-6">
                        <Button type="submit" variant="blue" className="shadow-none ml-auto">
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                )}

                {/* Features Section */}
                {activeSection === 'features' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg font-semibold">Feature</CardTitle>
                            <Switch
                              id="feature_status"
                              checked={settings.feature_status === 'on'}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  feature_status: checked ? 'on' : 'off',
                                })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="feature_title">
                                Title <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="feature_title"
                                value={settings.feature_title}
                                onChange={(e) =>
                                  setSettings({ ...settings, feature_title: e.target.value })
                                }
                                placeholder="Enter Title"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="feature_heading">
                                Heading <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="feature_heading"
                                value={settings.feature_heading}
                                onChange={(e) =>
                                  setSettings({ ...settings, feature_heading: e.target.value })
                                }
                                placeholder="Enter Heading"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="feature_description">Description</Label>
                              <Input
                                id="feature_description"
                                value={settings.feature_description}
                                onChange={(e) =>
                                  setSettings({ ...settings, feature_description: e.target.value })
                                }
                                placeholder="Enter Description"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="feature_buy_now_link">Buy Now Link</Label>
                              <Input
                                id="feature_buy_now_link"
                                value={settings.feature_buy_now_link}
                                onChange={(e) =>
                                  setSettings({ ...settings, feature_buy_now_link: e.target.value })
                                }
                                placeholder="Enter Link"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">Features List</CardTitle>
                          <Button variant="blue" size="sm" className="shadow-none">
                            <Plus className="mr-2 h-4 w-4" /> Create Feature
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {features.length > 0 ? (
                                features.map((feature, index) => (
                                  <tr key={feature.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{feature.feature_heading}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteFeature(feature.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                    No features found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold">Feature</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="highlight_feature_heading">
                                Heading <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="highlight_feature_heading"
                                value={settings.highlight_feature_heading}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    highlight_feature_heading: e.target.value,
                                  })
                                }
                                placeholder="Enter Heading"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="highlight_feature_description">Description</Label>
                              <Input
                                id="highlight_feature_description"
                                value={settings.highlight_feature_description}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    highlight_feature_description: e.target.value,
                                  })
                                }
                                placeholder="Enter Description"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="highlight_feature_image">Logo</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="highlight_feature_image"
                                type="file"
                                accept="image/*"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                              <Button type="button" variant="outline" size="sm" className="shadow-none">
                                <Upload className="mr-2 h-4 w-4" />
                                Choose file here
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">Features Block</CardTitle>
                          <Button variant="blue" size="sm" className="shadow-none">
                            <Plus className="mr-2 h-4 w-4" /> Create Feature Block
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                  No feature blocks found
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Discover Section */}
                {activeSection === 'discover' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg font-semibold">Discover</CardTitle>
                            <Switch
                              id="discover_status"
                              checked={settings.discover_status === 'on'}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  discover_status: checked ? 'on' : 'off',
                                })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="discover_heading">
                                Heading <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="discover_heading"
                                value={settings.discover_heading}
                                onChange={(e) =>
                                  setSettings({ ...settings, discover_heading: e.target.value })
                                }
                                placeholder="Enter Heading"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="discover_description">
                                Description <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="discover_description"
                                value={settings.discover_description}
                                onChange={(e) =>
                                  setSettings({ ...settings, discover_description: e.target.value })
                                }
                                placeholder="Enter Description"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="discover_live_demo_link">Live Demo Link</Label>
                              <Input
                                id="discover_live_demo_link"
                                value={settings.discover_live_demo_link}
                                onChange={(e) =>
                                  setSettings({ ...settings, discover_live_demo_link: e.target.value })
                                }
                                placeholder="Enter Link"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="discover_buy_now_link">Buy Now Link</Label>
                              <Input
                                id="discover_buy_now_link"
                                value={settings.discover_buy_now_link}
                                onChange={(e) =>
                                  setSettings({ ...settings, discover_buy_now_link: e.target.value })
                                }
                                placeholder="Enter Link"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">Discover List</CardTitle>
                          <Button variant="blue" size="sm" className="shadow-none">
                            <Plus className="mr-2 h-4 w-4" /> Create Discover
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {discoverItems.length > 0 ? (
                                discoverItems.map((item, index) => (
                                  <tr key={item.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{item.discover_heading}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteDiscover(item.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                    No discover items found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Screenshots Section */}
                {activeSection === 'screenshots' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg font-semibold">Screenshots</CardTitle>
                            <Switch
                              id="screenshots_status"
                              checked={settings.screenshots_status === 'on'}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  screenshots_status: checked ? 'on' : 'off',
                                })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="screenshots_heading">
                                Heading <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="screenshots_heading"
                                value={settings.screenshots_heading}
                                onChange={(e) =>
                                  setSettings({ ...settings, screenshots_heading: e.target.value })
                                }
                                placeholder="Enter Heading"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="screenshots_description">
                                Description <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="screenshots_description"
                                value={settings.screenshots_description}
                                onChange={(e) =>
                                  setSettings({ ...settings, screenshots_description: e.target.value })
                                }
                                placeholder="Enter Description"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">Screenshots List</CardTitle>
                          <Button variant="blue" size="sm" className="shadow-none">
                            <Plus className="mr-2 h-4 w-4" /> Create ScreenShot
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {screenshots.length > 0 ? (
                                screenshots.map((screenshot, index) => (
                                  <tr key={screenshot.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{screenshot.screenshots_heading}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteScreenshot(screenshot.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                    No screenshots found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Pricing Plan Section */}
                {activeSection === 'pricing_plan' && (
                  <form onSubmit={handleSubmit}>
                    <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg font-semibold">Plan Section</CardTitle>
                            <Switch
                              id="plan_status"
                              checked={settings.plan_status === 'on'}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  plan_status: checked ? 'on' : 'off',
                                })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="plan_title">
                              Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="plan_title"
                              value={settings.plan_title}
                              onChange={(e) =>
                                setSettings({ ...settings, plan_title: e.target.value })
                              }
                              placeholder="Enter Title"
                              required
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="plan_heading">
                              Heading <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="plan_heading"
                              value={settings.plan_heading}
                              onChange={(e) =>
                                setSettings({ ...settings, plan_heading: e.target.value })
                              }
                              placeholder="Enter Heading"
                              required
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="plan_description">Description</Label>
                          <Input
                            id="plan_description"
                            value={settings.plan_description}
                            onChange={(e) =>
                              setSettings({ ...settings, plan_description: e.target.value })
                            }
                            placeholder="Enter Description"
                            className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-6">
                        <Button type="submit" variant="blue" className="shadow-none ml-auto">
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                )}

                {/* FAQ Section */}
                {activeSection === 'faq' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg font-semibold">FAQ</CardTitle>
                            <Switch
                              id="faq_status"
                              checked={settings.faq_status === 'on'}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  faq_status: checked ? 'on' : 'off',
                                })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="faq_title">
                                Title <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="faq_title"
                                value={settings.faq_title}
                                onChange={(e) =>
                                  setSettings({ ...settings, faq_title: e.target.value })
                                }
                                placeholder="Enter Title"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="faq_heading">
                                Heading <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="faq_heading"
                                value={settings.faq_heading}
                                onChange={(e) =>
                                  setSettings({ ...settings, faq_heading: e.target.value })
                                }
                                placeholder="Enter Heading"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="faq_description">Description</Label>
                            <Input
                              id="faq_description"
                              value={settings.faq_description}
                              onChange={(e) =>
                                setSettings({ ...settings, faq_description: e.target.value })
                              }
                              placeholder="Enter Description"
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">FAQ List</CardTitle>
                          <Button variant="blue" size="sm" className="shadow-none">
                            <Plus className="mr-2 h-4 w-4" /> Create FAQ
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {faqs.length > 0 ? (
                                faqs.map((faq, index) => (
                                  <tr key={faq.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{faq.faq_questions}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteFAQ(faq.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                    No FAQs found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Testimonials Section */}
                {activeSection === 'testimonials' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg font-semibold">Testimonial</CardTitle>
                            <Switch
                              id="testimonials_status"
                              checked={settings.testimonials_status === 'on'}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  testimonials_status: checked ? 'on' : 'off',
                                })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="testimonials_heading">
                                Heading <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="testimonials_heading"
                                value={settings.testimonials_heading}
                                onChange={(e) =>
                                  setSettings({ ...settings, testimonials_heading: e.target.value })
                                }
                                placeholder="Enter Heading"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="testimonials_description">
                                Description <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="testimonials_description"
                                value={settings.testimonials_description}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    testimonials_description: e.target.value,
                                  })
                                }
                                placeholder="Enter Description"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="testimonials_long_description">Long Description</Label>
                            <Textarea
                              id="testimonials_long_description"
                              value={settings.testimonials_long_description}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  testimonials_long_description: e.target.value,
                                })
                              }
                              rows={4}
                              placeholder="Enter Long Description"
                              className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">Testimonials List</CardTitle>
                          <Button variant="blue" size="sm" className="shadow-none">
                            <Plus className="mr-2 h-4 w-4" /> Create Testimonial
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {testimonials.length > 0 ? (
                                testimonials.map((testimonial, index) => (
                                  <tr key={testimonial.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{testimonial.testimonials_title}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                    No testimonials found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Join Us Section */}
                {activeSection === 'join_us' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-lg font-semibold">Join User</CardTitle>
                            <Switch
                              id="joinus_status"
                              checked={settings.joinus_status === 'on'}
                              onCheckedChange={(checked) =>
                                setSettings({
                                  ...settings,
                                  joinus_status: checked ? 'on' : 'off',
                                })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="joinus_heading">
                                Heading <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="joinus_heading"
                                value={settings.joinus_heading}
                                onChange={(e) =>
                                  setSettings({ ...settings, joinus_heading: e.target.value })
                                }
                                placeholder="Enter Heading"
                                required
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="joinus_description">Description</Label>
                              <Input
                                id="joinus_description"
                                value={settings.joinus_description}
                                onChange={(e) =>
                                  setSettings({ ...settings, joinus_description: e.target.value })
                                }
                                placeholder="Enter Description"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold">Join Us User</CardTitle>
                        </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {joinUsUsers.length > 0 ? (
                                joinUsUsers.map((user) => (
                                  <tr key={user.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                        onClick={() => handleDeleteJoinUsUser(user.id)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                    No join us users found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Custom Page Section */}
                {activeSection === 'custom_page' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="shadow-none">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-semibold">Custom Page</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="site_logo">Site Logo</Label>
                              <div className="mt-4">
                                <div className="w-32 h-32 border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/50">
                                  {settings.site_logo ? (
                                    <img
                                      src={settings.site_logo}
                                      alt="Site Logo"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground text-sm">No logo</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <Input
                                  id="site_logo"
                                  type="file"
                                  accept="image/*"
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const reader = new FileReader()
                                      reader.onloadend = () => {
                                        setSettings({
                                          ...settings,
                                          site_logo: reader.result as string,
                                        })
                                      }
                                      reader.readAsDataURL(file)
                                    }
                                  }}
                                />
                                <Button type="button" variant="outline" size="sm" className="shadow-none">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Choose file here
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="site_description">Site Description</Label>
                              <Input
                                id="site_description"
                                value={settings.site_description}
                                onChange={(e) =>
                                  setSettings({ ...settings, site_description: e.target.value })
                                }
                                placeholder="Enter Description"
                                className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-6">
                          <Button type="submit" variant="blue" className="shadow-none ml-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold">Menu Bar</CardTitle>
                          <Dialog open={createPageDialogOpen} onOpenChange={setCreatePageDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="blue" size="sm" className="shadow-none">
                                <Plus className="mr-2 h-4 w-4" /> Create Page
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Create Page</DialogTitle>
                                <DialogDescription>Add a new custom page to your landing page menu.</DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleCreatePageSubmit}>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="create_page_name">
                                      Page Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      id="create_page_name"
                                      value={pageFormData.menubar_page_name}
                                      onChange={(e) =>
                                        setPageFormData({ ...pageFormData, menubar_page_name: e.target.value })
                                      }
                                      placeholder="Enter Page Name"
                                      required
                                      className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Template</Label>
                                    <div className="flex gap-6">
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id="create_page_content"
                                          name="create_template_name"
                                          value="page_content"
                                          checked={pageFormData.template_name === 'page_content'}
                                          onChange={(e) =>
                                            setPageFormData({
                                              ...pageFormData,
                                              template_name: e.target.value as 'page_content' | 'page_url',
                                            })
                                          }
                                          className="h-4 w-4"
                                        />
                                        <Label htmlFor="create_page_content" className="font-normal cursor-pointer">
                                          Page Content
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id="create_page_url"
                                          name="create_template_name"
                                          value="page_url"
                                          checked={pageFormData.template_name === 'page_url'}
                                          onChange={(e) =>
                                            setPageFormData({
                                              ...pageFormData,
                                              template_name: e.target.value as 'page_content' | 'page_url',
                                            })
                                          }
                                          className="h-4 w-4"
                                        />
                                        <Label htmlFor="create_page_url" className="font-normal cursor-pointer">
                                          Page URL
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                  {pageFormData.template_name === 'page_url' ? (
                                    <div className="space-y-2">
                                      <Label htmlFor="create_page_url_input">Page URL</Label>
                                      <Input
                                        id="create_page_url_input"
                                        value={pageFormData.page_url}
                                        onChange={(e) =>
                                          setPageFormData({ ...pageFormData, page_url: e.target.value })
                                        }
                                        placeholder="Enter Page URL"
                                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <Label htmlFor="create_page_content_input">Page Content</Label>
                                      <Textarea
                                        id="create_page_content_input"
                                        value={pageFormData.menubar_page_contant}
                                        onChange={(e) =>
                                          setPageFormData({ ...pageFormData, menubar_page_contant: e.target.value })
                                        }
                                        rows={5}
                                        placeholder="Enter Page Content"
                                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                      />
                                    </div>
                                  )}
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="create_header"
                                        checked={pageFormData.header}
                                        onChange={(e) =>
                                          setPageFormData({ ...pageFormData, header: e.target.checked })
                                        }
                                        className="h-4 w-4"
                                      />
                                      <Label htmlFor="create_header" className="font-normal cursor-pointer">
                                        Header
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="create_footer"
                                        checked={pageFormData.footer}
                                        onChange={(e) =>
                                          setPageFormData({ ...pageFormData, footer: e.target.checked })
                                        }
                                        className="h-4 w-4"
                                      />
                                      <Label htmlFor="create_footer" className="font-normal cursor-pointer">
                                        Footer
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="create_login"
                                        checked={pageFormData.login}
                                        onChange={(e) =>
                                          setPageFormData({ ...pageFormData, login: e.target.checked })
                                        }
                                        className="h-4 w-4"
                                      />
                                      <Label htmlFor="create_login" className="font-normal cursor-pointer">
                                        Login
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreatePageDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" variant="blue" className="shadow-none">
                                    Create
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customPages.length > 0 ? (
                                customPages.map((page, index) => (
                                  <tr key={page.id} className="border-t hover:bg-muted/50">
                                    <td className="px-4 py-3">{index + 1}</td>
                                    <td className="px-4 py-3">{page.menubar_page_name}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                          onClick={() => handleEditPage(page)}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        {page.page_slug !== 'terms_and_conditions' &&
                                          page.page_slug !== 'about_us' &&
                                          page.page_slug !== 'privacy_policy' && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                              onClick={() => handleDeleteCustomPage(page.id)}
                                            >
                                              <Trash className="h-4 w-4" />
                                            </Button>
                                          )}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                    No custom pages found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Edit Page Dialog */}
                    {editingPage && (
                      <Dialog open={editPageDialogOpen} onOpenChange={setEditPageDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Page</DialogTitle>
                            <DialogDescription>Update custom page information.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleUpdatePageSubmit}>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit_page_name">
                                  Page Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="edit_page_name"
                                  value={pageFormData.menubar_page_name}
                                  onChange={(e) =>
                                    setPageFormData({ ...pageFormData, menubar_page_name: e.target.value })
                                  }
                                  placeholder="Enter Page Name"
                                  required
                                  readOnly={
                                    editingPage.page_slug === 'terms_and_conditions' ||
                                    editingPage.page_slug === 'about_us' ||
                                    editingPage.page_slug === 'privacy_policy'
                                  }
                                  className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Template</Label>
                                <div className="flex gap-6">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="edit_page_content"
                                      name="edit_template_name"
                                      value="page_content"
                                      checked={pageFormData.template_name === 'page_content'}
                                      onChange={(e) =>
                                        setPageFormData({
                                          ...pageFormData,
                                          template_name: e.target.value as 'page_content' | 'page_url',
                                        })
                                      }
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="edit_page_content" className="font-normal cursor-pointer">
                                      Page Content
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      id="edit_page_url"
                                      name="edit_template_name"
                                      value="page_url"
                                      checked={pageFormData.template_name === 'page_url'}
                                      onChange={(e) =>
                                        setPageFormData({
                                          ...pageFormData,
                                          template_name: e.target.value as 'page_content' | 'page_url',
                                        })
                                      }
                                      className="h-4 w-4"
                                    />
                                    <Label htmlFor="edit_page_url" className="font-normal cursor-pointer">
                                      Page URL
                                    </Label>
                                  </div>
                                </div>
                              </div>
                              {pageFormData.template_name === 'page_url' ? (
                                <div className="space-y-2">
                                  <Label htmlFor="edit_page_url_input">Page URL</Label>
                                  <Input
                                    id="edit_page_url_input"
                                    value={pageFormData.page_url}
                                    onChange={(e) =>
                                      setPageFormData({ ...pageFormData, page_url: e.target.value })
                                    }
                                    placeholder="Enter Page URL"
                                    className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor="edit_page_content_input">Page Content</Label>
                                  <Textarea
                                    id="edit_page_content_input"
                                    value={pageFormData.menubar_page_contant}
                                    onChange={(e) =>
                                      setPageFormData({ ...pageFormData, menubar_page_contant: e.target.value })
                                    }
                                    rows={5}
                                    placeholder="Enter Page Content"
                                    className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                  />
                                </div>
                              )}
                              <div className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit_header"
                                    checked={pageFormData.header}
                                    onChange={(e) =>
                                      setPageFormData({ ...pageFormData, header: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="edit_header" className="font-normal cursor-pointer">
                                    Header
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit_footer"
                                    checked={pageFormData.footer}
                                    onChange={(e) =>
                                      setPageFormData({ ...pageFormData, footer: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="edit_footer" className="font-normal cursor-pointer">
                                    Footer
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit_login"
                                    checked={pageFormData.login}
                                    onChange={(e) =>
                                      setPageFormData({ ...pageFormData, login: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor="edit_login" className="font-normal cursor-pointer">
                                    Login
                                  </Label>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditPageDialogOpen(false)
                                  setEditingPage(null)
                                }}
                              >
                                Cancel
                              </Button>
                              <Button type="submit" variant="blue" className="shadow-none">
                                Update
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
