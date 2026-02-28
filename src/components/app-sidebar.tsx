"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'

import { SidebarMenu } from "@/components/SidebarMenu"
import { SidebarSearch } from "@/components/sidebar-search"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from '@/contexts/auth-context'
import { getMenuByRole } from '@/lib/menu-config'
import type { MenuItem } from '@/lib/menu-config'

function filterMenuByQuery(items: MenuItem[], query: string): MenuItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items
    .filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q)
      if (item.items?.length) {
        const hasMatchingChild = item.items.some(
          (child) =>
            child.title.toLowerCase().includes(q) ||
            (child.items?.length &&
              filterMenuByQuery(child.items, query).length > 0)
        )
        if (hasMatchingChild) return true
      }
      return titleMatch
    })
    .map((item) => {
      if (!item.items?.length) return item
      const filteredChildren = filterMenuByQuery(item.items, query)
      return { ...item, items: filteredChildren }
    })
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('sidebar.menu')
  const { user } = useAuth()
  const { sidebarSearchQuery } = useSidebar()

  // Get menu based on user role
  const menuData = user ? getMenuByRole(user.type, t) : { navMain: [], navSecondary: [] }

  const filteredNavMain = React.useMemo(
    () => filterMenuByQuery(menuData.navMain, sidebarSearchQuery),
    [menuData.navMain, sidebarSearchQuery]
  )

  const data = {
    user: {
      name: user?.name || "Guest",
      email: user?.email || "guest@example.com",
      avatar: "/avatars/logo.png",
    },
    navMain: filteredNavMain,
    navSecondary: menuData.navSecondary,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/80 bg-sidebar/80">
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:!px-3 !py-3 rounded-lg hover:bg-sidebar-accent"
        >
          <a href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-semibold text-sm">
              W
            </div>
            <span className="text-base font-semibold text-sidebar-foreground truncate">Welcomplay ERP</span>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin">
        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarSearch />
        </div>
        <SidebarMenu items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/80 bg-sidebar/50 pt-2">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
