"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import {
  IconBell,
  IconBellRinging,
  IconBriefcase,
  IconCalendar,
  IconChevronRight,
  IconDashboard,
  IconFileText,
  IconHome2,
  IconInbox,
  IconLayoutDashboard,
  IconLifebuoy,
  IconPlus,
  IconSearch,
  IconSettings,
  IconShare,
  IconShoppingCart,
  IconTerminal,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
  IconCash,
  IconHeadphones,
  IconVideo,
  IconSun,
} from "@tabler/icons-react";

import { NavMain } from '@/components/nav-main'
import { SidebarMenu } from '@/components/SidebarMenu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavSecondary } from '@/components/nav-secondary'
import { NavUser } from '@/components/nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('sidebar.menu');
  
  const data = {
    user: {
      name: "welcomplay",
      email: "user@welcomplay.com",
      avatar: "/avatars/logo.png",
    },
    navMain: [
      {
        title: t("dashboard"),
        url: "#", // No direct URL, only expand dropdown
        icon: IconDashboard,
        isActive: true,
        items: [
          {
            title: t("accounting"),
            url: "#", // No direct URL, only expand dropdown
            items: [
              { title: t("overview"), url: "/account-dashboard" },
              {
                title: t("reports"),
                url: "/accounting/reports", // Direct link to unified Reports page
              },
            ],
          },
          {
            title: t("hrm"),
            url: "#", // No direct URL, only expand dropdown
            items: [
              { title: t("overview"), url: "/hrm-dashboard" },
              {
                title: t("reports"),
                url: "/hrm/reports", // Direct link to unified Reports page
              },
            ],
          },
          {
            title: t("crm"),
            url: "#", // No direct URL, only expand dropdown
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
            url: "#", // No direct URL, only expand dropdown
            items: [
              { title: t("overview"), url: "/pos-dashboard" },
              {
                title: t("reports"),
                url: "/pos/reports",
              },
            ],
          },
        ],
      },
      {
        title: t("hrmSystem"),
        url: "#", // Only dropdown, no direct navigation
        icon: IconUsers,
        items: [
          { 
            title: t("employeeSetup"), 
            url: "/hrm/employees",
          },
          { 
            title: t("payrollSetup"), 
            url: "/hrm/payroll",
          },
          { 
            title: "Leave Management Setup", 
            url: "/hrm/leave",
          },
          { 
            title: "Performance Setup", 
            url: "/hrm/performance",
          },
          { 
            title: "Training Setup", 
            url: "/hrm/training",
          },
          { 
            title: "Recruitment Setup", 
            url: "/hrm/recruitment",
          },
          { 
            title: "HR Admin Setup", 
            url: "/hrm/admin",
          },
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
        url: "#", // Only dropdown, no direct navigation
        icon: IconFileText,
        items: [
          {
            title: t("banking"),
            url: "/accounting/bank-account",
          },
          { 
            title: "Sales", 
            url: "#", // Only dropdown, no direct navigation
            items: [
              { title: "Customer", url: "/accounting/customer" },
              { title: "Estimate", url: "/accounting/proposal" },
              { title: "Invoice", url: "/accounting/invoice" },
              { title: "Revenue", url: "/accounting/revenue" },
              { title: "Credit Note", url: "/accounting/credit-note" },
            ],
          },
          { 
            title: "Purchases", 
            url: "#", // Only dropdown, no direct navigation
            items: [
              { title: "Supplier", url: "/accounting/vender" },
              { title: "Bill", url: "/accounting/bill" },
              { title: "Expense", url: "/accounting/expense" },
              { title: "Payment", url: "/accounting/payment" },
              { title: "Debit Note", url: "/accounting/debit-note" },
            ],
          },
          { 
            title: "Double Entry", 
            url: "#", // Only dropdown, no direct navigation
            items: [
              { title: "Chart of Accounts", url: "/accounting/chart-of-account" },
              { title: "Journal Account", url: "/accounting/journal-entry" },
              { title: "Ledger Summary", url: "/accounting/ledger" },
              { title: "Balance Sheet", url: "/accounting/balance-sheet" },
              { title: "Profit & Loss", url: "/accounting/profit-loss" },
              { title: "Trial Balance", url: "/accounting/trial-balance" },
            ],
          },
          { title: "Budget Planner", url: "/accounting/budget" },
          { title: "Financial Goal", url: "/accounting/goal" },
          { title: "Accounting Setup", url: "/accounting/setup" },
          { title: "Print Settings", url: "/accounting/print-settings" },
        ],
      },
      {
        title: t("crmSystem"),
        url: "#", // Only dropdown, no direct navigation
        icon: IconUsersGroup,
        items: [
          { title: t("leads"), url: "/leads" },
          { title: t("deals"), url: "/deals" },
          { title: t("formBuilder"), url: "/form_builder" },
          { title: t("contract"), url: "/contract" },
          { title: t("crmSystemSetup"), url: "/pipelines" },
        ],
      },
      {
        title: t("projectSystem"),
        url: "#", // Only dropdown, no direct navigation
        icon: IconShare,
        items: [
          { title: "Projects", url: "/projects/project/list" },
          { title: "Tasks", url: "/projects/task" },
          { title: "Timesheet", url: "/projects/timesheet/list" },
          { title: "Bug", url: "/projects/bug/list" },
          { title: "Task Calendar", url: "/projects/task/calendar" },
          { title: "Tracker", url: "/projects/time-tracker" },
          { title: "Project Report", url: "/projects/reports/project" },
          { 
            title: "Project System Setup", 
            url: "#", // Only dropdown, no direct navigation
            items: [
              { title: "Project Stages", url: "/projects/setup" },
              { title: "Task Stages", url: "/projects/task/stage" },
              { title: "Bug Status", url: "/projects/bug/status" },
            ],
          },
        ],
      },
      {
        title: t("posSystem"),
        url: "#", // Only dropdown, no direct navigation
        icon: IconCash,
        items: [
          { 
            title: "Product & Services", 
            url: "#", // Only dropdown, no direct navigation
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
            url: "#", // Only dropdown, no direct navigation
            items: [
              { title: "Purchase", url: "/pos/purchase/list" },
              { title: "Purchase Return", url: "/pos/purchase/return" },
            ],
          },
          { 
            title: "Warehouse", 
            url: "#", // Only dropdown, no direct navigation
            items: [
              { title: "Warehouse", url: "/pos/warehouse/list" },
              { title: "Warehouse Transfer", url: "/pos/warehouse/transfer" },
            ],
          },
          { 
            title: "POS", 
            url: "#", // Only dropdown, no direct navigation
            items: [
              { title: "POS", url: "/pos/sales/pos" },
              { title: "POS Return", url: "/pos/sales/return" },
            ],
          },
          { 
            title: "Reports", 
            url: "/pos/reports",
          },
          { title: "POS System Setup", url: "/pos/setup" },
        ],
      },
      {
        title: t("productSystem"),
        url: "#", // Only dropdown, no direct navigation
        icon: IconShoppingCart,
        items: [
          { title: "Product & Services", url: "/products/services" },
          { title: "Product Stock", url: "/products/stock" },
          { title: "Product & Service Category", url: "/products/category" },
          { title: "Product & Service Unit", url: "/products/unit" },
        ],
      },
      {
        title: t("userManagement"),
        url: "#", // Only dropdown, no direct navigation
        icon: IconUsers,
        items: [
          { title: "Users", url: "/users" },
          { title: "Roles", url: "/users/roles" },
          { title: "Permissions", url: "/users/permissions" },
        ],
      },
      {
        title: t("supportSystem"),
        url: "#", // Only dropdown, no direct navigation
        icon: IconHeadphones,
        items: [
          { title: "Support", url: "/support/tickets" },
          { title: "Knowledge Base", url: "/support/kb" },
          { title: "FAQ", url: "/support/faq" },
        ],
      },
    ],
    navSecondary: [
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
    ],
  }

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
            <span className="text-base font-semibold">WelcomplayERP</span>
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
