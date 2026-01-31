"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

// Types
interface EmailTemplate {
  id: string
  name: string
  from: string
  subject: string
  content: string
  variables: Record<string, string>
}

// Mock data - sesuai dengan template names di page.tsx
const mockTemplates: Record<string, EmailTemplate> = {
  '1': {
    id: '1',
    name: 'New User',
    from: 'erpgo_saas',
    subject: 'Welcome to {app_name}!',
    content: `Hello {user_name},

Welcome to {app_name}! Your account has been created successfully.

Your login credentials:
Email: {user_email}
Password: {user_password}

Please login and change your password for security.

Best regards,
{company_name}`,
    variables: {
      'App Name': 'app_name',
      'User Name': 'user_name',
      'User Email': 'user_email',
      'User Password': 'user_password',
      'Company Name': 'company_name',
    },
  },
  '2': {
    id: '2',
    name: 'New Invoice',
    from: 'erpgo_saas',
    subject: 'New Invoice #{invoice_number}',
    content: `Dear {client_name},

A new invoice has been created for you.

Invoice Details:
Invoice Number: {invoice_number}
Amount: {invoice_amount}
Due Date: {due_date}

Please make payment before the due date.

Thank you,
{company_name}`,
    variables: {
      'Client Name': 'client_name',
      'Invoice Number': 'invoice_number',
      'Invoice Amount': 'invoice_amount',
      'Due Date': 'due_date',
      'Company Name': 'company_name',
    },
  },
  '3': {
    id: '3',
    name: 'Payment Reminder',
    from: 'erpgo_saas',
    subject: 'Payment Reminder - Invoice #{invoice_number}',
    content: `Dear {client_name},

This is a reminder that your invoice #{invoice_number} is due.

Amount Due: {invoice_amount}
Due Date: {due_date}

Please make payment as soon as possible.

Thank you,
{company_name}`,
    variables: {
      'Client Name': 'client_name',
      'Invoice Number': 'invoice_number',
      'Invoice Amount': 'invoice_amount',
      'Due Date': 'due_date',
      'Company Name': 'company_name',
    },
  },
  '4': {
    id: '4',
    name: 'Payment Success',
    from: 'erpgo_saas',
    subject: 'Payment Received - Invoice #{invoice_number}',
    content: `Dear {client_name},

Thank you for your payment!

Payment Details:
Invoice Number: {invoice_number}
Amount Paid: {payment_amount}
Payment Date: {payment_date}
Payment Method: {payment_method}

Your payment has been successfully processed.

Best regards,
{company_name}`,
    variables: {
      'Client Name': 'client_name',
      'Invoice Number': 'invoice_number',
      'Payment Amount': 'payment_amount',
      'Payment Date': 'payment_date',
      'Payment Method': 'payment_method',
      'Company Name': 'company_name',
    },
  },
  '5': {
    id: '5',
    name: 'Invoice Sent',
    from: 'erpgo_saas',
    subject: 'Invoice #{invoice_number} has been sent',
    content: `Dear {client_name},

Your invoice #{invoice_number} has been sent.

Invoice Details:
Amount: {invoice_amount}
Due Date: {due_date}

You can view and pay the invoice using the link below:
{invoice_link}

Thank you,
{company_name}`,
    variables: {
      'Client Name': 'client_name',
      'Invoice Number': 'invoice_number',
      'Invoice Amount': 'invoice_amount',
      'Due Date': 'due_date',
      'Invoice Link': 'invoice_link',
      'Company Name': 'company_name',
    },
  },
  '6': {
    id: '6',
    name: 'New Proposal',
    from: 'erpgo_saas',
    subject: 'New Proposal: {proposal_title}',
    content: `Dear {client_name},

A new proposal has been created for you.

Proposal Details:
Title: {proposal_title}
Amount: {proposal_amount}
Valid Until: {valid_until}

Please review the proposal and let us know if you have any questions.

Best regards,
{company_name}`,
    variables: {
      'Client Name': 'client_name',
      'Proposal Title': 'proposal_title',
      'Proposal Amount': 'proposal_amount',
      'Valid Until': 'valid_until',
      'Company Name': 'company_name',
    },
  },
  '7': {
    id: '7',
    name: 'Proposal Accepted',
    from: 'erpgo_saas',
    subject: 'Proposal Accepted: {proposal_title}',
    content: `Dear {client_name},

Great news! Your proposal "{proposal_title}" has been accepted.

Proposal Details:
Amount: {proposal_amount}
Accepted Date: {accepted_date}

We will proceed with the next steps.

Thank you,
{company_name}`,
    variables: {
      'Client Name': 'client_name',
      'Proposal Title': 'proposal_title',
      'Proposal Amount': 'proposal_amount',
      'Accepted Date': 'accepted_date',
      'Company Name': 'company_name',
    },
  },
  '8': {
    id: '8',
    name: 'Proposal Rejected',
    from: 'erpgo_saas',
    subject: 'Proposal Update: {proposal_title}',
    content: `Dear {client_name},

Thank you for submitting the proposal "{proposal_title}".

Unfortunately, this proposal has been rejected.

We appreciate your interest and look forward to future opportunities.

Best regards,
{company_name}`,
    variables: {
      'Client Name': 'client_name',
      'Proposal Title': 'proposal_title',
      'Company Name': 'company_name',
    },
  },
  '9': {
    id: '9',
    name: 'New Task',
    from: 'erpgo_saas',
    subject: 'New Task Assigned: {task_name}',
    content: `Hello {user_name},

A new task has been assigned to you.

Task Details:
Task Name: {task_name}
Project: {project_name}
Due Date: {due_date}
Priority: {priority}

Please check your dashboard for more details.

Best regards,
{company_name}`,
    variables: {
      'User Name': 'user_name',
      'Task Name': 'task_name',
      'Project Name': 'project_name',
      'Due Date': 'due_date',
      'Priority': 'priority',
      'Company Name': 'company_name',
    },
  },
  '10': {
    id: '10',
    name: 'Task Completed',
    from: 'erpgo_saas',
    subject: 'Task Completed: {task_name}',
    content: `Hello {user_name},

The task "{task_name}" has been completed.

Task Details:
Task Name: {task_name}
Completed By: {completed_by}
Completion Date: {completion_date}

Great job!

Best regards,
{company_name}`,
    variables: {
      'User Name': 'user_name',
      'Task Name': 'task_name',
      'Completed By': 'completed_by',
      'Completion Date': 'completion_date',
      'Company Name': 'company_name',
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

export default function EmailTemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const template = mockTemplates[templateId] || mockTemplates['1']
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [formData, setFormData] = useState({
    name: template.name,
    from: template.from,
    subject: template.subject,
    content: template.content,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    // Show success message or redirect
    alert('Email template saved successfully!')
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
        <div className="flex flex-1 flex-col bg-gray-50">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 shadow-none"
                >
                  <Link href="/email_template">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold">{template.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage email template settings
                  </p>
                </div>
              </div>
            </div>

            {/* Name and Variables Layout */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Name Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    Name
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="New User"
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-sm font-medium">From</Label>
                      <Input
                        id="from"
                        value={formData.from}
                        onChange={(e) =>
                          setFormData({ ...formData, from: e.target.value })
                        }
                        placeholder="erpgo_saas"
                        className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" variant="blue" className="shadow-none">
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Variables Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    Variables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(template.variables).map(([label, variable]) => (
                      <div key={variable} className="flex items-center gap-2 text-sm">
                        <span className="text-foreground">{label} :</span>
                        <code className="text-blue-600 font-mono font-semibold">{`{${variable}}`}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">

              {/* Language Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {languages.map((lang) => (
                        <button
                          key={lang.key}
                          onClick={() => setSelectedLanguage(lang.key)}
                          className={cn(
                            'px-4 py-3 text-left text-sm transition-colors',
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

              {/* Form Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">
                          Email Subject <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          required
                          placeholder="Enter email subject. Use {variable_name} for variables."
                          className="focus-visible:ring-blue-500 focus-visible:border-blue-500"
                        />
                        <p className="text-xs text-muted-foreground">
                          Use variables in curly braces like {'{variable_name}'} to insert dynamic content.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-medium">
                          Email Content <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) =>
                            setFormData({ ...formData, content: e.target.value })
                          }
                          rows={12}
                          required
                          className="font-mono text-sm focus-visible:ring-blue-500 focus-visible:border-blue-500"
                          placeholder="Enter email content. Use {variable_name} for variables."
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
