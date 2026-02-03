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
} from "@tabler/icons-react"
import { UserRole } from "@/contexts/auth-context"

export interface MenuItem {
  title: string
  url: string
  icon?: any
  isActive?: boolean
  items?: MenuItem[]
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
            icon: IconMessage,
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
            url: "/settings",
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
              { title: "HRM System Setup", url: "/hrm/setup/branch" },
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
              { title: "Accounting Setup", url: "/accounting/setup" },
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
              { title: "Roles", url: "/roles" },
              { title: "Client", url: "/users/clients" },
            ],
          },
          {
            title: t("supportSystem"),
            url: "/support",
            icon: IconHeadphones,
          },
          {
            title: "Templates",
            url: "#",
            icon: IconMessage,
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
      // Employee - Employee Self-Service (based on ROLE_BASED_ACCESS.md)
      // NO access to Accounting, CRM, POS, User Management
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
                  { title: t("overview"), url: "/hrm-dashboard" },
                ],
              },
              {
                title: t("project"),
                url: "#",
                items: [
                  { title: t("overview"), url: "/project-dashboard" },
                ],
              },
            ],
          },
          {
            title: t("hrmSystem"),
            url: "#",
            icon: IconUsers,
            items: [
              { title: "Employees Asset Setup", url: "/hrm/assets" },
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
              { title: "Financial Goal", url: "/accounting/goal" },
              {
                title: "Accounting Setup",
                url: "/accounting/setup/custom-field?tab=taxes",
              },
            ],
          },
          {
            title: t("userManagement"),
            url: "#",
            icon: IconUsersGroup,
            items: [
              { title: t("users"), url: "/users" },
              { title: "Client", url: "/users/clients" },
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
            title: t("supportSystem"),
            url: "/support",
            icon: IconHeadphones,
          },
          {
            title: "Zoom Meeting",
            url: "/zoom",
            icon: IconVideo,
          },
          {
            title: "Notification Template",
            url: "/notifications",
            icon: IconBell,
          },
          {
            title: "Settings",
            url: "/settings",
            icon: IconSettings,
          },
          {
            title: "Messenger",
            url: "/messenger",
            icon: IconMessage,
          },
        ],
        navSecondary: [],
      }

    default:
      return { navMain: [], navSecondary: [] }
  }
}
