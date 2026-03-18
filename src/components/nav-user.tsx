"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconShield,
  IconBuildingStore,
  IconRocket,
  IconSettings,
  IconUsersGroup,
} from "@tabler/icons-react"
import { ChevronDown } from "lucide-react"
import { getPlanBadgeColors } from "@/lib/plan-badge-colors"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    branchId?: string
  }
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { user: authUser, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [branchName, setBranchName] = useState<string>("")
  const isCompany = authUser?.type === "company"

  const openLogoutDialog = () => {
    setDropdownOpen(false)
    setTimeout(() => setShowLogoutDialog(true), 0)
  }

  useEffect(() => {
    async function fetchBranchName() {
      if (authUser?.branchId) {
        try {
          const response = await fetch(`/api/branches/${authUser.branchId}`)
          const result = await response.json()
          if (result.success && result.data) {
            setBranchName(result.data.name)
          }
        } catch (error) {
          console.error("Failed to fetch branch name:", error)
        }
      }
    }
    fetchBranchName()
  }, [authUser?.branchId])

  const handleLogout = async () => {
    setShowLogoutDialog(false)
    try {
      const { authService } = await import("@/lib/auth")
      authService.clearStoredUser()
      authService.logout().catch((err) => {
        console.error("Logout API error (non-critical):", err)
      })
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
      }
      await logout()
    }
  }

  return (
    <SidebarMenuItem suppressHydrationWarning>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="cursor-pointer rounded-lg px-3 py-2.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors duration-200"
            suppressHydrationWarning
            aria-label="Open user menu"
          >
            <Avatar className="h-9 w-9 rounded-lg border-2 border-sidebar-border shrink-0">
              <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 min-w-0 text-left text-sm leading-tight gap-0.5">
              <span className="truncate font-semibold text-sidebar-foreground">
                {user.name}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                {branchName ? `${branchName}` : user.email}
              </span>
            </div>
            <ChevronDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/70 transition-transform [[data-state=open]_&]:rotate-180" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-[240px] w-64 rounded-xl border border-border/80 bg-popover p-0 shadow-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={8}
          alignOffset={-4}
        >
          {/* Profile header */}
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-start gap-3 px-4 py-3">
              <Avatar className="h-11 w-11 rounded-xl border-2 border-border/80 shrink-0">
                <AvatarFallback className="rounded-xl bg-muted text-muted-foreground text-sm font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-0.5">
                <span className="block truncate font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
                {(authUser || branchName) && (
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    {authUser && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <IconShield className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">{authUser.type.charAt(0).toUpperCase() + authUser.type.slice(1)}</span>
                      </span>
                    )}
                    {authUser && branchName && (
                      <span className="shrink-0 w-0.5 h-0.5 rounded-full bg-muted-foreground/40" aria-hidden />
                    )}
                    {branchName && (
                      <span className="inline-flex items-center gap-1 min-w-0 truncate">
                        <IconBuildingStore className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                        <span className="truncate">{branchName}</span>
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-0" />
          <DropdownMenuGroup className="p-1.5">
            {isCompany && (
              <>
                <DropdownMenuItem 
                  className="rounded-lg cursor-pointer gap-2.5 py-2.5"
                  onClick={() => router.push("/settings?tab=system-settings")}
                >
                  <IconSettings className="size-4 text-muted-foreground" />
                  Pengaturan Sistem
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer flex items-center justify-between gap-2.5 py-2.5"
                  onClick={() => router.push("/settings?tab=subscription-plan")}
                >
                  <div className="flex items-center gap-2.5">
                    <IconRocket className="size-4 text-muted-foreground" />
                    Paket Langganan
                  </div>
                  {authUser?.plan && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${getPlanBadgeColors(authUser.plan)} uppercase tracking-wider`}>
                      {authUser.plan}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer gap-2.5 py-2.5"
                  onClick={() => router.push("/settings?tab=order")}
                >
                  <IconCreditCard className="size-4 text-muted-foreground" />
                  Riwayat Langganan
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer gap-2.5 py-2.5"
                  onClick={() => router.push("/settings?tab=referral-program")}
                >
                  <IconUsersGroup className="size-4 text-muted-foreground" />
                  Program Referral
                </DropdownMenuItem>
              </>
            )}
            
            {!isCompany && (
               <DropdownMenuItem 
                className="rounded-lg cursor-pointer gap-2.5 py-2.5"
                onClick={() => router.push("/settings")}
               >
                 <IconUserCircle className="size-4 text-muted-foreground" />
                 Akun
               </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mx-0" />
          <div className="p-1.5">
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                openLogoutDialog()
              }}
              className="rounded-lg cursor-pointer gap-2.5 py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <IconLogout className="size-4" />
              Keluar
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={showLogoutDialog}
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => setShowLogoutDialog(false), 0)
          } else {
            setShowLogoutDialog(true)
          }
        }}
      >
        <AlertDialogContent
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar? Anda perlu masuk kembali untuk mengakses akun Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-white hover:bg-destructive/90 hover:text-white"
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  )
}
