# Role-Based Access Control (RBAC) - Frontend Implementation

## Overview
This ERP system has 4 user roles, each with specific menu access levels. The role-based menu system is implemented entirely on the frontend for development purposes.

## User Roles & Credentials

### 🔴 Super Admin
**Email:** superadmin@example.com  
**Password:** 1234  
**Access Level:** Full system access

**Menu Access:**
- ✅ All Dashboards (Accounting, HRM, CRM, Project, POS)
- ✅ All HRM System modules (including HR Admin Setup, System Setup)
- ✅ All Accounting System modules (including Setup, Print Settings)
- ✅ All CRM System modules (including System Setup)
- ✅ All Project System modules (including Project System Setup)
- ✅ All POS System modules (including POS System Setup)
- ✅ All Product System modules
- ✅ **User Management** (Users, Clients, Roles, Permissions)
- ✅ Support System
- ✅ All Settings & Configuration

---

### 🔵 Company
**Email:** company@example.com  
**Password:** 1234  
**Access Level:** Business Operations (No User Management)

**Menu Access:**
- ✅ All Dashboards (Accounting, HRM, CRM, Project, POS)
- ✅ HRM System (except HR Admin Setup and System Setup)
- ✅ Accounting System (except Accounting Setup and Print Settings)
- ✅ CRM System (including System Setup)
- ✅ Project System (except Project System Setup)
- ✅ POS System (except POS System Setup)
- ✅ Product System
- ❌ **NO User Management Access**
- ✅ Support System
- ✅ Settings (limited)

**Restrictions:**
- Cannot manage users, roles, or permissions
- Cannot access system-level setup configurations
- Cannot modify print settings or accounting setup

---

### 🟢 Client
**Email:** client@example.com  
**Password:** 1234  
**Access Level:** Limited - Client Portal

**Menu Access:**
- ✅ CRM Dashboard
- ✅ Project Dashboard
- ✅ Leads Management
- ✅ Deals Management
- ✅ Contracts
- ✅ Projects (view assigned projects)
- ✅ Tasks (view assigned tasks)
- ✅ Task Calendar
- ✅ Support System
- ✅ Zoom Meeting
- ✅ Notifications

**Restrictions:**
- NO access to HRM, Accounting, or POS systems
- NO access to User Management
- NO access to System Settings
- Can only view their own assigned projects and tasks

---

### 🟣 Employee
**Email:** employee@example.com  
**Password:** 1234  
**Access Level:** Employee Self-Service

**Menu Access:**
- ✅ HRM Dashboard
- ✅ Project Dashboard
- ✅ Leave Management (request and view leaves)
- ✅ Events (view company events)
- ✅ Meetings (view and join meetings)
- ✅ My Documents (personal documents)
- ✅ Company Policy (read-only)
- ✅ My Tasks (assigned tasks only)
- ✅ Timesheet (personal timesheet)
- ✅ Task Calendar
- ✅ Time Tracker
- ✅ Support System
- ✅ Zoom Meeting
- ✅ Notifications

**Restrictions:**
- NO access to Accounting, CRM, or POS systems
- NO access to User Management
- NO access to Payroll, Recruitment, or Performance Management
- Can only view/manage their own data
- Cannot access other employees' information

---

## Technical Implementation

### File Structure
```
src/
├── contexts/
│   └── auth-context.tsx          # Authentication state management
├── components/
│   ├── auth-wrapper.tsx          # Route protection
│   ├── app-sidebar.tsx           # Dynamic sidebar with role indicator
│   └── nav-user.tsx              # User profile with role badge
├── lib/
│   └── menu-config.ts            # Role-based menu configurations
└── app/
    ├── layout.tsx                # Root layout with auth providers
    └── login/
        └── page.tsx              # Login page with role selection
```

### Key Features

1. **Role Badge Display**
   - Visible in sidebar header (below logo)
   - Visible in user profile dropdown
   - Color-coded for easy identification

2. **Menu Filtering**
   - Menus are dynamically generated based on logged-in user role
   - Each role sees only their authorized menu items
   - Implemented in `src/lib/menu-config.ts`

3. **Route Protection**
   - Unauthenticated users redirected to `/login`
   - Authenticated users cannot access `/login` (redirected to dashboard)
   - Implemented in `src/components/auth-wrapper.tsx`

4. **Session Management**
   - Uses `sessionStorage` for development
   - Auto-logout on session clear
   - Clean state management via React Context

---

## Testing the System

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:3000`

3. **Login with different roles:**
   - Try each credential set above
   - Observe different menus for each role
   - Check the role badge in sidebar header and user profile

4. **Verify Role Restrictions:**
   - Login as **Client** → Should NOT see Accounting, HRM, or POS menus
   - Login as **Employee** → Should NOT see Accounting, CRM, or POS menus
   - Login as **Company** → Should NOT see User Management
   - Login as **Super Admin** → Should see ALL menus

5. **Check Console:**
   - Open browser DevTools (F12)
   - Check console for debug logs:
     - "Current User Role: [role]"
     - "Menu Items Count: [number]"

---

## Customization

### Adding New Menu Items

Edit `src/lib/menu-config.ts`:

```typescript
case 'employee':
  return {
    navMain: [
      // ... existing items
      {
        title: "New Menu",
        url: "/new-path",
        icon: IconName,
      }
    ]
  }
```

### Modifying Role Access

Simply edit the menu configuration for each role in `getMenuByRole()` function in `src/lib/menu-config.ts`.

---

## Migration to Backend Auth

When ready to implement real backend authentication:

1. Replace `sessionStorage` with HTTP-only cookies
2. Add JWT token management
3. Implement API calls to backend for login/logout
4. Add permission-level checks (not just role-based)
5. Implement refresh token logic
6. Add 2FA if needed

The current structure is designed to make this migration straightforward.

---

## Troubleshooting

**Problem:** All users see the same menu  
**Solution:** 
- Check browser console for "Current User Role" log
- Verify you logged out and logged back in with different credentials
- Clear browser cache and session storage
- Restart dev server

**Problem:** Login page shows error  
**Solution:** 
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`

**Problem:** Menu items missing  
**Solution:**
- Check `src/lib/menu-config.ts` for the role's menu configuration
- Verify translation keys in `messages/en.json` or `messages/id.json`

---

## Security Notes (For Production)

⚠️ **IMPORTANT:** This is a FRONTEND-ONLY implementation for DEVELOPMENT purposes.

For production:
- ❌ DO NOT rely solely on frontend role checks
- ✅ Implement backend API permission checks
- ✅ Use secure token-based authentication
- ✅ Validate permissions on every API request
- ✅ Implement proper session management
- ✅ Add CSRF protection
- ✅ Use HTTPS only
- ✅ Implement rate limiting
- ✅ Add audit logging

---

## Related Files

- `src/contexts/auth-context.tsx` - Auth state management
- `src/lib/menu-config.ts` - Menu configurations per role
- `src/components/app-sidebar.tsx` - Sidebar with role-based menus
- `src/components/nav-user.tsx` - User profile with logout
- `src/components/auth-wrapper.tsx` - Route protection
- `src/app/login/page.tsx` - Login page

---

## Support

For questions or issues, refer to the reference backend implementation in:
`E:\Project\ERP\erp-welcomplay-main\reference-erp\database\seeders\UsersTableSeeder.php`

This file contains the complete permission structure from the Laravel backend.
