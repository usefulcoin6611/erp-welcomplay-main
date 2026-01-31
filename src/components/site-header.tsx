'use client'

import { usePathname, useSearchParams } from 'next/navigation'
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
  '/accounting/setup/custom-field': 'Accounting Setup',
  '/contract': 'Kontrak',
  '/projects': 'Proyek',
  '/project_report': 'Project Report',
  '/taskboard': 'Tugas',
  '/bugs-report': 'Bug',
  '/calendar': 'Task Calendar',
  '/support': 'Sistem Dukungan',
  '/deals': 'Deals',
  '/hrm/assets': 'Assets',
}

function humanizeSlug(value: string) {
  return value
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getPageTitleFromPath(pathname: string, fallbackTitle: string) {
  const parts = pathname.split('/').filter(Boolean)
  // Find the longest matching prefix from pageTitles
  for (let i = parts.length; i > 0; i--) {
    const candidate = `/${parts.slice(0, i).join('/')}`
    if (pageTitles[candidate]) return pageTitles[candidate]
  }

  // If not found, fallback to humanized last segment (better than showing Dashboard everywhere)
  if (parts.length > 0) return humanizeSlug(parts[parts.length - 1])
  return fallbackTitle
}

export function SiteHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('dashboard')
  
  const baseTitle = getPageTitleFromPath(pathname, t('title'))

  const tab = searchParams.get('tab')
  const tabTitle = tab ? humanizeSlug(tab) : ''
  const pageTitle = tabTitle ? `${baseTitle} / ${tabTitle}` : baseTitle

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
