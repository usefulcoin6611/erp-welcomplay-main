# Rekomendasi Backend, Database & Auth untuk ERP Welcomplay

Dokumen ini berisi saran stack yang cocok untuk project ERP ini, mengacu pada struktur yang sudah ada (Next.js 16, TypeScript, RBAC dengan 4 role: super admin, company, client, employee) dan preferensi Payload CMS, MySQL, Prisma.

---

## 1. Rekomendasi Utama (Satu Repo, Full-Stack Next.js)

Cocok jika ingin satu codebase, deploy sederhana, dan tetap memakai pola yang sudah ada (API routes + token).

| Layer     | Teknologi        | Alasan singkat |
|----------|------------------|----------------|
| **Backend** | **Next.js API Routes (App Router)** | Sudah dipakai (`/api/auth/*`), satu repo dengan frontend, TypeScript end-to-end, mudah integrasi dengan Prisma/Auth. |
| **Database** | **MySQL + Prisma** | Sesuai preferensi project, Prisma type-safe, migrasi rapi, cocok untuk ERP (relasi banyak: contract, project, task, user, role). |
| **Auth** | **Auth.js (NextAuth) v5** atau **custom JWT + Prisma** | Auth.js: credentials + JWT, session di server/cookie, mudah tambah OAuth nanti. Alternatif: tetap custom login + Prisma User/Role, issue JWT di API route. |

### Ringkas implementasi

- **Backend**: `src/app/api/**` — route handler untuk auth, contract, support, project, dll.; panggil Prisma di dalam handler.
- **Database**: `prisma/schema.prisma` — model User, Role, Contract, SupportTicket, Project, Task, dll.; jalankan migrasi.
- **Auth**: 
  - Opsi A: Auth.js v5 dengan Credentials provider + Prisma adapter; simpan role di session/JWT.
  - Opsi B: Tetap pakai `AuthService` + `apiClient`; buat route `POST /api/auth/login` yang cek user di Prisma, hash password (bcrypt), return JWT; route `GET /api/auth/me` baca JWT dan return user + role.

---

## 2. Alternatif: Backend Terpisah (Payload CMS + MySQL)

Cocok jika ingin admin panel siap pakai, konten/CRM dikelola lewat CMS, dan auth/user dari Payload.

| Layer     | Teknologi        | Catatan |
|----------|------------------|--------|
| **Backend** | **Payload CMS 3.x** | Headless CMS + REST/GraphQL, auth bawaan, role & permission, upload file, draft/publish. Bisa dipasang di repo terpisah atau monorepo. |
| **Database** | **MySQL** (atau PostgreSQL) | Payload mendukung keduanya; MySQL tetap opsi utama sesuai preferensi. |
| **Auth** | **Payload Auth** | Login/register, JWT/session, role-based access. Frontend Next.js memanggil Payload API; token disimpan (localStorage/cookie) seperti sekarang. |

- **Kelebihan**: Admin UI untuk kontrak, support ticket, user, role; permission halus per collection.
- **Pertimbangan**: ERP butuh banyak custom logic (accounting, workflow); Payload bisa dipakai untuk modul “konten” (contract, support, user) sambil custom API untuk modul berat.

---

## 3. Alternatif: Backend Node.js Terpisah

Cocok jika tim backend dan frontend benar-benar dipisah atau ingin API dipakai oleh banyak client (mobile, third party).

| Layer     | Teknologi        |
|----------|------------------|
| **Backend** | **Node.js + Express/Fastify + TypeScript** |
| **Database** | **MySQL + Prisma** (sama schema dengan opsi 1) |
| **Auth** | **JWT** (issue/verify di backend) + **bcrypt** untuk password; role disimpan di tabel User/Role. |

- Frontend tetap pakai `NEXT_PUBLIC_API_URL` ke backend ini; `AuthService` + `apiClient` tetap dipakai, hanya base URL yang mengarah ke server Node.

---

## 4. Perbandingan Singkat

| Aspek | Next.js API + Prisma + Auth.js | Payload CMS + MySQL | Node.js terpisah |
|-------|--------------------------------|---------------------|-------------------|
| Satu repo | ✅ | Bisa (monorepo) / terpisah | ❌ (umumnya terpisah) |
| Sesuai RBAC existing | ✅ (role di DB + session/JWT) | ✅ (Payload roles) | ✅ (role di DB + JWT) |
| ERP custom logic | ✅ Mudah di route handler | Perlu custom endpoint/hooks | ✅ Penuh kontrol |
| Admin UI | Buat sendiri atau pakai panel sederhana | ✅ Bawaan Payload | Buat sendiri |
| Deploy | Satu app (Vercel/VM) | Satu atau dua service | Backend + frontend terpisah |

---

## 5. Rekomendasi Final

Untuk **ERP Welcomplay** dengan modul contract, support, taskboard, project, leads, deals, accounting, HRM, dan RBAC 4 role:

- **Pilihan paling cocok**: **Backend = Next.js API Routes**, **Database = MySQL + Prisma**, **Auth = Auth.js v5 (Credentials + JWT)** atau **custom JWT + Prisma** (agar selaras dengan `AuthService` dan `apiClient` yang sudah ada).

Langkah praktis yang bisa dilakukan dulu:

1. **Database**: Tambah Prisma, definisikan `User`, `Role`, `Contract`, `SupportTicket`, dll. di `schema.prisma`, lalu migrasi ke MySQL.
2. **Auth**: Implementasi `POST /api/auth/login` dan `GET /api/auth/me` dengan Prisma + bcrypt + JWT; sesuaikan `AuthService`/context agar memakai response yang sama (user + role).
3. **Backend**: Ganti data mock (contract, support, task, dll.) dengan panggilan Prisma di route `src/app/api/...`.

Jika nanti butuh admin panel yang sangat kaya tanpa build dari nol, Payload CMS + MySQL bisa dipertimbangkan untuk bagian konten/user, sambil custom API untuk modul accounting dan workflow yang spesifik.
