'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslations } from 'next-intl'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/companies': 'Companies',
  '/plans': 'Plans',
  '/plan_request': 'Plan Request',
  '/referral-program': 'Referral Program',
  '/coupons': 'Coupons',
  '/orders': 'Orders',
  '/email_template': 'Email Templates',
  '/accounting/proposal': 'Penawaran',
  '/contract': 'Kontrak',
  '/projects': 'Proyek',
  '/project_report': 'Project Report',
  '/taskboard': 'Tugas',
  '/bugs-report': 'Bug',
  '/calendar': 'Task Calendar',
  '/support': 'Sistem Dukungan',
  '/deals': 'Deals',
}

export function SiteHeader() {
  const pathname = usePathname()
  const t = useTranslations('dashboard')
  
  // Get page title from mapping or fallback to translation
  // Handle sub-routes like /email_template/[id]
  const basePath = pathname.split('/').slice(0, 2).join('/') || pathname
  const pageTitle = pageTitles[basePath] || pageTitles[pathname] || t('title')

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
