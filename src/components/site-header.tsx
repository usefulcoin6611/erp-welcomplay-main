'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { LanguageSwitcher } from '@/components/language-switcher'
import { SearchInput } from '@/components/ui/search-input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/auth-context'
import { getMenuByRole } from '@/lib/menu-config'
import type { MenuItem } from '@/lib/menu-config'

type FlatMenuItem = { title: string; url: string; breadcrumb: string }

function flattenMenuItems(items: MenuItem[], parentPath: string[] = []): FlatMenuItem[] {
  const result: FlatMenuItem[] = []
  function walk(nodes: MenuItem[], path: string[]) {
    for (const node of nodes) {
      const currentPath = path.length > 0 ? [...path, node.title] : [node.title]
      if (node.url && node.url !== '#') {
        result.push({
          title: node.title,
          url: node.url,
          breadcrumb: path.length > 0 ? path.join(' › ') : '',
        })
      }
      if (node.items?.length) {
        walk(node.items, currentPath)
      }
    }
  }
  walk(items, parentPath)
  return result
}

export function SiteHeader() {
  const t = useTranslations('header')
  const tMenu = useTranslations('sidebar.menu')
  const { sidebarSearchQuery, setSidebarSearchQuery } = useSidebar()
  const { user } = useAuth()
  const router = useRouter()

  const menuData = user ? getMenuByRole(user.type, tMenu) : { navMain: [], navSecondary: [] }
  const allItems = useMemo(
    () => [
      ...flattenMenuItems(menuData.navMain),
      ...flattenMenuItems(menuData.navSecondary),
    ],
    [menuData.navMain, menuData.navSecondary]
  )

  const filteredItems = useMemo(() => {
    const q = sidebarSearchQuery.trim().toLowerCase()
    if (!q) return []
    return allItems.filter((item) => item.title.toLowerCase().includes(q)).slice(0, 12)
  }, [allItems, sidebarSearchQuery])

  const hasQuery = sidebarSearchQuery.trim().length > 0
  const showDropdown = hasQuery

  const handleSelect = useCallback(
    (url: string) => {
      setSidebarSearchQuery('')
      router.push(url)
    },
    [router, setSidebarSearchQuery]
  )

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 shrink-0"
        />
        <Popover
          open={showDropdown}
          onOpenChange={(open) => {
            if (!open) setSidebarSearchQuery('')
          }}
        >
          <PopoverAnchor asChild>
            <div className="w-48 sm:w-56 md:w-64 shrink-0 relative">
              <SearchInput
                type="search"
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                placeholder={t('searchMenuPlaceholder')}
                aria-label={t('searchMenuPlaceholder')}
                aria-expanded={showDropdown}
                aria-autocomplete="list"
                aria-controls="navbar-search-results"
                id="navbar-search-input"
                className="h-9 bg-gray-100 hover:bg-gray-200 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors"
              />
            </div>
          </PopoverAnchor>
          <PopoverContent
            id="navbar-search-results"
            className="w-48 sm:w-56 md:w-64 p-0 rounded-lg shadow-md"
            align="start"
            sideOffset={6}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false} className="rounded-lg border-0 shadow-none">
              <CommandList className="max-h-[320px] overflow-y-auto">
                <CommandEmpty className="py-8 text-sm text-muted-foreground text-center px-4">
                  No menu found.
                </CommandEmpty>
                {filteredItems.length > 0 && (
                  <CommandGroup className="p-0 [&_[cmdk-group-heading]]:hidden">
                    <div className="px-3 pt-3 pb-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t('searchMenuResults')}
                      </p>
                    </div>
                    <div className="px-2 pb-3 space-y-0.5">
                      {filteredItems.map((item) => (
                        <CommandItem
                          key={item.url}
                          value={`${item.title} ${item.breadcrumb} ${item.url}`}
                          onSelect={() => handleSelect(item.url)}
                          className="cursor-pointer rounded-md px-3 py-2.5 text-sm flex flex-col items-start gap-0.5"
                        >
                          <span className="font-medium">{item.title}</span>
                          {item.breadcrumb ? (
                            <span className="text-xs text-muted-foreground truncate w-full">
                              {item.breadcrumb}
                            </span>
                          ) : null}
                        </CommandItem>
                      ))}
                    </div>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
