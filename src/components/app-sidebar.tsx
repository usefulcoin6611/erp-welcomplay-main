"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'

import { SidebarMenu } from '@/components/SidebarMenu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
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

  // Debug log to verify role-based menus are working
  React.useEffect(() => {
    if (user) {
      console.log('Current User Role:', user.type)
      console.log('Menu Items Count:', menuData.navMain.length)
    }
  }, [user, menuData])

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
      <SidebarHeader>
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:!p-1.5"
        >
          <a href="#">
            <div className="flex flex-col items-start flex-1">
              <span className="text-base font-semibold">WelcomplayERP</span>
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
