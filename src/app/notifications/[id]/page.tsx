"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface NotificationTemplate {
  id: string
  name: string
  content: string
  variables: Record<string, string>
}

// Mock data
const mockTemplates: Record<string, NotificationTemplate> = {
  '1': {
    id: '1',
    name: 'New User Registration',
    content: 'Hello {user_name}, welcome to our system! Your account has been created successfully.',
    variables: {
      'User Name': 'user_name',
      'Email': 'email',
      'Registration Date': 'registration_date',
    },
  },
  '2': {
    id: '2',
    name: 'Invoice Created',
    content: 'Dear {client_name}, your invoice {invoice_number} has been created. Amount: {invoice_amount}',
    variables: {
      'Client Name': 'client_name',
      'Invoice Number': 'invoice_number',
      'Invoice Amount': 'invoice_amount',
      'Due Date': 'due_date',
    },
  },
  '3': {
    id: '3',
    name: 'Payment Received',
    content: 'Payment of {payment_amount} has been received for invoice {invoice_number}. Thank you!',
    variables: {
      'Payment Amount': 'payment_amount',
      'Invoice Number': 'invoice_number',
      'Payment Date': 'payment_date',
    },
  },
  '4': {
    id: '4',
    name: 'Project Assigned',
    content: 'You have been assigned to project {project_name}. Please check your dashboard for details.',
    variables: {
      'Project Name': 'project_name',
      'Assigned By': 'assigned_by',
      'Start Date': 'start_date',
    },
  },
  '5': {
    id: '5',
    name: 'Task Completed',
    content: 'Task {task_name} has been completed by {completed_by}. Great job!',
    variables: {
      'Task Name': 'task_name',
      'Completed By': 'completed_by',
      'Completion Date': 'completion_date',
    },
  },
  '6': {
    id: '6',
    name: 'Leave Request',
    content: 'Your leave request from {start_date} to {end_date} has been {status}.',
    variables: {
      'Start Date': 'start_date',
      'End Date': 'end_date',
      'Status': 'status',
      'Leave Type': 'leave_type',
    },
  },
  '7': {
    id: '7',
    name: 'Meeting Reminder',
    content: 'Reminder: You have a meeting "{meeting_title}" scheduled at {meeting_time}.',
    variables: {
      'Meeting Title': 'meeting_title',
      'Meeting Time': 'meeting_time',
      'Meeting Link': 'meeting_link',
    },
  },
  '8': {
    id: '8',
    name: 'Password Reset',
    content: 'Click the link below to reset your password: {reset_link}. This link will expire in 24 hours.',
    variables: {
      'Reset Link': 'reset_link',
      'Expiry Time': 'expiry_time',
    },
  },
}

const languages = [
  { key: 'en', label: 'English' },
  { key: 'id', label: 'Indonesian' },
  { key: 'es', label: 'Spanish' },
  { key: 'fr', label: 'French' },
  { key: 'de', label: 'German' },
]

export default function NotificationTemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string
  
  const template = mockTemplates[templateId] || mockTemplates['1']
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [formData, setFormData] = useState({
    name: template.name,
    content: template.content,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    // Show success message or redirect
    alert('Template saved successfully!')
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                  <CardDescription>
                    Manage notification template settings.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6">
                <CardTitle>Variables</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2">
                <div className="space-y-2 text-sm">
                  {Object.entries(template.variables).map(([label, variable]) => (
                    <div
                      key={variable}
                      className="grid grid-cols-[1fr_auto] items-center gap-3 border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <code className="text-primary font-mono rounded-md bg-blue-50 px-2 py-0.5">
                        {`{${variable}}`}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] sticky top-4">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-sm">Language</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {languages.map((lang) => (
                        <button
                          key={lang.key}
                          onClick={() => setSelectedLanguage(lang.key)}
                          className={cn(
                            'px-4 py-3 text-left text-sm transition-colors border-t',
                            selectedLanguage === lang.key
                              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500'
                              : 'text-foreground hover:bg-blue-50/50 hover:text-blue-700'
                          )}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardHeader className="px-6">
                    <CardTitle>Template Content</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">
                          Notification Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                          }
                          rows={10}
                          required
                          className="font-mono text-sm"
                          placeholder="Enter notification message. Use {variable_name} for variables."
                        />
                        <p className="text-xs text-muted-foreground">
                          Use variables in curly braces like {'{variable_name}'} to insert dynamic content.
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" variant="blue" className="shadow-none">
                          <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}




