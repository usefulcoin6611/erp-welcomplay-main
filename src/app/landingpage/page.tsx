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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Save, Plus, Pencil, Trash, Upload } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

// Modern minimalist input styling (same as settings page)
const modernInputClass = cn(
  'rounded-lg',
  'border-gray-200 dark:border-gray-700',
  'bg-white dark:bg-gray-900/50',
  'transition-all duration-200 ease-in-out',
  'hover:border-gray-300 dark:hover:border-gray-600',
  'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
  'focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20',
  'focus-visible:ring-offset-0',
  ' hover:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)] focus-visible:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)]',
  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'text-gray-900 dark:text-gray-100'
)

const modernTextareaClass = cn(
  'rounded-lg',
  'border-gray-200 dark:border-gray-700',
  'bg-white dark:bg-gray-900/50',
  'transition-all duration-200 ease-in-out',
  'hover:border-gray-300 dark:hover:border-gray-600',
  'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
  'focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20',
  'focus-visible:ring-offset-0',
  ' hover:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)] focus-visible:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)]',
  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'text-gray-900 dark:text-gray-100',
  'resize-none'
)

// Modern minimalist select styling (same as settings page)
const modernSelectTriggerClass = cn(
  'w-full',
  'h-9',
  'rounded-lg',
  'border-gray-200 dark:border-gray-700',
  'bg-white dark:bg-gray-900/50',
  'transition-all duration-200 ease-in-out',
  'hover:border-gray-300 dark:hover:border-gray-600',
  'focus-visible:border-blue-500 dark:focus-visible:border-blue-400',
  'focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20',
  'focus-visible:ring-offset-0',
  ' hover:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)] focus-visible:shadow-[0_1px_2px_0_rgb(0_0_0_/_.03)]',
  'text-gray-900 dark:text-gray-100',
  'data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-gray-500'
)

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
const mockCustomPages: CustomPage[] = [
  {
    id: '1',
    menubar_page_name: 'About Us',
    page_slug: 'about_us',
    template_name: 'page_content',
    menubar_page_contant: '<h1>About Us</h1><p>Learn more about our company and mission.</p>',
    page_url: '',
    header: true,
    footer: true,
    login: false,
  },
  {
    id: '2',
    menubar_page_name: 'Terms and Conditions',
    page_slug: 'terms_and_conditions',
    template_name: 'page_content',
    menubar_page_contant: '<h1>Terms and Conditions</h1><p>Please read our terms and conditions carefully.</p>',
    page_url: '',
    header: true,
    footer: true,
    login: false,
  },
  {
    id: '3',
    menubar_page_name: 'Privacy Policy',
    page_slug: 'privacy_policy',
    template_name: 'page_content',
    menubar_page_contant: '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>',
    page_url: '',
    header: true,
    footer: true,
    login: false,
  },
  {
    id: '4',
    menubar_page_name: 'Contact',
    page_slug: 'contact',
    template_name: 'page_url',
    menubar_page_contant: '',
    page_url: 'https://example.com/contact',
    header: true,
    footer: true,
    login: false,
  },
]

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'feature' | 'discover' | 'screenshot' | 'faq' | 'testimonial' | 'joinus' | 'custompage' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
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
    setDeleteType('feature')
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteDiscover = (id: string) => {
    setDeleteType('discover')
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteScreenshot = (id: string) => {
    setDeleteType('screenshot')
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteFAQ = (id: string) => {
    setDeleteType('faq')
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTestimonial = (id: string) => {
    setDeleteType('testimonial')
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteJoinUsUser = (id: string) => {
    setDeleteType('joinus')
    setDeleteId(id)
    setDeleteDialogOpen(true)
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
    setDeleteType('custompage')
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteId || !deleteType) return

    switch (deleteType) {
      case 'feature':
        setFeatures(features.filter((f) => f.id !== deleteId))
        break
      case 'discover':
        setDiscoverItems(discoverItems.filter((d) => d.id !== deleteId))
        break
      case 'screenshot':
        setScreenshots(screenshots.filter((s) => s.id !== deleteId))
        break
      case 'faq':
        setFaqs(faqs.filter((f) => f.id !== deleteId))
        break
      case 'testimonial':
        setTestimonials(testimonials.filter((t) => t.id !== deleteId))
        break
      case 'joinus':
        setJoinUsUsers(joinUsUsers.filter((u) => u.id !== deleteId))
        break
      case 'custompage':
        setCustomPages(customPages.filter((p) => p.id !== deleteId))
        break
    }

    setDeleteDialogOpen(false)
    setDeleteId(null)
    setDeleteType(null)
  }

  const getDeleteMessage = () => {
    switch (deleteType) {
      case 'feature':
        return 'Are you sure you want to delete this feature? This action cannot be undone.'
      case 'discover':
        return 'Are you sure you want to delete this discover item? This action cannot be undone.'
      case 'screenshot':
        return 'Are you sure you want to delete this screenshot? This action cannot be undone.'
      case 'faq':
        return 'Are you sure you want to delete this FAQ? This action cannot be undone.'
      case 'testimonial':
        return 'Are you sure you want to delete this testimonial? This action cannot be undone.'
      case 'joinus':
        return 'Are you sure you want to delete this join us user? This action cannot be undone.'
      case 'custompage':
        return 'Are you sure you want to delete this custom page? This action cannot be undone.'
      default:
        return 'Are you sure you want to delete this item? This action cannot be undone.'
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
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
              <Card className=" rounded-lg">
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card className="rounded-lg sticky" style={{ top: '30px' }}>
                  <CardContent className="p-1">
                    <div className="space-y-0">
                      {sections.map((section) => {
                        const isActive = activeSection === section.key
                        return (
                          <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`relative w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-300 ease-out border-0 cursor-pointer rounded-md mx-1 my-0.5 group ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-50/80 to-transparent dark:from-blue-950/50 dark:to-transparent text-blue-700 dark:text-blue-300 font-medium border-l-2 border-blue-500 dark:border-blue-400'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            }`}
                          >
                            <span className="relative z-10">{section.label}</span>
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

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Top Bar Section */}
                {activeSection === 'topbar' && (
                  <form onSubmit={handleSubmit}>
                    <Card className="rounded-lg">
                      <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">Top Bar</CardTitle>
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
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <Label htmlFor="topbar_notification_msg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            className={modernTextareaClass}
                            placeholder="Write here..."
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 flex justify-end">
                        <Button type="submit" variant="blue" className=" rounded-lg">
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                )}

                {/* Home Section */}
                {activeSection === 'home' && (
                  <form onSubmit={handleSubmit}>
                    <Card className="rounded-lg">
                      <CardHeader className="p-3 rounded-t-lg">
                        <CardTitle className="text-base font-medium leading-none">Home Section</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="home_offer_text" className="text-sm font-medium text-gray-700 dark:text-gray-300">Offer Text</Label>
                            <Input
                              id="home_offer_text"
                              value={settings.home_offer_text}
                              onChange={(e) =>
                                setSettings({ ...settings, home_offer_text: e.target.value })
                              }
                              placeholder="70% Special Offer"
                              className={modernInputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                            <Input
                              id="home_title"
                              value={settings.home_title}
                              onChange={(e) =>
                                setSettings({ ...settings, home_title: e.target.value })
                              }
                              placeholder="Enter Title"
                              className={modernInputClass}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">Heading</Label>
                          <Input
                            id="home_heading"
                            value={settings.home_heading}
                            onChange={(e) =>
                              setSettings({ ...settings, home_heading: e.target.value })
                            }
                            placeholder="Enter Heading"
                            className={modernInputClass}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                          <Input
                            id="home_description"
                            value={settings.home_description}
                            onChange={(e) =>
                              setSettings({ ...settings, home_description: e.target.value })
                            }
                            placeholder="Enter Description"
                            className={modernInputClass}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_trusted_by" className="text-sm font-medium text-gray-700 dark:text-gray-300">Trusted by</Label>
                          <Input
                            id="home_trusted_by"
                            value={settings.home_trusted_by}
                            onChange={(e) =>
                              setSettings({ ...settings, home_trusted_by: e.target.value })
                            }
                            placeholder="1,000+ customers"
                            className={modernInputClass}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="home_live_demo_link" className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Demo Link</Label>
                            <Input
                              id="home_live_demo_link"
                              value={settings.home_live_demo_link}
                              onChange={(e) =>
                                setSettings({ ...settings, home_live_demo_link: e.target.value })
                              }
                              placeholder="Enter Link"
                              className={modernInputClass}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="home_buy_now_link" className="text-sm font-medium text-gray-700 dark:text-gray-300">Buy Now Link</Label>
                            <Input
                              id="home_buy_now_link"
                              value={settings.home_buy_now_link}
                              onChange={(e) =>
                                setSettings({ ...settings, home_buy_now_link: e.target.value })
                              }
                              placeholder="Enter Link"
                              className={modernInputClass}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="home_banner" className="text-sm font-medium text-gray-700 dark:text-gray-300">Banner</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="home_banner"
                              type="file"
                              accept="image/*"
                              className={modernInputClass}
                            />
                            <Button type="button" variant="outline" size="sm" className=" rounded-lg">
                              <Upload className="mr-2 h-4 w-4" />
                              Choose file here
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Logo</Label>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" size="sm" className=" rounded-lg">
                              <Plus className="mr-2 h-4 w-4" /> Create
                            </Button>
                          </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 flex justify-end">
                        <Button type="submit" variant="blue" className=" rounded-lg">
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
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                          <CardTitle className="text-base font-medium leading-none">Feature</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="feature_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="feature_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="feature_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                                <Input
                                  id="feature_description"
                                  value={settings.feature_description}
                                  onChange={(e) =>
                                    setSettings({ ...settings, feature_description: e.target.value })
                                  }
                                  placeholder="Enter Description"
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="feature_buy_now_link" className="text-sm font-medium text-gray-700 dark:text-gray-300">Buy Now Link</Label>
                                <Input
                                  id="feature_buy_now_link"
                                  value={settings.feature_buy_now_link}
                                  onChange={(e) =>
                                    setSettings({ ...settings, feature_buy_now_link: e.target.value })
                                  }
                                  placeholder="Enter Link"
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className=" rounded-lg overflow-hidden">
                      <CardHeader className="p-3 rounded-t-lg bg-muted/30 !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">Features List</CardTitle>
                        <Button variant="blue" size="sm" className=" rounded-lg">
                          <Plus className="mr-2 h-4 w-4" /> Create Feature
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {features.length > 0 ? (
                                features.map((feature, index) => (
                                  <TableRow key={feature.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{feature.feature_heading}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteFeature(feature.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No features found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit}>
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg">
                          <CardTitle className="text-base font-medium leading-none">Feature</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="highlight_feature_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="highlight_feature_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
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
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="highlight_feature_image" className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id="highlight_feature_image"
                                  type="file"
                                  accept="image/*"
                                  className={modernInputClass}
                                />
                                <Button type="button" variant="outline" size="sm" className=" rounded-lg">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Choose file here
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className=" rounded-lg overflow-hidden">
                      <CardHeader className="p-3 rounded-t-lg bg-muted/30 !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">Features Block</CardTitle>
                        <Button variant="blue" size="sm" className=" rounded-lg">
                          <Plus className="mr-2 h-4 w-4" /> Create Feature Block
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                  No feature blocks found
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Discover Section */}
                {activeSection === 'discover' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                          <CardTitle className="text-base font-medium leading-none">Discover</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="discover_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="discover_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="discover_live_demo_link" className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Demo Link</Label>
                                <Input
                                  id="discover_live_demo_link"
                                  value={settings.discover_live_demo_link}
                                  onChange={(e) =>
                                    setSettings({ ...settings, discover_live_demo_link: e.target.value })
                                  }
                                  placeholder="Enter Link"
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="discover_buy_now_link" className="text-sm font-medium text-gray-700 dark:text-gray-300">Buy Now Link</Label>
                                <Input
                                  id="discover_buy_now_link"
                                  value={settings.discover_buy_now_link}
                                  onChange={(e) =>
                                    setSettings({ ...settings, discover_buy_now_link: e.target.value })
                                  }
                                  placeholder="Enter Link"
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className=" rounded-lg overflow-hidden">
                      <CardHeader className="p-3 rounded-t-lg bg-muted/30 !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">Discover List</CardTitle>
                        <Button variant="blue" size="sm" className=" rounded-lg">
                          <Plus className="mr-2 h-4 w-4" /> Create Discover
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {discoverItems.length > 0 ? (
                                discoverItems.map((item, index) => (
                                  <TableRow key={item.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.discover_heading}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteDiscover(item.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No discover items found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Screenshots Section */}
                {activeSection === 'screenshots' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                          <CardTitle className="text-base font-medium leading-none">Screenshots</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="screenshots_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="screenshots_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className=" rounded-lg overflow-hidden">
                      <CardHeader className="p-3 rounded-t-lg bg-muted/30 !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">Screenshots List</CardTitle>
                        <Button variant="blue" size="sm" className=" rounded-lg">
                          <Plus className="mr-2 h-4 w-4" /> Create ScreenShot
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {screenshots.length > 0 ? (
                                screenshots.map((screenshot, index) => (
                                  <TableRow key={screenshot.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{screenshot.screenshots_heading}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteScreenshot(screenshot.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No screenshots found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Pricing Plan Section */}
                {activeSection === 'pricing_plan' && (
                  <form onSubmit={handleSubmit}>
                    <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                          <CardTitle className="text-base font-medium leading-none">Plan Section</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="plan_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="plan_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="plan_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                              <Input
                                id="plan_description"
                                value={settings.plan_description}
                                onChange={(e) =>
                                  setSettings({ ...settings, plan_description: e.target.value })
                                }
                                placeholder="Enter Description"
                                className={modernInputClass}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
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
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                          <CardTitle className="text-base font-medium leading-none">FAQ</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="faq_title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="faq_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="faq_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                              <Input
                                id="faq_description"
                                value={settings.faq_description}
                                onChange={(e) =>
                                  setSettings({ ...settings, faq_description: e.target.value })
                                }
                                placeholder="Enter Description"
                                className={modernInputClass}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className=" rounded-lg overflow-hidden">
                      <CardHeader className="p-3 rounded-t-lg bg-muted/30 !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">FAQ List</CardTitle>
                        <Button variant="blue" size="sm" className=" rounded-lg">
                          <Plus className="mr-2 h-4 w-4" /> Create FAQ
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {faqs.length > 0 ? (
                                faqs.map((faq, index) => (
                                  <TableRow key={faq.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{faq.faq_questions}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteFAQ(faq.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No FAQs found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Testimonials Section */}
                {activeSection === 'testimonials' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                          <CardTitle className="text-base font-medium leading-none">Testimonial</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="testimonials_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="testimonials_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="testimonials_long_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Long Description</Label>
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
                                className={modernTextareaClass}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className=" rounded-lg overflow-hidden">
                      <CardHeader className="p-3 rounded-t-lg bg-muted/30 !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">Testimonials List</CardTitle>
                        <Button variant="blue" size="sm" className=" rounded-lg">
                          <Plus className="mr-2 h-4 w-4" /> Create Testimonial
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {testimonials.length > 0 ? (
                                testimonials.map((testimonial, index) => (
                                  <TableRow key={testimonial.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{testimonial.testimonials_title}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No testimonials found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Join Us Section */}
                {activeSection === 'join_us' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg !flex !flex-row !items-center !justify-between">
                          <CardTitle className="text-base font-medium leading-none">Join User</CardTitle>
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
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="joinus_heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="joinus_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                                <Input
                                  id="joinus_description"
                                  value={settings.joinus_description}
                                  onChange={(e) =>
                                    setSettings({ ...settings, joinus_description: e.target.value })
                                  }
                                  placeholder="Enter Description"
                                  className={modernInputClass}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 flex justify-end">
                          <Button type="submit" variant="blue" className=" rounded-lg">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                          </Button>
                        </CardFooter>
                      </Card>
                    </form>

                    <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg">
                          <CardTitle className="text-base font-medium leading-none">Join Us User</CardTitle>
                        </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {joinUsUsers.length > 0 ? (
                                joinUsUsers.map((user) => (
                                  <TableRow key={user.id}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                          onClick={() => handleDeleteJoinUsUser(user.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                    No join us users found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Custom Page Section */}
                {activeSection === 'custom_page' && (
                  <>
                    <form onSubmit={handleSubmit}>
                      <Card className="rounded-lg">
                        <CardHeader className="p-3 rounded-t-lg">
                          <CardTitle className="text-base font-medium leading-none">Custom Page</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="site_logo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Site Logo</Label>
                                <div className="flex items-center gap-3">
                                  <div className="w-20 h-20 border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/50 flex-shrink-0">
                                    {settings.site_logo ? (
                                      <img
                                        src={settings.site_logo}
                                        alt="Site Logo"
                                        className="max-w-full max-h-full object-contain rounded"
                                      />
                                    ) : (
                                      <span className="text-muted-foreground text-xs">No logo</span>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <Input
                                      id="site_logo"
                                      type="file"
                                      accept="image/*"
                                      className={modernInputClass}
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
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="site_description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Site Description</Label>
                                <div className="pt-5">
                                  <Input
                                    id="site_description"
                                    value={settings.site_description}
                                    onChange={(e) =>
                                      setSettings({ ...settings, site_description: e.target.value })
                                    }
                                    placeholder="Enter Description"
                                    className={modernInputClass}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                      </CardContent>
                      <CardFooter className="p-3 flex justify-end">
                        <Button type="submit" variant="blue" className=" rounded-lg">
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>

                    <Card className=" rounded-lg overflow-hidden">
                      <CardHeader className="p-3 rounded-t-lg bg-muted/30 !flex !flex-row !items-center !justify-between">
                        <CardTitle className="text-base font-medium leading-none">Menu Bar</CardTitle>
                        <Dialog open={createPageDialogOpen} onOpenChange={setCreatePageDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="blue" size="sm" className=" rounded-lg">
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
                                    <Label htmlFor="create_page_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                      className={modernInputClass}
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
                                      <Label htmlFor="create_page_url_input" className="text-sm font-medium text-gray-700 dark:text-gray-300">Page URL</Label>
                                      <Input
                                        id="create_page_url_input"
                                        value={pageFormData.page_url}
                                        onChange={(e) =>
                                          setPageFormData({ ...pageFormData, page_url: e.target.value })
                                        }
                                        placeholder="Enter Page URL"
                                        className={modernInputClass}
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <Label htmlFor="create_page_content_input" className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Content</Label>
                                      <Textarea
                                        id="create_page_content_input"
                                        value={pageFormData.menubar_page_contant}
                                        onChange={(e) =>
                                          setPageFormData({ ...pageFormData, menubar_page_contant: e.target.value })
                                        }
                                        rows={10}
                                        placeholder="Enter Page Content (HTML supported)"
                                        className={modernTextareaClass}
                                      />
                                      <p className="text-xs text-muted-foreground">
                                        You can use HTML tags for formatting (e.g., &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;)
                                      </p>
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
                                  <Button type="submit" variant="blue" className=" rounded-lg">
                                    Create
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="w-32 text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {customPages.length > 0 ? (
                                customPages.map((page, index) => (
                                  <TableRow key={page.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{page.menubar_page_name}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className=" rounded-lg h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
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
                                              className=" rounded-lg h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                              onClick={() => handleDeleteCustomPage(page.id)}
                                            >
                                              <Trash className="h-4 w-4" />
                                            </Button>
                                          )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No custom pages found
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
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
                                <Label htmlFor="edit_page_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                  className={modernInputClass}
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
                                  <Label htmlFor="edit_page_url_input" className="text-sm font-medium text-gray-700 dark:text-gray-300">Page URL</Label>
                                  <Input
                                    id="edit_page_url_input"
                                    value={pageFormData.page_url}
                                    onChange={(e) =>
                                      setPageFormData({ ...pageFormData, page_url: e.target.value })
                                    }
                                    placeholder="Enter Page URL"
                                    className={modernInputClass}
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor="edit_page_content_input" className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Content</Label>
                                  <Textarea
                                    id="edit_page_content_input"
                                    value={pageFormData.menubar_page_contant}
                                    onChange={(e) =>
                                      setPageFormData({ ...pageFormData, menubar_page_contant: e.target.value })
                                    }
                                    rows={10}
                                    placeholder="Enter Page Content (HTML supported)"
                                    className={modernTextareaClass}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    You can use HTML tags for formatting (e.g., &lt;h1&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;)
                                  </p>
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
                              <Button type="submit" variant="blue" className=" rounded-lg">
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
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                  <AlertDialogDescription>
                    {getDeleteMessage()}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => {
                    setDeleteId(null)
                    setDeleteType(null)
                  }}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
    </SidebarProvider>
  )
}
