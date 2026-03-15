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
import { getMenuByRole, filterMenuByPermissions } from '@/lib/menu-config'
import type { MenuItem } from '@/lib/menu-config'
import { hasRouteAccess } from '@/lib/permission-utils'

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

function injectBadgeIntoItems(items: MenuItem[], url: string, badge: number): MenuItem[] {
  if (badge <= 0) return items
  return items.map((item) => {
    if (item.url === url) {
      return { ...item, badge }
    }
    if (item.items?.length) {
      return { ...item, items: injectBadgeIntoItems(item.items, url, badge) }
    }
    return item
  })
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('sidebar.menu')
  const { user } = useAuth()
  const { sidebarSearchQuery } = useSidebar()
  const [messengerUnreadCount, setMessengerUnreadCount] = React.useState(0)

  // Poll messenger unread count for sidebar badge
  React.useEffect(() => {
    if (!user) return
    const fetchUnread = () => {
      fetch('/api/messenger/unread-count')
        .then((r) => r.json())
        .then((json) => {
          if (json?.success && typeof json.count === 'number') {
            setMessengerUnreadCount(json.count)
          }
        })
        .catch(() => { })
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [user])

  // Get menu based on user role
  const menuByRole = React.useMemo(
    () => (user ? getMenuByRole(user.type, t) : { navMain: [], navSecondary: [] }),
    [user?.type, t]
  )

  // When employee: filter by permissions if profile loaded; show minimal menu until permissions loaded to avoid leaking HRM
  const menuData = React.useMemo(() => {
    let navMain: MenuItem[]
    if (user?.type === 'employee') {
      if (user.permissions === undefined || user.permissions === null) {
        // Permissions not yet loaded OR no profile: show minimal to avoid wrong access (e.g. HRM dashboard for non-HRM)
        navMain = filterMenuByPermissions(menuByRole.navMain, [])
      } else {
        navMain = filterMenuByPermissions(menuByRole.navMain, user.permissions)
      }
      // Always show Support System, Zoom Meeting, and Messenger for employee
      const alwaysShowUrls = ['/attendance', '/support', '/zoom', '/messenger']
      const existingUrls = new Set(navMain.map((item) => item.url))
      const toAppend = menuByRole.navMain.filter(
        (item) => item.url && alwaysShowUrls.includes(item.url) && !existingUrls.has(item.url)
      )
      navMain = [...navMain, ...toAppend]
    } else {
      navMain = menuByRole.navMain
    }

    // Filter by plan access for all roles (Soft Locking in UI)
    const filterByPlan = (items: MenuItem[]): MenuItem[] => {
      return (items || [])
        .map(item => {
           // If item has children, filter children first
           if (item.items?.length) {
             const filteredChildren = filterByPlan(item.items)
             // If all children hidden, check if the parent itself has a URL we can check
             if (filteredChildren.length === 0 && item.url === '#') return null
             return { ...item, items: filteredChildren }
           }
           
           // Check access for direct URL
           if (item.url && item.url !== '#') {
             if (!hasRouteAccess(item.url, user as any)) return null
           }
           
           return item
        })
        .filter((item): item is MenuItem => item !== null)
    }

    navMain = filterByPlan(navMain)
    navMain = injectBadgeIntoItems(navMain, '/messenger', messengerUnreadCount)
    return { ...menuByRole, navMain }
  }, [user, user?.type, user?.permissions, user?.plan, user?.planExpireDate, menuByRole, messengerUnreadCount])

  const filteredNavMain = React.useMemo(
    () => filterMenuByQuery(menuData.navMain, sidebarSearchQuery),
    [menuData.navMain, sidebarSearchQuery]
  )

  const data = {
    user: {
      name: user?.name || "Guest",
      email: user?.email || "guest@example.com",
      avatar: "",
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
              N
            </div>
            <span className="text-base font-semibold text-sidebar-foreground truncate">Nexus ERP</span>
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
