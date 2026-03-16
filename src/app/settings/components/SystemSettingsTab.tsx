"use client"

import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { 
  Palette, 
  Mail, 
  Layout, 
  Sun, 
  FileText, 
  Database, 
  Bell, 
  Shield, 
  Zap, 
  Cloud, 
  Eye, 
  Settings, 
  Key, 
  Globe, 
  MousePointer, 
  Cpu,
  Coins,
  Activity,
  Video,
  MessageSquare,
  Send,
  Phone,
  Inbox,
  Calendar,
  FileSignature,
  FilePlus,
  Award,
  FileCheck,
  Webhook,
  Lock
} from 'lucide-react'

// Section Components
import { BrandSettingsContent } from './system-sections/BrandSettingsContent'
import { SystemSettingsSection } from './system-sections/SystemSettingsContent'
import { CompanySettingsContent } from './system-sections/CompanySettingsContent'
import { CurrencySettingsContent } from './system-sections/CurrencySettingsContent'
import { AccountingPrintSettingsSection } from './system-sections/AccountingPrintSettingsContent'
import { EmailSettingsContent } from './system-sections/EmailSettingsContent'
import { TimeTrackerSettingsContent } from './system-sections/TimeTrackerSettingsContent'
import { PaymentSettingsContent } from './system-sections/PaymentSettingsContent'
import { PusherSettingsContent } from './system-sections/PusherSettingsContent'
import { ReCaptchaSettingsContent } from './system-sections/ReCaptchaSettingsContent'
import { StorageSettingsContent } from './system-sections/StorageSettingsContent'
import { SEOSettingsContent } from './system-sections/SEOSettingsContent'
import { CookieSettingsContent } from './system-sections/CookieSettingsContent'
import { CacheSettingsContent } from './system-sections/CacheSettingsContent'
import { ChatGPTSettingsContent } from './system-sections/ChatGPTSettingsContent'
import { ZoomSettingsContent } from './system-sections/ZoomSettingsContent'
import { SlackSettingsContent } from './system-sections/SlackSettingsContent'
import { TelegramSettingsContent } from './system-sections/TelegramSettingsContent'
import { TwilioSettingsContent } from './system-sections/TwilioSettingsContent'
import { EmailNotificationSettingsContent } from './system-sections/EmailNotificationSettingsContent'
import { LetterTemplateContent } from './system-sections/LetterTemplateContent'
import { GoogleCalendarSettingsContent } from './system-sections/GoogleCalendarSettingsContent'
import { WebhookSettingsContent } from './system-sections/WebhookSettingsContent'
import { IPRestrictionSettingsContent } from './system-sections/IPRestrictionSettingsContent'

const companyMenuItems = [
  { id: 'brand-settings', label: 'Brand Settings', icon: Palette },
  { id: 'system-settings', label: 'System Settings', icon: Settings },
  { id: 'company-settings', label: 'Company Settings', icon: Globe },
  { id: 'currency-settings', label: 'Currency Settings', icon: Coins },
  { id: 'accounting-print-settings', label: 'Accounting Print Settings', icon: FileText },
  { id: 'email-settings', label: 'Email Settings', icon: Mail },
  { id: 'time-tracker-settings', label: 'Time Tracker Settings', icon: Sun },
  { id: 'payment-settings', label: 'Payment Settings', icon: Zap },
  { id: 'pusher-settings', label: 'Pusher Settings', icon: Activity },
  { id: 'recaptcha-settings', label: 'ReCaptcha Settings', icon: Shield },
  { id: 'storage-settings', label: 'Storage Settings', icon: Cloud },
  { id: 'seo-settings', label: 'SEO Settings', icon: Eye },
  { id: 'cookie-settings', label: 'Cookie Settings', icon: MousePointer },
  { id: 'cache-settings', label: 'Cache Settings', icon: Database },
  { id: 'chatgpt-settings', label: 'Chat GPT Settings', icon: Key },
  { id: 'zoom-settings', label: 'Zoom Settings', icon: Video },
  { id: 'slack-settings', label: 'Slack Settings', icon: MessageSquare },
  { id: 'telegram-settings', label: 'Telegram Settings', icon: Send },
  { id: 'twilio-settings', label: 'Twilio Settings', icon: Phone },
  { id: 'email-notification-settings', label: 'Email Notification Settings', icon: Inbox },
  { id: 'offer-letter-settings', label: 'Offer Letter Settings', icon: FileSignature },
  { id: 'joining-letter-settings', label: 'Joining Letter Settings', icon: FilePlus },
  { id: 'experience-certificate-settings', label: 'Experience Certificate Settings', icon: Award },
  { id: 'noc-settings', label: 'NOC Settings', icon: FileCheck },
  { id: 'google-calendar-settings', label: 'Google Calendar Settings', icon: Calendar },
  { id: 'webhook-settings', label: 'Webhook Settings', icon: Webhook },
  { id: 'ip-restriction-settings', label: 'IP Restriction Settings', icon: Lock },
]

const superAdminMenuItems = [
  { id: 'brand-settings', label: 'Brand Settings', icon: Palette },
  { id: 'email-settings', label: 'Email Settings', icon: Mail },
  { id: 'payment-settings', label: 'Payment Settings', icon: Zap },
  { id: 'pusher-settings', label: 'Pusher Settings', icon: Activity },
  { id: 'recaptcha-settings', label: 'ReCaptcha Settings', icon: Shield },
  { id: 'storage-settings', label: 'Storage Settings', icon: Cloud },
  { id: 'seo-settings', label: 'SEO Settings', icon: Eye },
  { id: 'cookie-settings', label: 'Cookie Settings', icon: MousePointer },
  { id: 'cache-settings', label: 'Cache Settings', icon: Database },
  { id: 'chatgpt-settings', label: 'Chat GPT Settings', icon: Key },
]

function SystemSettingsTabContent() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  const menuItems = isSuperAdmin ? superAdminMenuItems : companyMenuItems

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Vertical Sidebar */}
      <div className="lg:col-span-3 lg:sticky lg:top-[80px] self-start z-10 transition-all duration-200">
        <Card className="rounded-xl shadow-none border border-border/50 bg-card overflow-hidden">
          <CardContent 
            className="p-2 max-h-[calc(100vh-140px)] overflow-y-auto" 
            data-slot="settings-sidebar"
          >
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 group"
                  >
                    <div className="p-1.5 rounded-md bg-transparent group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
                    </div>
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">›</span>
                  </a>
                )
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-9 space-y-6">
        {menuItems.some(item => item.id === 'brand-settings') && (
          <div id="brand-settings" key="brand-settings">
            <BrandSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'system-settings') && (
          <div id="system-settings" key="system-settings">
            <SystemSettingsSection />
          </div>
        )}
        {menuItems.some(item => item.id === 'company-settings') && (
          <div id="company-settings" key="company-settings">
            <CompanySettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'currency-settings') && (
          <div id="currency-settings" key="currency-settings">
            <CurrencySettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'accounting-print-settings') && (
          <div id="accounting-print-settings" key="accounting-print-settings">
            <AccountingPrintSettingsSection />
          </div>
        )}
        {menuItems.some(item => item.id === 'email-settings') && (
          <div id="email-settings" key="email-settings">
            <EmailSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'time-tracker-settings') && (
          <div id="time-tracker-settings" key="time-tracker-settings">
            <TimeTrackerSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'payment-settings') && (
          <div id="payment-settings" key="payment-settings">
            <PaymentSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'pusher-settings') && (
          <div id="pusher-settings" key="pusher-settings">
            <PusherSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'recaptcha-settings') && (
          <div id="recaptcha-settings" key="recaptcha-settings">
            <ReCaptchaSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'storage-settings') && (
          <div id="storage-settings" key="storage-settings">
            <StorageSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'seo-settings') && (
          <div id="seo-settings" key="seo-settings">
            <SEOSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'cookie-settings') && (
          <div id="cookie-settings" key="cookie-settings">
            <CookieSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'cache-settings') && (
          <div id="cache-settings" key="cache-settings">
            <CacheSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'chatgpt-settings') && (
          <div id="chatgpt-settings" key="chatgpt-settings">
            <ChatGPTSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'zoom-settings') && (
          <div id="zoom-settings" key="zoom-settings">
            <ZoomSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'slack-settings') && (
          <div id="slack-settings" key="slack-settings">
            <SlackSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'telegram-settings') && (
          <div id="telegram-settings" key="telegram-settings">
            <TelegramSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'twilio-settings') && (
          <div id="twilio-settings" key="twilio-settings">
            <TwilioSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'email-notification-settings') && (
          <div id="email-notification-settings" key="email-notification-settings">
            <EmailNotificationSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'offer-letter-settings') && (
          <div id="offer-letter-settings" key="offer-letter-settings">
            <LetterTemplateContent title="Offer Letter Settings" field="offer_letter" />
          </div>
        )}
        {menuItems.some(item => item.id === 'joining-letter-settings') && (
          <div id="joining-letter-settings" key="joining-letter-settings">
            <LetterTemplateContent title="Joining Letter Settings" field="joining_letter" />
          </div>
        )}
        {menuItems.some(item => item.id === 'experience-certificate-settings') && (
          <div id="experience-certificate-settings" key="experience-certificate-settings">
            <LetterTemplateContent title="Experience Certificate Settings" field="experience_certificate" />
          </div>
        )}
        {menuItems.some(item => item.id === 'noc-settings') && (
          <div id="noc-settings" key="noc-settings">
            <LetterTemplateContent title="NOC Settings" field="noc" />
          </div>
        )}
        {menuItems.some(item => item.id === 'google-calendar-settings') && (
          <div id="google-calendar-settings" key="google-calendar-settings">
            <GoogleCalendarSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'webhook-settings') && (
          <div id="webhook-settings" key="webhook-settings">
            <WebhookSettingsContent />
          </div>
        )}
        {menuItems.some(item => item.id === 'ip-restriction-settings') && (
          <div id="ip-restriction-settings" key="ip-restriction-settings">
            <IPRestrictionSettingsContent />
          </div>
        )}
      </div>
    </div>
  )
}

export function SystemSettingsTab() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SystemSettingsTabContent />
    </Suspense>
  )
}
