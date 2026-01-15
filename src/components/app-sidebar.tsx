"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import { IconBriefcase } from "@tabler/icons-react";

import { SidebarMenu } from '@/components/SidebarMenu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'
import { useAuth } from '@/contexts/auth-context'
import { getMenuByRole } from '@/lib/menu-config'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('sidebar.menu');
  const { user } = useAuth()
  
  // Get menu based on user role
  const menuData = user ? getMenuByRole(user.type, t) : { navMain: [], navSecondary: [] }
  
  // Debug log to verify role-based menus are working
  React.useEffect(() => {
    if (user) {
      console.log('Current User Role:', user.type)
      console.log('Menu Items Count:', menuData.navMain.length)
    }
  }, [user, menuData])
  
  const data = {
    user: {
      name: user?.name || "Guest",
      email: user?.email || "guest@example.com",
      avatar: "/avatars/logo.png",
    },
    navMain: menuData.navMain,
    navSecondary: menuData.navSecondary,
  }
  
  // Get role badge styling
  const getRoleBadgeStyle = () => {
    if (!user) return { color: 'bg-gray-100 text-gray-600', label: 'Guest' }
    
    const styles: Record<string, { color: string; label: string }> = {
      'super admin': { color: 'bg-red-100 text-red-700', label: 'Super Admin' },
      'company': { color: 'bg-blue-100 text-blue-700', label: 'Company' },
      'client': { color: 'bg-green-100 text-green-700', label: 'Client' },
      'employee': { color: 'bg-purple-100 text-purple-700', label: 'Employee' },
    }
    
    return styles[user.type] || { color: 'bg-gray-100 text-gray-600', label: user.type }
  }
  
  const roleBadge = getRoleBadgeStyle()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        {/* SidebarMenu requires 'items' prop, so remove this usage */}
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:!p-1.5"
        >
          <a href="#">
            <IconBriefcase className="!size-5" />
            <div className="flex flex-col items-start flex-1">
              <span className="text-base font-semibold">WelcomplayERP</span>
              {user && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${roleBadge.color} font-medium`}>
                  {roleBadge.label}
                </span>
              )}
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
