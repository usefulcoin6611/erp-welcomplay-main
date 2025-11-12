"use client"

import { ChevronRight } from "lucide-react"
import { type Icon as TablerIcon } from "@tabler/icons-react"
import { useState, useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

type NavItem = {
  title: string
  url: string
  icon?: TablerIcon
  isActive?: boolean
  items?: NavItem[]
}

// Helper function to check if URL matches current pathname
function isUrlActive(url: string, pathname: string): boolean {
  // Exact match
  if (url === pathname) return true
  // Prefix match for nested routes (e.g., /accounting matches /accounting/reports)
  if (pathname.startsWith(url) && url !== '#' && url !== '/') return true
  return false
}

// Helper function to check if any child item is active
function hasActiveChild(item: NavItem, pathname: string): boolean {
  if (isUrlActive(item.url, pathname)) return true
  if (item.isActive) return true
  if (item.items) {
    return item.items.some(child => hasActiveChild(child, pathname))
  }
  return false
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  // Calculate which items should be open based on active path
  const getItemsToOpen = useMemo(() => {
    const toOpen: Record<string, boolean> = {}
    items.forEach((item) => {
      const itemKey = `main-${item.title}`
      if (hasActiveChild(item, pathname)) {
        toOpen[itemKey] = true
        
        // Also open sub-items if they have active children
        item.items?.forEach((subItem) => {
          const subItemKey = `sub-${item.title}-${subItem.title}`
          if (hasActiveChild(subItem, pathname)) {
            toOpen[subItemKey] = true
          }
        })
      }
    })
    return toOpen
  }, [pathname, items])

  // Initialize open state on mount
  useEffect(() => {
    setOpenItems(prev => {
      // On initial mount, just use items to open
      if (Object.keys(prev).length === 0) {
        return getItemsToOpen
      }
      
      // On navigation, merge with existing state
      // This preserves manually opened dropdowns
      return { ...prev, ...getItemsToOpen }
    })
  }, [getItemsToOpen])

  const handleToggle = (key: string, hasActive: boolean) => (open: boolean) => {
    // If trying to close a dropdown that contains active item, prevent it
    if (!open && hasActive) {
      return
    }
    
    // Otherwise, update the state
    setOpenItems(prev => ({ ...prev, [key]: open }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const itemKey = `main-${item.title}`
            const hasActiveItem = hasActiveChild(item, pathname)
            // Use ?? false to handle undefined state properly
            const isMainOpen = hasActiveItem || (openItems[itemKey] ?? false)
            const isMainActive = isUrlActive(item.url, pathname) && !item.items
            
            return (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  <Collapsible
                    open={isMainOpen}
                    onOpenChange={handleToggle(itemKey, hasActiveItem)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="w-full" isActive={hasActiveItem}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                          isMainOpen ? 'rotate-90' : ''
                        }`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const subItemKey = `sub-${item.title}-${subItem.title}`
                          const hasActiveSubItem = hasActiveChild(subItem, pathname)
                          // Use ?? false to handle undefined state properly
                          const isSubOpen = hasActiveSubItem || (openItems[subItemKey] ?? false)
                          const isSubActive = isUrlActive(subItem.url, pathname) && !subItem.items
                          
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              {subItem.items ? (
                                <Collapsible
                                  open={isSubOpen}
                                  onOpenChange={handleToggle(subItemKey, hasActiveSubItem)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton className="w-full" isActive={hasActiveSubItem}>
                                      <span>{subItem.title}</span>
                                      <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                        isSubOpen ? 'rotate-90' : ''
                                      }`} />
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {subItem.items.map((subSubItem) => {
                                        const isSubSubActive = isUrlActive(subSubItem.url, pathname)
                                        return (
                                          <SidebarMenuSubItem key={subSubItem.title}>
                                            <SidebarMenuSubButton asChild isActive={isSubSubActive}>
                                              <a href={subSubItem.url} className="pl-4">
                                                <span>{subSubItem.title}</span>
                                              </a>
                                            </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                        )
                                      })}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </Collapsible>
                              ) : (
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <a href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuSubButton>
                              )}
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild isActive={isMainActive} tooltip={item.title}>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}