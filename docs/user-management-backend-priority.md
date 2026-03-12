# User Management Backend – Implementation Priority

This document recommends the order to implement backends for the three User Management menus: **Users**, **Roles**, and **Client**, and how they relate to existing seed/demo data.

---

## Current State

- **Seed:** `prisma/seeds/users.ts` already creates **4 demo users** (super admin, company, client, employee) with password `password1234`. All use the existing **User** model (Prisma).
- **Schema:** `User` has `id`, `name`, `email`, `role` (string: `"super admin" | "company" | "client" | "employee"`), `branchId`, `departmentId`, etc. There is **no separate Role table**; role is a string on User.
- **Frontend:** All three pages use **mock data** only; no API calls yet.

---

## Recommended Order (1st → Last)

### 1st: **Users** (`/users`)

**Why first:**

- **User** table and seed already exist; you only add APIs and wire the UI.
- Both “Manage Companies” (super admin) and “Manage User” (company) are about listing/creating/editing users (and optionally company-scoping).
- **Roles** and **Clients** depend on “who exists”; Users is the base for both.

**Backend to build:**

- `GET /api/users` – List users (with optional filters: role, branch; for company role, restrict to same company/branch if you add such a concept).
- `POST /api/users` – Create user (name, email, password, role, branchId, departmentId, etc.). Hash password (e.g. bcrypt); create User + Account for credential login if needed.
- `GET /api/users/[id]` – Get one user.
- `PUT /api/users/[id]` – Update user (and optionally password).
- `DELETE /api/users/[id]` – Soft-delete or hard-delete per your policy.

**Validation:** Required fields, unique email, valid role enum, optional branch/department existence.  
**Auth:** Restrict by role (e.g. only super admin and company); company may only see/edit users in their scope if you have multi-tenant logic.

**Seed:** Demo users are already in place; no seed change required for a first version. You can add more seed users later if needed.

---

### 2nd: **Roles** (`/roles`)

**Why second:**

- The Roles page manages **role names** and **permission sets** (from `REFERENCE_PERMISSIONS`). Today there is no Role entity in the DB; `User.role` is a plain string.
- Implementing Roles backend after Users lets you:
  - Either keep `User.role` as a fixed set (`super admin` | `company` | `client` | `employee`) and have the Roles UI only manage **which permissions** each of these roles has, or
  - Introduce a **Role** model (and optionally Permission model) and later link User to Role so “Users” can “assign role” from the list you manage here.

**Backend to build (conceptual):**

- **Option A – No Role table (simplest):**  
  - Store role–permission mapping in config/DB (e.g. one table: `role_name` + `permissions` JSON array).  
  - APIs: `GET /api/roles`, `GET /api/roles/[name]`, `PUT /api/roles/[name]` (update permissions).  
  - `User.role` stays as today; Roles page only edits permissions for each known role name.

- **Option B – Role table (flexible):**  
  - New models: e.g. `Role` (id, name, permissions JSON or relation to Permission), and optionally `User.roleId` instead of or in addition to `User.role` string.  
  - Full CRUD: `GET/POST /api/roles`, `GET/PUT/DELETE /api/roles/[id]`.  
  - Then “Users” can assign a Role (id or name) when creating/editing a user.

**Recommendation:** Start with **Option A** so the Roles page has a backend quickly and permission checks can use it; migrate to Option B later if you need custom role names per tenant.

**Seed:** You can seed default permission sets for `super admin`, `company`, `client`, `employee` so they match current behavior and the Roles UI can edit them.

---

### 3rd: **Client** (`/clients`)

**Why last:**

- The Clients page is “client users” (login-enabled clients with last login, deals count, projects count). That is essentially **Users with role = client**, plus optional aggregates.
- Once **Users** API exists, you can implement Clients as:
  - **Option A:** Use the same Users API with filter `role=client` and add optional counts (deals, projects) from Deal/Customer or other tables.
  - **Option B:** Dedicated `GET /api/clients` (and optional POST/PUT/DELETE) that under the hood query User where role = client and join counts.

**Backend to build:**

- `GET /api/clients` – List users where `role = 'client'`, with optional fields: lastLogin, enableLogin, and counts (e.g. deals, projects) from your schema.
- If company can create “client” users: `POST /api/clients` or reuse `POST /api/users` with `role: 'client'`.
- `GET /api/clients/[id]`, `PUT /api/clients/[id]`, `DELETE /api/clients/[id]` – either thin wrappers around Users API or direct User updates with role check.

**Validation:** Same as Users (email uniqueness, required fields). Ensure only `client` role is set for these endpoints if they are dedicated.  
**Seed:** Demo user `client@example.com` already exists; no extra seed required for a first version.

---

## Summary Table

| Order | Menu    | Route    | Priority | Reason |
|-------|---------|----------|----------|--------|
| **1st** | Users   | `/users` | Highest  | User model + seed already exist; base for Roles and Clients. |
| **2nd** | Roles   | `/roles` | Medium   | Manages permissions (and optionally Role entity); depends on Users for “assign role”. |
| **3rd** | Client  | `/clients` | Last   | Subset of Users (role=client) + optional counts; reuse Users API. |

---

## Note on Demo Users

Existing seed users (e.g. `superadmin@example.com`, `company@example.com`, `client@example.com`, `employee@example.com`) are already created in `prisma/seeds/users.ts`. When you implement the **Users** API:

- Use the same **User** (and **Account**) model and password hashing so login keeps working.
- List and update flows should show these demo users so you can test “Manage User” and “Manage Companies” without changing seed for the first iteration.

After the backends are in place, you can add toasts, loading states, and error handling on the three pages (Users, Roles, Client) and optionally extend the seed with more users or default role-permission rows.
