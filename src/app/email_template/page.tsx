"use client"

import { useState, useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Eye, Search, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { SimplePagination } from '@/components/ui/simple-pagination'

// Types
interface EmailTemplate {
  id: string
  name: string
  is_active?: boolean
}

// Mock data
const mockEmailTemplates: EmailTemplate[] = [
  { id: '1', name: 'New User', is_active: true },
  { id: '2', name: 'New Invoice', is_active: false },
  { id: '3', name: 'Payment Reminder', is_active: true },
  { id: '4', name: 'Payment Success', is_active: true },
  { id: '5', name: 'Invoice Sent', is_active: false },
  { id: '6', name: 'New Proposal', is_active: true },
  { id: '7', name: 'Proposal Accepted', is_active: true },
  { id: '8', name: 'Proposal Rejected', is_active: false },
  { id: '9', name: 'New Task', is_active: true },
  { id: '10', name: 'Task Completed', is_active: true },
]

export default function EmailTemplatePage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  const isCompany = user?.type === 'company'

  // Search and pagination states
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return mockEmailTemplates

    const q = search.trim().toLowerCase()
    return mockEmailTemplates.filter((template) =>
      template.name.toLowerCase().includes(q)
    )
  }, [search])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  // Pagination calculations
  const totalRecords = filteredData.length

  const handleToggle = (id: string, currentValue: boolean) => {
    console.log('Toggle email template:', id, !currentValue)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
            {/* Email Templates Table */}
            <Card>
              <CardContent className="p-0">
                {/* Title and Search - Top (right aligned) */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Email Template</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search email templates..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                    />
                    {search.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => handleSearchChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium">
                          {isCompany ? 'On / Off' : 'Action'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((template) => (
                          <tr key={template.id} className="border-t hover:bg-muted/50">
                            <td className="px-4 py-3">{template.name}</td>
                            <td className="px-4 py-3">
                              {isSuperAdmin ? (
                                <Link href={`/email_template/${template.id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              ) : (
                                <Switch
                                  checked={template.is_active || false}
                                  onCheckedChange={(checked) =>
                                    handleToggle(template.id, template.is_active || false)
                                  }
                                />
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No email templates found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalRecords > 0 && (
                  <div className="px-4 py-3 border-t">
                    <SimplePagination
                      currentPage={currentPage}
                      totalCount={totalRecords}
                      onPageChange={setCurrentPage}
                      pageSize={pageSize}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}


