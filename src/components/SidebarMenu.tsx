"use client"

import { ChevronDown } from "lucide-react"
import { type Icon as TablerIcon } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type MenuItem = {
  title: string
  url: string
  icon?: TablerIcon
  isActive?: boolean
  items?: MenuItem[]
}

interface SidebarMenuProps {
  items: MenuItem[]
}

const MenuItemComponent = ({ 
  item, 
  level = 0, 
  openItems, 
  setOpenItems 
}: {
  item: MenuItem
  level?: number
  openItems: Record<string, boolean>
  setOpenItems: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) => {
  const pathname = usePathname()
  const itemKey = `${level}-${item.title}`
  const isOpen = openItems[itemKey]
  const isActive = pathname === item.url
  const hasChildren = item.items && item.items.length > 0
  
  // Check if any child is active
  const childIsActive = hasChildren && item.items?.some(subItem => {
    if (pathname === subItem.url) return true
    if (subItem.items) {
      return subItem.items.some(subSub => pathname === subSub.url)
    }
    return false
  })

  // Track manual close state
  const [manualClosed, setManualClosed] = useState(false)
  
  // Reset manual close when navigating to different route
  useEffect(() => {
    setManualClosed(false)
  }, [pathname])

  // Keep dropdown open if child is active, unless manually closed
  const effectiveOpen = hasChildren
    ? (isOpen && !manualClosed) || (childIsActive && !manualClosed)
    : isOpen
  
  // Determine padding based on level for proper indentation
  const paddingLeft = level === 0 ? "pl-3" : level === 1 ? "pl-7" : level === 2 ? "pl-12" : "pl-16"
  
  if (hasChildren) {
    return (
      <div className="w-full">
        <Collapsible
          open={effectiveOpen}
          onOpenChange={(open) => {
            setOpenItems(prev => ({ ...prev, [itemKey]: open }))
            if (!open) setManualClosed(true)
            else setManualClosed(false)
          }}
        >
          <CollapsibleTrigger asChild>
            <motion.div 
              className={`
                flex items-center justify-between w-full py-2 px-3 
                text-sm font-medium rounded-md cursor-pointer
                hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
                transition-all duration-300 ease-out
                ${paddingLeft}
              `}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                {item.icon && (
                  <motion.div
                    animate={{ rotate: effectiveOpen ? 15 : 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                  </motion.div>
                )}
                <span>{item.title}</span>
              </div>
              <motion.div
                animate={{ 
                  rotate: effectiveOpen ? 180 : 0,
                  scale: effectiveOpen ? 1.1 : 1 
                }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1 mt-1 overflow-hidden">
            {item.items?.map((subItem, idx) => (
              <MenuItemComponent
                key={subItem.title}
                item={subItem}
                level={level + 1}
                openItems={openItems}
                setOpenItems={setOpenItems}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  // Leaf item (no children)
  return (
    <Link href={item.url}>
      <motion.div
        className={`
          flex items-center gap-2 w-full py-2 px-3 
          text-sm font-medium rounded-md transition-all duration-300 ease-out
          hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
          ${paddingLeft}
          ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'}
        `}
        initial={false}
      >
        {item.icon && (
          <motion.div>
            <item.icon className="h-4 w-4 shrink-0" />
          </motion.div>
        )}
        <span>{item.title}</span>
      </motion.div>
    </Link>
  )
}

function SidebarMenuInner({ items }: SidebarMenuProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    // Auto-open Dashboard by default
    "0-Dashboard": true
  })

  return (
    <div className="flex flex-col space-y-1 p-2">
      {items.map((item) => (
        <MenuItemComponent
          key={item.title}
          item={item}
          level={0}
          openItems={openItems}
          setOpenItems={setOpenItems}
        />
      ))}
    </div>
  )
}

export function SidebarMenu({ items }: SidebarMenuProps) {
  // Render this menu only on the client to avoid hydration mismatches
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return <SidebarMenuInner items={items} />
}

export default SidebarMenu;
