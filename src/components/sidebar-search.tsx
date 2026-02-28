"use client"

import { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { SearchInput } from "@/components/ui/search-input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { getMenuByRole } from "@/lib/menu-config"
import type { MenuItem } from "@/lib/menu-config"

type FlatMenuItem = { title: string; url: string; breadcrumb: string }

function flattenMenuItems(items: MenuItem[], parentPath: string[] = []): FlatMenuItem[] {
  const result: FlatMenuItem[] = []
  function walk(nodes: MenuItem[], path: string[]) {
    for (const node of nodes) {
      const currentPath = path.length > 0 ? [...path, node.title] : [node.title]
      if (node.url && node.url !== "#") {
        result.push({
          title: node.title,
          url: node.url,
          breadcrumb: path.length > 0 ? path.join(" › ") : "",
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

export function SidebarSearch() {
  const t = useTranslations("header")
  const tMenu = useTranslations("sidebar.menu")
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
      setSidebarSearchQuery("")
      router.push(url)
    },
    [router, setSidebarSearchQuery]
  )

  return (
    <Popover
      open={showDropdown}
      onOpenChange={(open) => {
        if (!open) setSidebarSearchQuery("")
      }}
    >
      <PopoverAnchor asChild>
        <div className="px-2 pt-3 pb-1.5 text-sidebar-foreground [&_[class*='text-muted']]:text-sidebar-foreground/70">
          <SearchInput
            type="search"
            value={sidebarSearchQuery}
            onChange={(e) => setSidebarSearchQuery(e.target.value)}
            placeholder={t("searchMenuPlaceholder")}
            aria-label={t("searchMenuPlaceholder")}
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="sidebar-search-results"
            id="sidebar-search-input"
            className="h-9 w-full pl-9 bg-white text-sidebar-foreground placeholder:text-sidebar-foreground/60 border border-sidebar-border/70 rounded-lg shadow-none focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-sidebar-border/60 focus-visible:ring-offset-0 transition-colors"
            containerClassName="w-full"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        id="sidebar-search-results"
        className="w-[var(--radix-popover-trigger-width)] min-w-[12rem] max-w-[18rem] p-0 rounded-lg shadow-lg border border-border bg-popover text-popover-foreground"
        align="start"
        side="bottom"
        sideOffset={4}
        alignOffset={0}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="rounded-lg border-0 shadow-none">
          <CommandList className="max-h-[320px] overflow-y-auto">
            <CommandEmpty className="py-6 text-sm text-muted-foreground text-center px-4">
              No menu found.
            </CommandEmpty>
            {filteredItems.length > 0 && (
              <CommandGroup className="p-0 [&_[cmdk-group-heading]]:hidden">
                <div className="px-3 pt-3 pb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("searchMenuResults")}
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
  )
}
