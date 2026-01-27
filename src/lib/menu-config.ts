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
  const commonSecondary = [
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
  ]

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
              { 
                title: t("payrollSetup"), 
                url: "#",
                items: [
                  { title: "Set Salary", url: "/hrm/payroll/set-salary" },
                  { title: "Payslip", url: "/hrm/payroll/payslip" },
                ],
              },
              { title: "Leave Management Setup", url: "/hrm/leave" },
              { 
                title: "Attendance Setup", 
                url: "#",
                items: [
                  // Attendance pages live under /hrm/leave tabs in this project
                  { title: "Mark Attendance", url: "/hrm/leave?tab=mark-attendance" },
                  { title: "Bulk Attendance", url: "/hrm/leave?tab=bulk-attendance" },
                ],
              },
              { 
                title: "Performance Setup", 
                url: "#",
                items: [
                  { title: "Indicator", url: "/hrm/performance/indicator" },
                  { title: "Appraisal", url: "/hrm/performance/appraisal" },
                  { title: "Goal Tracking", url: "/hrm/performance/goal-tracking" },
                ],
              },
              { 
                title: "Training Setup", 
                url: "#",
                items: [
                  { title: "Training List", url: "/hrm/training" },
                  { title: "Trainer", url: "/hrm/training/trainer" },
                ],
              },
              { 
                title: "Recruitment Setup", 
                url: "#",
                items: [
                  { title: "Job", url: "/hrm/recruitment/job" },
                  { title: "Job Application", url: "/hrm/recruitment/job-application" },
                  { title: "Job Board", url: "/hrm/recruitment/job-board" },
                  { title: "Custom Question", url: "/hrm/recruitment/custom-question" },
                  { title: "Interview Schedule", url: "/hrm/recruitment/interview-schedule" },
                  { title: "Career", url: "/hrm/recruitment/career" },
                ],
              },
              { title: "Event Setup", url: "/hrm/events" },
              { title: "Meeting", url: "/hrm/meetings" },
              { title: "Employees Asset Setup", url: "/hrm/assets" },
              { title: "Document Setup", url: "/hrm/documents" },
              { title: "Company Policy", url: "/hrm/policies" },
              { 
                title: "HRM System Setup", 
                url: "#",
                items: [
                  { title: "Branch", url: "/hrm/setup/branch" },
                  { title: "Department", url: "/hrm/setup/department" },
                  { title: "Designation", url: "/hrm/setup/designation" },
                  { title: "Leave Type", url: "/hrm/setup/leave-type" },
                  { title: "Document Type", url: "/hrm/setup/document-type" },
                  { title: "Payslip Type", url: "/hrm/setup/payslip-type" },
                  { title: "Allowance Option", url: "/hrm/setup/allowance-option" },
                  { title: "Loan Option", url: "/hrm/setup/loan-option" },
                  { title: "Deduction Option", url: "/hrm/setup/deduction-option" },
                  { title: "Goal Type", url: "/hrm/setup/goal-type" },
                  { title: "Training Type", url: "/hrm/setup/training-type" },
                  { title: "Award Type", url: "/hrm/setup/award-type" },
                  { title: "Termination Type", url: "/hrm/setup/termination-type" },
                  { title: "Job Category", url: "/hrm/setup/job-category" },
                  { title: "Job Stage", url: "/hrm/setup/job-stage" },
                  { title: "Performance Type", url: "/hrm/setup/performance-type" },
                  { title: "Competencies", url: "/hrm/setup/competencies" },
                ],
              },
            ],
          },
          {
            title: t("accountingSystem"),
            url: "#",
            icon: IconFileText,
            items: [
              {
                title: t("banking"),
                url: "#",
                items: [
                  { title: "Account", url: "/accounting/bank-account" },
                  { title: "Transfer", url: "/accounting/bank-transfer" },
                ],
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
                url: "#",
                items: [
                  { title: "Pipelines", url: "/pipelines" },
                  { title: "Lead Stages", url: "/pipelines/lead-stages" },
                  { title: "Deal Stages", url: "/pipelines/deal-stages" },
                  { title: "Sources", url: "/pipelines/sources" },
                  { title: "Labels", url: "/pipelines/labels" },
                  { title: "Contract Type", url: "/pipelines/contract-type" },
                ],
              },
            ],
          },
          {
            title: t("projectSystem"),
            url: "#",
            icon: IconShare,
            items: [
              { title: "Projects", url: "/projects/project/list" },
              { title: "Taskboard", url: "/projects/task" },
              { title: "Timesheet", url: "/projects/timesheet/list" },
              { title: "Bug Report", url: "/projects/bug/list" },
              { title: "Task Calendar", url: "/projects/task/calendar" },
              { title: "Time Tracker", url: "/projects/time-tracker" },
              { title: "Project Report", url: "/projects/reports/project" },
            ],
          },
          {
            title: t("posSystem"),
            url: "#",
            icon: IconCash,
            items: [
              {
                title: "Product & Services",
                url: "#",
                items: [
                  { title: "Product & Services", url: "/pos/products/list" },
                  { title: "Product Category", url: "/pos/products/category" },
                  { title: "Product Coupon", url: "/pos/products/coupon" },
                  { title: "Brand", url: "/pos/products/brand" },
                  { title: "Unit", url: "/pos/products/unit" },
                  { title: "Variant", url: "/pos/products/variant" },
                ],
              },
              {
                title: "Purchase",
                url: "#",
                items: [
                  { title: "Purchase", url: "/pos/purchase/list" },
                  { title: "Purchase Return", url: "/pos/purchase/return" },
                ],
              },
              {
                title: "Warehouse",
                url: "#",
                items: [
                  { title: "Warehouse", url: "/pos/warehouse/list" },
                  { title: "Warehouse Transfer", url: "/pos/warehouse/transfer" },
                ],
              },
              {
                title: "POS",
                url: "#",
                items: [
                  { title: "POS", url: "/pos/sales/pos" },
                  { title: "POS Return", url: "/pos/sales/return" },
                ],
              },
              { title: "Reports", url: "/pos/reports" },
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
              { title: "Roles", url: "/users/roles" },
              { title: "Client", url: "/users/clients" },
            ],
          },
          {
            title: t("supportSystem"),
            url: "/support",
            icon: IconHeadphones,
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
            title: "Messenger",
            url: "/messenger",
            icon: IconMessage,
          },
          {
            title: "Zoom Meeting",
            url: "/zoom",
            icon: IconVideo,
          },
        ],
        navSecondary: [],
      }

    default:
      return { navMain: [], navSecondary: [] }
  }
}
