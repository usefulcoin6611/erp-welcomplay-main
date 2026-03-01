import {
  IconDashboard,
  IconUsers,
  IconFileText,
  IconUsersGroup,
  IconShare,
  IconCash,
  IconShoppingCart,
  IconHeadphones,
  IconBell,
  IconSettings,
  IconVideo,
  IconRocket,
  IconChartLine,
  IconListCheck,
  IconBug,
  IconCalendar,
  IconClipboardCheck,
  IconSpeakerphone,
  IconDeviceDesktopAnalytics,
  IconBriefcase,
  IconBuildingBank,
  IconReceipt,
  IconFileInvoice,
  IconTarget,
  IconTool,
  IconPackage,
  IconMessage,
  IconLayout,
  IconClockHour4,
} from "@tabler/icons-react"
import { UserRole } from "@/contexts/auth-context"

export interface MenuItem {
  title: string
  url: string
  icon?: any
  isActive?: boolean
  items?: MenuItem[]
  /** Permission strings (from AccessProfile.permissions / REFERENCE_PERMISSIONS). User must have at least one to see this item when filtering by access profile. */
  permissions?: string[]
  /** Optional badge count (e.g. unread messages). Rendered in sidebar when > 0. */
  badge?: number
}

// Define which roles can access each menu item
export const getMenuByRole = (role: UserRole, t: (key: string) => string) => {
  // Common secondary navigation for all roles
  const commonSecondary: MenuItem[] = []

  switch (role) {
    case 'super admin':
      // Super Admin - SaaS Platform Management Menu (EXACT match to reference-erp backend line 1543-1629)
      return {
        navMain: [
          // ========== SUPER ADMIN DASHBOARD ==========
          {
            title: t("dashboard"),
            url: "/dashboard",
            icon: IconDashboard,
            isActive: true,
          },
          
          // ========== COMPANIES (SaaS - Manage User Companies) ==========
          {
            title: "Companies",
            url: "/companies",
            icon: IconUsers,
          },
          
          // ========== PLAN MANAGEMENT ==========
          {
            title: "Plan",
            url: "/plans",
            icon: IconFileText,
          },
          
          // ========== PLAN REQUEST ==========
          {
            title: "Plan Request",
            url: "/plan_request",
            icon: IconClipboardCheck,
          },
          
          // ========== REFERRAL PROGRAM ==========
          {
            title: "Referral Program",
            url: "/referral-program",
            icon: IconCash,
          },
          
          // ========== COUPON ==========
          {
            title: "Coupon",
            url: "/coupons",
            icon: IconReceipt,
          },
          
          // ========== ORDER ==========
          {
            title: "Order",
            url: "/orders",
            icon: IconShoppingCart,
          },
          
          // ========== EMAIL TEMPLATE ==========
          {
            title: "Email Template",
            url: "/email_template",
            icon: IconLayout,
          },
          
          // ========== LANDING PAGE ==========
          {
            title: "Landing Page",
            url: "/landingpage",
            icon: IconDeviceDesktopAnalytics,
          },
          
          // ========== SETTINGS ==========
          {
            title: "Settings",
            url: "/systems",
            icon: IconSettings,
          },
        ],
        navSecondary: [],
      }

    case 'company':
      // Company access (includes User Management per UI requirement)
      return {
        navMain: [
          {
            title: t("dashboard"),
            url: "#",
            icon: IconDashboard,
            isActive: true,
            items: [
              {
                title: t("accounting"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/account-dashboard" },
                  { title: t("reports"), url: "/accounting/reports" },
                ],
              },
              {
                title: t("hrm"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/hrm-dashboard" },
                  { title: t("reports"), url: "/hrm/reports" },
                ],
              },
              {
                title: t("crm"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/crm-dashboard" },
                  { title: t("reports"), url: "/crm/reports" },
                ],
              },
              {
                title: t("project"),
                url: "/project-dashboard",
              },
              {
                title: t("pos"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/pos-dashboard" },
                  { title: t("reports"), url: "/pos/reports" },
                ],
              },
            ],
          },
          {
            title: t("hrmSystem"),
            url: "#",
            icon: IconUsers,
            items: [
              { title: t("employeeSetup"), url: "/hrm/employees" },
              { title: t("payrollSetup"), url: "/hrm/payroll" },
              { title: "Leave Management Setup", url: "/hrm/leave" },
              { title: "Performance Setup", url: "/hrm/performance" },
              { title: "Training Setup", url: "/hrm/training" },
              { title: "Recruitment Setup", url: "/hrm/recruitment" },
              { title: "HR Admin Setup", url: "/hrm/admin" },
              { title: "Event Setup", url: "/hrm/events" },
              { title: "Meeting", url: "/hrm/meetings" },
              { title: "Employees Asset Setup", url: "/hrm/assets" },
              { title: "Document Setup", url: "/hrm/documents" },
              { title: "Company Policy", url: "/hrm/policies" },
              { title: "HRM System Setup", url: "/hrm/setup" },
            ],
          },
          {
            title: t("accountingSystem"),
            url: "#",
            icon: IconFileText,
            items: [
              {
                title: t("banking"),
                url: "/accounting/bank-account",
              },
              {
                title: "Sales",
                url: "/accounting/sales",
              },
              {
                title: "Purchases",
                url: "/accounting/purchases",
              },
              {
                title: "Double Entry",
                url: "/accounting/double-entry",
              },
              { title: "Budget Planner", url: "/accounting/budget" },
              { title: "Financial Goal", url: "/accounting/goal" },
              { title: "Accounting Setup", url: "/accounting/setup?tab=taxes" },
              { title: "Print Settings", url: "/accounting/print-settings" },
            ],
          },
          {
            title: t("crmSystem"),
            url: "#",
            icon: IconUsersGroup,
            items: [
              { title: t("leads"), url: "/leads" },
              { title: t("deals"), url: "/deals" },
              { title: t("formBuilder"), url: "/form_builder" },
              { title: t("contract"), url: "/contract" },
              {
                title: t("crmSystemSetup"),
                url: "/pipelines",
              },
            ],
          },
          {
            title: t("projectSystem"),
            url: "#",
            icon: IconShare,
            items: [
              { title: "Projects", url: "/project" },
              { title: "Tasks", url: "/taskboard" },
              { title: "Timesheet", url: "/timesheet-list" },
              { title: "Bug", url: "/bugs-report" },
              { title: "Task Calendar", url: "/calendar" },
              { title: "Tracker", url: "/time-tracker" },
              { title: "Project Report", url: "/project_report" },
              { title: "Project System Setup", url: "/projectstages" },
            ],
          },
          {
            title: t("posSystem"),
            url: "#",
            icon: IconCash,
            items: [
              { title: "Warehouse", url: "/pos/warehouse" },
              { title: "Purchase", url: "/pos/purchase" },
              { title: "Quotation", url: "/pos/quotation" },
              { title: "Add POS", url: "/pos/sales" },
              { title: "POS", url: "/pos/summary" },
              { title: "Transfer", url: "/pos/transfer" },
              { title: "Print Barcode", url: "/pos/print-barcode" },
              { title: "Print Settings", url: "/pos/print-settings" },
            ],
          },
          {
            title: t("productSystem"),
            url: "#",
            icon: IconShoppingCart,
            items: [
              { title: "Product & Services", url: "/products/services" },
              { title: "Product Stock", url: "/products/stock" },
            ],
          },
          {
            title: t("userManagement"),
            url: "#",
            icon: IconUsersGroup,
            items: [
              { title: t("users"), url: "/users" },
              { title: "Access Profiles", url: "/access-profiles" },
              { title: "Client", url: "/clients" },
            ],
          },
          {
            title: t("supportSystem"),
            url: "/support",
            icon: IconHeadphones,
          },
          {
            title: "Messenger",
            url: "/messenger",
            icon: IconMessage,
          },
          {
            title: "Templates",
            url: "#",
            icon: IconLayout,
            items: [
              { title: "Notification Template", url: "/notifications" },
              { title: "Email Template", url: "/email_template" },
            ],
          },
          {
            title: "Zoom Meeting",
            url: "/zoom",
            icon: IconVideo,
          },
          {
            title: "Settings",
            url: "/settings",
            icon: IconSettings,
          },
        ],
        navSecondary: commonSecondary,
      }

    case 'client':
      // Client has limited access - flat menu structure (no nested groups)
      // Based on reference-erp line 1453-1541
      return {
        navMain: [
          {
            title: t("dashboard"),
            url: "/dashboard",
            icon: IconDashboard,
            isActive: true,
          },
          {
            title: t("deals"),
            url: "/deals",
            icon: IconRocket,
          },
          {
            title: t("contract"),
            url: "/contract",
            icon: IconFileText,
          },
          {
            title: t("project"),
            url: "/projects",
            icon: IconShare,
          },
          {
            title: "Project Report",
            url: "/project_report",
            icon: IconChartLine,
          },
          {
            title: t("tasks"),
            url: "/taskboard",
            icon: IconListCheck,
          },
          {
            title: t("bugs"),
            url: "/bugs-report",
            icon: IconBug,
          },
          {
            title: "Task Calendar",
            url: "/calendar",
            icon: IconCalendar,
          },
          {
            title: t("supportSystem"),
            url: "/support",
            icon: IconHeadphones,
          },
        ],
        navSecondary: [],
      }

    case 'employee':
      // Employee menu: each item has permissions from REFERENCE_PERMISSIONS for access-profile filtering
      return {
        navMain: [
          {
            title: t("dashboard"),
            url: "#",
            icon: IconDashboard,
            isActive: true,
            items: [
              {
                title: t("hrm"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/hrm-dashboard", permissions: ["show hrm dashboard"] },
                  { title: t("reports"), url: "/hrm/reports", permissions: ["view employee", "manage employee"] },
                ],
              },
              {
                title: t("project"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/project-dashboard", permissions: ["show project dashboard"] },
                ],
              },
              {
                title: t("crm"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/crm-dashboard", permissions: ["show crm dashboard"] },
                  { title: t("reports"), url: "/crm/reports", permissions: ["manage lead", "view lead", "manage deal", "view deal"] },
                ],
              },
              {
                title: t("accounting"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/account-dashboard", permissions: ["show account dashboard"] },
                  { title: t("reports"), url: "/accounting/reports", permissions: ["manage report"] },
                ],
              },
            ],
          },
          {
            title: t("hrmSystem"),
            url: "#",
            icon: IconUsers,
            items: [
              { title: t("employeeSetup"), url: "/hrm/employees", permissions: ["manage employee", "view employee"] },
              { title: t("payrollSetup"), url: "/hrm/payroll", permissions: ["manage pay slip", "manage set salary", "create pay slip", "create set salary"] },
              { title: "Leave Management Setup", url: "/hrm/leave", permissions: ["manage leave", "create leave", "edit leave"] },
              { title: "Performance Setup", url: "/hrm/performance", permissions: ["manage appraisal", "manage goal tracking", "manage indicator"] },
              { title: "Training Setup", url: "/hrm/training", permissions: ["manage training", "manage trainer", "manage training type"] },
              { title: "Recruitment Setup", url: "/hrm/recruitment", permissions: ["manage job application", "manage job", "manage job category", "manage job stage"] },
              { title: "HR Admin Setup", url: "/hrm/admin", permissions: ["manage award", "manage transfer", "manage resignation", "manage travel", "manage promotion", "manage complaint", "manage warning", "manage termination", "manage announcement", "manage holiday"] },
              { title: "Event Setup", url: "/hrm/events", permissions: ["manage event", "create event", "edit event"] },
              { title: "Meeting", url: "/hrm/meetings", permissions: ["manage meeting", "create meeting", "edit meeting"] },
              { title: "Employees Asset Setup", url: "/hrm/assets", permissions: ["view employee", "manage employee"] },
              { title: "Document Setup", url: "/hrm/documents", permissions: ["manage document", "create document", "edit document"] },
              { title: "Company Policy", url: "/hrm/policies", permissions: ["manage company policy", "create company policy", "edit company policy"] },
              { title: "HRM System Setup", url: "/hrm/setup", permissions: ["manage branch", "manage department", "manage designation", "manage document type", "manage leave type", "manage payslip type", "manage training type"] },
            ],
          },
          {
            title: t("crmSystem"),
            url: "#",
            icon: IconUsersGroup,
            items: [
              { title: t("leads"), url: "/leads", permissions: ["manage lead", "view lead", "create lead", "edit lead"] },
              { title: t("deals"), url: "/deals", permissions: ["manage deal", "view deal", "create deal", "edit deal"] },
              { title: t("formBuilder"), url: "/form_builder", permissions: ["manage form builder", "create form builder", "edit form builder"] },
              { title: t("contract"), url: "/contract", permissions: ["manage contract", "create contract", "edit contract", "show contract"] },
              { title: t("crmSystemSetup"), url: "/pipelines", permissions: ["manage pipeline", "manage lead stage", "manage stage"] },
            ],
          },
          {
            title: t("projectSystem"),
            url: "#",
            icon: IconShare,
            items: [
              { title: "Projects", url: "/projects", permissions: ["manage project", "view project", "create project"] },
              { title: "Tasks", url: "/taskboard", permissions: ["manage project task", "view project task", "create project task"] },
              { title: "Timesheet", url: "/timesheet-list", permissions: ["manage timesheet", "view timesheet", "create timesheet"] },
              { title: "Bug", url: "/bugs-report", permissions: ["manage bug report", "create bug report", "edit bug report", "move bug report"] },
              { title: "Task Calendar", url: "/calendar", permissions: ["view project task", "manage project task"] },
              { title: "Tracker", url: "/time-tracker", permissions: ["manage timesheet", "view timesheet", "create timesheet"] },
              { title: "Project Report", url: "/project_report", permissions: ["view project", "manage project"] },
              { title: "Project System Setup", url: "/projectstages", permissions: ["manage project stage", "manage project task stage"] },
            ],
          },
          {
            title: t("accountingSystem"),
            url: "#",
            icon: IconFileText,
            items: [
              { title: t("banking"), url: "/accounting/bank-account", permissions: ["manage bank account", "show journal entry"] },
              { title: "Sales", url: "/accounting/sales", permissions: ["manage revenue", "show invoice"] },
              { title: "Purchases", url: "/accounting/purchases", permissions: ["manage bill", "show bill"] },
              { title: "Double Entry", url: "/accounting/double-entry", permissions: ["manage journal entry", "show journal entry"] },
              { title: "Budget Planner", url: "/accounting/budget", permissions: ["manage budget plan", "create budget plan", "edit budget plan", "view budget plan"] },
              { title: "Financial Goal", url: "/accounting/goal", permissions: ["manage goal"] },
              { title: "Accounting Setup", url: "/accounting/setup?tab=taxes", permissions: ["manage constant custom field", "manage chart of account"] },
              { title: "Print Settings", url: "/accounting/print-settings", permissions: ["manage print settings"] },
            ],
          },
          {
            title: t("userManagement"),
            url: "#",
            icon: IconUsersGroup,
            items: [
              { title: t("users"), url: "/users", permissions: ["manage user", "create user", "edit user"] },
              { title: "Access Profiles", url: "/access-profiles", permissions: ["manage permission", "create permission", "edit permission"] },
              { title: "Client", url: "/clients", permissions: ["manage client", "create client", "edit client"] },
            ],
          },
          {
            title: t("productSystem"),
            url: "#",
            icon: IconShoppingCart,
            items: [
              { title: "Product & Services", url: "/products/services", permissions: ["manage product & service", "show product & service"] },
              { title: "Product Stock", url: "/products/stock", permissions: ["manage warehouse", "show warehouse"] },
            ],
          },
          {
            title: t("myAttendance"),
            url: "/attendance",
            icon: IconClockHour4,
          },
          {
            title: t("supportSystem"),
            url: "/support",
            icon: IconHeadphones,
            permissions: ["manage client dashboard"],
          },
          {
            title: "Zoom Meeting",
            url: "/zoom",
            icon: IconVideo,
            permissions: ["manage zoom meeting", "show zoom meeting"],
          },
          {
            title: "Notification Template",
            url: "/notifications",
            icon: IconBell,
            permissions: ["manage company settings"],
          },
          {
            title: "Settings",
            url: "/settings",
            icon: IconSettings,
            permissions: ["manage company settings", "manage business settings"],
          },
          {
            title: "Messenger",
            url: "/messenger",
            icon: IconMessage,
            permissions: ["manage company settings"],
          },
          {
            title: "Email Template",
            url: "/email_template",
            icon: IconLayout,
            permissions: ["manage company settings"],
          },
        ],
        navSecondary: [],
      }

    default:
      return { navMain: [], navSecondary: [] }
  }
}

/**
 * Filter menu items by access profile permissions.
 * When user has an assigned access profile, only show items whose `permissions` array
 * intersects with the user's permissions (user must have at least one of the item's permissions).
 * Items without a `permissions` key are hidden when filtering (strict: only show explicitly allowed).
 * Pass null/undefined userPermissions to skip filtering (show full menu).
 */
export function filterMenuByPermissions(
  items: MenuItem[],
  userPermissions: string[] | null | undefined
): MenuItem[] {
  if (!Array.isArray(userPermissions)) return items
  const set = new Set(userPermissions.map((p) => p.trim().toLowerCase()))
  if (set.size === 0) return []

  function hasAccess(item: MenuItem): boolean {
    if (!item.permissions?.length) return false
    return item.permissions.some((p) => set.has(p.trim().toLowerCase()))
  }

  function filter(items: MenuItem[]): MenuItem[] {
    return items
      .map((item) => {
        if (item.items?.length) {
          const filteredChildren = filter(item.items)
          if (filteredChildren.length === 0) return null
          return { ...item, items: filteredChildren }
        }
        return hasAccess(item) ? item : null
      })
      .filter((item): item is MenuItem => item !== null)
  }

  return filter(items)
}
