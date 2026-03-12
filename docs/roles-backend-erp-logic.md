# Access Profiles Backend – ERP Logic and Relations

This document describes the `/api/roles` backend (which manages **Access Profiles**), how it relates to other features, and the role-based access rules.

---

## Naming: User Type vs Access Profile

- **User.role** (user type / system role): One of `super admin` | `company` | `employee` | `client`. This is the **account type** created for each user (e.g. demo users). It controls **who can log in**, **scope** (branch/tenant), and **which menus** they see (see `permission-utils.ts`). In the UI we call this **User type** (e.g. Employee, Client).
- **Role** (Access Profile): A **branch-scoped** record with a **name** and a **set of permissions** (strings from `REFERENCE_PERMISSIONS`). Used to define **what employees can do** (e.g. “HR Manager”, “Sales”, “Accountant”). Stored in the `role` table; optional link from User via **User.customRoleId**. In the UI we call this **Access Profile** so it is not confused with user type.

So:

- **User type** (User.role) = tenant/hierarchy (super admin → company → employee | client).
- **Access Profile** (Role) = permission set per branch, assignable to users (typically employees) for fine-grained access. Managed at the **Access Profiles** page (/roles).

---

## Relations to Other Features

| Feature | Relation to Access Profiles |
|--------|-----------------------------|
| **Users** | User has optional `customRoleId` → Role (Access Profile). When creating/editing a user (e.g. employee), the UI shows **User type** (Employee/Client) and **Access Profile** (dropdown of profiles from the same branch). Permission checks can use both `user.role` and `user.customRole?.permissions`. |
| **Branch** | Every Access Profile (Role) belongs to one Branch (`role.branchId`). Company users only see and manage profiles for their own branch. Super admin can manage profiles for any branch (or filter by `?branchId=`). |
| **REFERENCE_PERMISSIONS** | Profile permissions are stored as a JSON array of strings that must match entries in `REFERENCE_PERMISSIONS`. The Access Profiles page (/roles) uses the same list for the permission matrix. |
| **Clients** | Usually clients keep user type `client` and do not get an Access Profile; profiles are mainly for employees. Assigning a profile to a client is allowed by schema but optional. |
| **Permission / RBAC** | Today, route access is driven by **User.role** (user type) in `permission-utils.ts`. Later, middleware or guards can also check **User.customRole.permissions** for feature-level access. |

---

## API Behaviour (ERP-Aligned)

### Who Can Access

- **Super admin**: Full access. Can list all roles or filter by `GET /api/roles?branchId=...`. Can create roles for any branch (body must include `branchId`).
- **Company**: Can only list/create/edit/delete roles for **their own branch** (`currentUser.branchId`). Cannot see or change roles of other branches. `branchId` is forced on create; cannot be changed on update.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/roles | List roles. Company: same branch only. Super admin: all, or filter by `?branchId=`. |
| POST | /api/roles | Create role. Body: `name`, `permissions` (string[]), optional `description`. Company: branchId from session; Super admin: body must include `branchId`. |
| GET | /api/roles/[id] | Get one role. 404 if out of scope (e.g. company and role is in another branch). |
| PUT | /api/roles/[id] | Update name, permissions, description. Scope same as GET. Company cannot change `branchId`. |
| DELETE | /api/roles/[id] | Delete role. Users with this role have `customRoleId` set to null (FK onDelete: SetNull). |

### Validation

- **name**: Required, unique per branch.
- **permissions**: Array of strings; only values that exist in `REFERENCE_PERMISSIONS` (case-insensitive) are stored; duplicates are deduplicated.

---

## Database

- **role**: `id`, `name`, `branchId`, `permissions` (JSON array), `description`, `createdAt`, `updatedAt`. FK to `branch` (onDelete: Cascade).
- **user**: Optional `customRoleId` → `role.id` (onDelete: SetNull).

Migration: `prisma/migrations/20260225120000_add_role_model/migration.sql` (adds `role` table and `user.customRoleId`). If you have migration drift, run this SQL manually or fix drift then run `prisma migrate dev`.

---

## Users page (/users) and HRM Employees

- **User Management** (`/users`) lists **User** records (login accounts) with role `employee` (and for super admin, `company`) scoped by **branch**: company sees only users where `User.branchId = currentUser.branchId`.
- **HRM Employee setup** (`/hrm/employees`, POST/PUT `/api/employees`) can create or update an **Employee** and, when a login is needed, create or update a **User** with role `employee` linked via `Employee.userId`.
- So the same **User** can be created from (1) **Create User** on `/users` or (2) **Create Employee** (with password) in HRM. For both to show on `/users`, the User must have the correct **branchId**.
- **Business rule**: When a **company** user creates an employee via HRM, the new User is assigned `branchId = currentUser.branchId` (and department resolved within that branch). When a **super admin** creates an employee, branch/department are resolved by name as before. This way, employees created from HRM appear in the same branch’s user list on `/users`.

---

## Summary

The Access Profiles backend (API at `/api/roles`, page at `/roles`) is branch-scoped and aligned with multi-tenant ERP logic: companies manage only their branch’s access profiles; super admin can manage any branch’s profiles. **Access Profile** is the link between **Users** (who) and **REFERENCE_PERMISSIONS** (what they can do) within a branch. The name “Access Profile” is used in the UI to avoid confusion with **User type** (the system role: super admin, company, employee, client).
