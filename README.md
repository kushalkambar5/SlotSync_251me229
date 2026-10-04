# SlotSync — Campus Infrastructure Booking Module

Booking a classroom, seminar hall, or lab at NITK still means paper registers, running around for signatures, and double-bookings nobody notices until the day. **SlotSync** replaces that with live availability, 1-click 1-hour slot requests, role-based approvals, waitlists, penalties, analytics, and instant in-app notifications — all in one place.

Built for the WEC GDG `SlotSync` task (`Full Stack Web Development`, `Databases`, `Authentication & Authorization`, `RBAC` — Difficulty: Medium/Hard). See `project_task.md` for the original spec.

> **Submission note (per spec):** create a **private** repo named `SlotSync_<Roll-No>`, add `aditip149209`, `nilansgit`, `AbhimanyuKapoor` as collaborators. Use MVC + relational DB.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Seed Data — Tables That Must Exist First](#seed-data--tables-that-must-exist-first)
- [Roles & Permissions (RBAC)](#roles--permissions-rbac)
- [Booking Lifecycle](#booking-lifecycle)
- [API Reference](#api-reference)
- [Frontend Routes](#frontend-routes)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Screenshots / Demo](#screenshots--demo)
- [Known Limitations / Bugs](#known-limitations--bugs)
- [References](#references)

---

## Features

### Core (implemented)

**Auth**
- Register / Login / Logout / Me (`JWT` in `Authorization: Bearer` + `httpOnly` cookie, 7d expiry).
- NITK-only emails (`@nitk.edu.in`, case-insensitive, enforced in Zod + service).
- `bcryptjs` password hashing, `helmet`, `cors` with credentials, rate-limiting (`300/min` global, `50/15min` auth).
- New users always get `STUDENT` role — clients cannot self-assign roles.

**Facility Management (Admin)**
- CRUD facilities: `name, code (unique), type, location, building, floor, capacity>0, description, status`.
- Status: `AVAILABLE | UNAVAILABLE | MAINTENANCE`. Only `AVAILABLE + active` is bookable.
- Per-day operating hours (`dayOfWeek 0-6, opensAt, closesAt, isClosed`). Defaults on create: `Mon–Sat 08:00–18:00, Sun closed`.
- Manage `facility-types` (CLASSROOM, LAB, SEMINAR_HALL, AUDITORIUM, MEETING_ROOM seeded) and `departments` (CSE, ECE, ME, CE, EEE, IT seeded).

**Booking — Faculty / Convenor**
- Real-time slot grid per facility + date (backend-computed 60-min slots, frontend never calculates).
- Filter by `type, minCapacity, status, building`.
- Request 1-hour slot inside operating hours. Enforced: `1 active slot per user per day` (partial unique index), past dates blocked, `start < end`.
- Track `PENDING → APPROVED / REJECTED → CANCELLATION_REQUESTED → CANCELLED`.
- Cancellation requires admin approval with mandatory reason.
- Conflict handling: `409 BOOKING_OVERLAP` → UI refetches availability and returns to slot step.

**Booking — Student (read-only)**
- Can browse facilities + availability. Booking buttons replaced with explanatory notice.
- Blocked at API too (`403` without `book_facility` permission).

**Booking — Admin**
- Approve / reject bookings (rejection reason `min 3 chars` required).
- Approve / reject cancellation requests.
- Double-booking impossible: app-level overlap check + Postgres `EXCLUDE USING gist` on `tsrange(date+start, date+end)` `WHERE status='APPROVED'` (race-proof).

**Notifications (in-app)**
- `BOOKING_APPROVED, BOOKING_REJECTED, CANCELLATION_APPROVED, CANCELLATION_REJECTED, BOOKING_REMINDER, WAITLIST_PROMOTED`.
- Bell with unread count (polls every 60s), `mark read / mark all read`, deep-link to booking.
- Reminder job: every `REMINDER_INTERVAL_MS` (default 60s) notifies `APPROVED` bookings starting in 25–35 min (idempotent).

### Bonus (implemented)

1. **Configurable RBAC** — Admin UI to create/edit roles, toggle permission matrix (`POST/DELETE /roles/:id/permissions`), assign roles to users (`PATCH /users/:id/role`). All 13 permissions checked per-request from DB, effective immediately. System roles (`ADMIN, FACULTY, CONVENOR, STUDENT`) cannot be renamed/deactivated. Seeded sensibly (see matrix below).
2. **Waitlist** — `POST /waitlist/` joins FIFO queue per exact slot (`position = count WAITING + 1`). On cancellation approval, earliest `WAITING` entry is `PROMOTED` + notified (promoted user re-books promptly; no auto-booking). Leave via `DELETE /waitlist/:id`.
3. **Penalty / Restrictions** — `booking_restrictions` (`NO_SHOW | ADMIN_RESTRICTION`, `durationHours 1–720, default 24`). Active restriction blocks all new bookings (`422`). Admin: `POST /users/:id/restrictions`, `GET /users/:id/restrictions`. No-show detection is manual (admin applies restriction).
4. **Analytics Dashboard** (`view_analytics`) — overview (`bookingsByStatus, totalFacilities`), top-10 facilities, top-12 peak hours, usage trends (`daily | weekly | monthly`, last 30 periods). Pure CSS bar charts, all backend-aggregated SQL.
5. **Audit Logs** — immutable log on register, bookings, cancellations, facilities/hours, departments/types, users/roles/permissions, restrictions (`actor, action, entityType/Id, old/new JSON, ip, userAgent`). Filterable admin UI.

### Not implemented / partial

- **Mailers (SMTP email)** — notifications are in-app only; no `express-mailer` / SMTP wired up.
- **Auto no-show detection** — schema + enforcement exist, but expiry/marking no-shows is manual via admin restriction endpoint.
- **Auto-booking on waitlist promotion** — intentional: promoted user gets notified to book promptly (avoids stealing the 1-per-day quota).
- No backend tests (`vitest` installed, no test files).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Node.js + TypeScript (`ES2022`, `strict`, `NodeNext`), Express `^5.2.1`, `tsx` dev runner, `tsc` build |
| Validation | `zod ^4.6.5` (body/query/params middleware, Express 5 compat) |
| Auth | `jsonwebtoken ^9.0.3`, `bcryptjs ^3.0.3`, `cookie-parser`, `express-rate-limit`, `helmet`, `cors`, `morgan` |
| DB | PostgreSQL 14+ (`btree_gist` required) + `drizzle-orm ^0.45.3` + `drizzle-kit ^0.31.11` + `pg` + `postgres` |
| Frontend | Next.js `16.3.8` (App Router) + React `19.2.8` + TypeScript `^5` |
| Frontend state | `@tanstack/react-query ^5.104.0` (server state only, `staleTime 30s`), `react-hook-form ^7.89.0` + `@hookform/resolvers` + `zod` |
| UI | `tailwindcss ^4`, `lucide-react`, custom design system (`Button, Input, Dialog, Card, Badge, Pagination`), Poppins font, brand red `#EF2B4D` |
| Ports | Backend `:4000` (`/api/v1`), Frontend `:3000` |

---

## Architecture

**Backend — modular MVC (`routes → controller → service → repository`):**

```
backend/src/
  app.ts, server.ts                    # express wiring, scheduler start
  config/env.ts, config/constants.ts    # env + PERMISSIONS, transitions
  db/
    client.ts, migrate.ts, seed.ts
    schema/                            # enums, departments, roles, permissions,
                                       # role-permissions, users, facility-types,
                                       # facilities, facility-operating-hours,
                                       # bookings, cancellation-requests,
                                       # notifications, audit-logs,
                                       # waitlist-entries, booking-restrictions, relations
    sql/00-extensions.sql, 01-booking-overlap-exclusion.sql
  middleware/auth, permission, validation, error, rate-limit
  routes/index.ts                       # mounts /api/v1 + /health
  modules/
    auth/ bookings/ cancellations/ facilities/
    facility-types/ departments/ users/ rbac/
    waitlist/ notifications/ audit/ analytics/
  jobs/scheduler.ts, reminder.job.ts
  utils/response, errors, async-handler, logger, date
```

Response envelope: `{ success: true, data[, meta] }` / `{ success: false, error: { code, message } }`. Pagination: `?page=1&limit=20 (max 100)` → `meta: { page, limit, total }`.

**Frontend — App Router + feature slices:**

```
frontend/
  app/
    layout.tsx, page.tsx (marketing, authed → /dashboard), globals.css
    about/, faq/
    (auth)/login, register, unauthorized
    (app)/dashboard, facilities, facilities/[facilityId],
           bookings, bookings/new (5-step wizard), bookings/[bookingId],
           notifications, profile
    (admin)/admin, admin/bookings[/[bookingId]], admin/cancellations,
             admin/facilities[/new,/[facilityId]],
             admin/users[/[userId]], admin/roles,
             admin/analytics, admin/audit-logs
  components/ui, layout/, navigation/, auth/, feedback/, marketing (flat)
  features/auth, facilities, bookings, cancellations,
           notifications, users, analytics
  lib/api/client, api/errors, auth/session, auth/permissions, utils/format
  providers/AuthProvider, QueryProvider
  types/api, auth, facility, booking, user, notification, audit
```

Key rules (see `frontend/frontend_plan.md`, 60-section spec): backend is authoritative for availability; frontend never does `if (role === 'admin')` — only `can(permission)`; pages never call `fetch()` directly (use `lib/api/client` + `features/*/hooks`).

---

## Database Schema

14 tables + 6 enums. Simplified ER:

```
departments (id, name, code UNIQUE)
roles (id, name UNIQUE, isSystemRole) ──< role_permissions >── permissions (id, name, resource, action)
users (id, name, email UNIQUE, passwordHash, departmentId→departments, roleId→roles RESTRICT)
facility_types (id, name UNIQUE)
facilities (id, name, code UNIQUE, typeId→facility_types, capacity>0, status, isActive)
facility_operating_hours (facilityId, dayOfWeek 0-6, opensAt, closesAt, isClosed) UNIQUE(facilityId, dayOfWeek)
bookings (id, userId→users, facilityId→facilities, bookingDate, startTime, endTime,
          status, purpose, rejectionReason, approved/rejected/cancelled At/By)
  + UNIQUE(userId, bookingDate) WHERE status IN (PENDING, APPROVED, CANCELLATION_REQUESTED)
  + EXCLUDE (facility_id =, tsrange(date+start, date+end)) WHERE (status='APPROVED')
cancellation_requests (id, bookingId→bookings, requestedBy, reason, status, reviewedBy/At)
  + UNIQUE(bookingId) WHERE status='PENDING'
waitlist_entries (id, userId, facilityId, bookingDate, startTime, endTime, position>0, status)
booking_restrictions (id, userId, reason, type, startsAt, expiresAt)
notifications (id, userId, bookingId NULLABLE, type, title, message, isRead)
audit_logs (id, actorUserId NULLABLE, action, entityType, entityId, old/new JSONB, ip, userAgent)
```

Enums: `facility_status (AVAILABLE, UNAVAILABLE, MAINTENANCE)`, `booking_status (PENDING, APPROVED, REJECTED, CANCELLATION_REQUESTED, CANCELLED)`, `cancellation_status (PENDING, APPROVED, REJECTED)`, `notification_type (6)`, `waitlist_status (WAITING, PROMOTED, CANCELLED, EXPIRED)`, `restriction_type (NO_SHOW, ADMIN_RESTRICTION)`.

---

## Seed Data — Tables That Must Exist First

`backend/src/db/seed.ts:57-85` seeds exactly **5 tables** (idempotent via `onConflictDoNothing`). Run `npm run db:seed` after `db:migrate` — nothing works without these. Everything else (`users, facilities, facility_operating_hours, bookings, cancellation_requests, notifications, audit_logs, waitlist_entries, booking_restrictions`) is **runtime-created, don't premake it**.

### 1. `roles` — `seed.ts:9-14`

Required: `users.role_id NOT NULL REFERENCES roles(id)` (`schema/users.ts:26-28`). No user can register/login without these.

| name | description | isSystemRole |
|---|---|---|
| `ADMIN` | Facility manager with full control | `true` |
| `FACULTY` | Can browse facilities and request bookings | `true` |
| `CONVENOR` | Same booking permissions as faculty | `true` |
| `STUDENT` | Read-only facility and availability browsing | `true` |

### 2. `permissions` — `seed.ts:17-31` / `config/constants.ts:3-17`

Required: permission middleware is DB-driven, not hardcoded (`middleware/permission.middleware.ts`). 13 rows:

| name | resource | action |
|---|---|---|
| `view_facilities` | `facility` | `view` |
| `view_availability` | `availability` | `view` |
| `book_facility` | `booking` | `create` |
| `cancel_booking` | `booking` | `cancel` |
| `approve_booking` | `booking` | `approve` |
| `reject_booking` | `booking` | `reject` |
| `approve_cancellation` | `cancellation` | `approve` |
| `reject_cancellation` | `cancellation` | `reject` |
| `manage_facilities` | `facility` | `manage` |
| `manage_users` | `user` | `manage` |
| `manage_roles` | `role` | `manage` |
| `view_analytics` | `analytics` | `view` |
| `view_audit_logs` | `audit_log` | `view` |

### 3. `role_permissions` (join) — `seed.ts:33-38,70-82`

Required: without this RBAC returns empty even if roles + permissions exist.

| role | permissions |
|---|---|
| `ADMIN` | all 13 above |
| `FACULTY` | `view_facilities, view_availability, book_facility, cancel_booking` |
| `CONVENOR` | `view_facilities, view_availability, book_facility, cancel_booking` |
| `STUDENT` | `view_facilities, view_availability` |

### 4. `departments` — `seed.ts:40-47`

Required: `users.department_id REFERENCES departments(id)` + register dropdown (`schema/users.ts:23-25`).

| name | code |
|---|---|
| Computer Science and Engineering | `CSE` |
| Electronics and Communication | `ECE` |
| Mechanical Engineering | `ME` |
| Civil Engineering | `CE` |
| Electrical Engineering | `EEE` |
| Information Technology | `IT` |

### 5. `facility_types` — `seed.ts:49-55`

Required: `facilities.type_id NOT NULL REFERENCES facility_types(id)` (`schema/facilities.ts:24-26`). Admin can't add a facility without these.

| name | description |
|---|---|
| `CLASSROOM` | Standard teaching classroom |
| `LAB` | Practical / computer laboratory |
| `SEMINAR_HALL` | Mid-size seminar hall |
| `AUDITORIUM` | Large auditorium |
| `MEETING_ROOM` | Small meeting room |

---

## Roles & Permissions (RBAC)

DB-driven. 13 canonical permissions (`src/config/constants.ts`, mirrored in `frontend/lib/auth/permissions.ts`):

`view_facilities, view_availability, book_facility, cancel_booking, approve_booking, reject_booking, approve_cancellation, reject_cancellation, manage_facilities, manage_users, manage_roles, view_analytics, view_audit_logs`

| Permission | ADMIN | FACULTY | CONVENOR | STUDENT |
|---|:---:|:---:|:---:|:---:|
| view_facilities, view_availability | ✅ | ✅ | ✅ | ✅ |
| book_facility, cancel_booking | ✅ | ✅ | ✅ | ❌ |
| approve_booking, reject_booking, approve_cancellation, reject_cancellation, manage_facilities, manage_users, manage_roles, view_analytics, view_audit_logs | ✅ | ❌ | ❌ | ❌ |

Admin layout requires any of 6 (`approve_booking, manage_facilities, manage_users, manage_roles, view_analytics, view_audit_logs`); individual pages narrow further.

---

## Booking Lifecycle

```
PENDING ──approve──→ APPROVED ──request cancellation──→ CANCELLATION_REQUESTED ──approve──→ CANCELLED
   │                        │                                   │
   └──reject (reason)──→ REJECTED   └── (reject cancellation) ──┘──→ back to APPROVED
```

- Create (`POST /bookings`): facility must be `active + AVAILABLE`, slot inside operating hours, no active restriction, no other active booking that day. Exactly 60 min.
- Approve: re-validates facility/hours + overlap check, then `UPDATE` inside transaction (exclusion constraint is final arbiter).
- Cancel flow uses separate `cancellation_requests` table (one `PENDING` per booking). On approval: booking → `CANCELLED` + waitlist promotion attempted (best-effort); on rejection: booking reverts to `APPROVED`.

---

## API Reference

Base: `http://localhost:4000/api/v1`. Auth: `Authorization: Bearer <jwt>` or `slotsync_token` cookie (`credentials: include`). Errors map Postgres codes (`23505 → 409 DAILY_BOOKING_LIMIT`, `23P01 → 409 BOOKING_OVERLAP`).

| Method | Path | Access |
|---|---|---|
| GET | `/health` | public |
| POST | `/auth/register {name,email(@nitk.edu.in),password,departmentId?}` | public |
| POST | `/auth/login {email,password}` | public |
| POST | `/auth/logout` | public |
| GET | `/auth/me`, `/users/me` | authenticated |
| PATCH | `/users/me {name?}` | authenticated |
| GET | `/users/?roleId&search&isActive&page&limit`, `GET /users/:id` | `manage_users` |
| PATCH | `/users/:id`, `/users/:id/status`, `/users/:id/role` | `manage_users` |
| POST | `/users/:id/restrictions`, `GET /users/:id/restrictions` | `manage_users` |
| GET/POST | `/roles/`, `GET/PATCH /roles/:id`, `PATCH /roles/:id/status` | `manage_roles` |
| POST/DELETE | `/roles/:id/permissions[/:permissionId]`, `GET /permissions/` | `manage_roles` |
| GET | `/departments/`, `/departments/:id` | public |
| POST/PATCH | `/departments/` | `manage_facilities` |
| GET | `/facility-types/` | public |
| POST/PATCH | `/facility-types/` | `manage_facilities` |
| GET | `/facilities/?typeId&minCapacity&status&building&page&limit`, `GET /facilities/:id` | authenticated |
| POST/PATCH | `/facilities/`, `/facilities/:id`, `PATCH /facilities/:id/status` | `manage_facilities` |
| GET/PUT | `/facilities/:id/operating-hours` | auth / `manage_facilities` |
| GET | `/facilities/:id/availability?date=YYYY-MM-DD` | authenticated |
| POST | `/bookings/ {facilityId,bookingDate,startTime,endTime,purpose?}` | `book_facility` |
| GET | `/bookings/?status&facilityId&userId&date&page&limit` (non-admin forced to self) | authenticated |
| GET | `/bookings/:id` (owner or admin) | authenticated |
| POST | `/bookings/:id/approve` | `approve_booking` |
| POST | `/bookings/:id/reject {reason}` | `reject_booking` |
| POST | `/bookings/:id/cancellation-request {reason}` | `cancel_booking` (owner) |
| GET | `/cancellations/?status…` | `approve_cancellation` |
| POST | `/cancellations/:id/approve`, `/cancellations/:id/reject {reason}` | `approve_cancellation` / `reject_cancellation` |
| POST | `/waitlist/ {facilityId,bookingDate,startTime,endTime}` | `book_facility` |
| GET | `/waitlist/facilities/:id/waitlist`, `DELETE /waitlist/:id` | authenticated (owner or `manage_facilities`) |
| GET | `/notifications/?unread&page&limit`, `/notifications/unread-count` | authenticated (own) |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | authenticated (own) |
| GET | `/audit-logs/?actorUserId&entityType&entityId&action&from&to…` | `view_audit_logs` |
| GET | `/analytics/overview`, `/analytics/facilities`, `/analytics/peak-hours`, `/analytics/usage-trends?granularity=daily\|weekly\|monthly` | `view_analytics` |

---

## Frontend Routes

Public: `/, /about, /faq, /login, /register, /unauthorized`.
App (login required): `/dashboard, /facilities, /facilities/[facilityId], /bookings, /bookings/new?facilityId&date&start&end (Requires `book_facility`), /bookings/[bookingId], /notifications, /profile`.
Admin (permission-gated): `/admin, /admin/bookings[/[bookingId]], /admin/cancellations, /admin/facilities[/new,/[facilityId]], /admin/users[/[userId]], /admin/roles, /admin/analytics, /admin/audit-logs`.

Booking wizard (`/bookings/new`): `Facility → Date → Slot (AvailabilitySlotGrid) → Details (purpose) → Done`. Sidebar filters `adminNav` by `can()`; students see availability with booking CTA replaced.

---

## Getting Started

### Prerequisites

- Node.js 18+ (ES2022)
- PostgreSQL 14+ with `btree_gist` available (created automatically by `src/db/sql/00-extensions.sql`)
- `npm` (or yarn/pnpm/bun for frontend)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set strong JWT_SECRET, DATABASE_URL, CORS_ORIGIN

npm install
npm run db:generate   # only after schema changes
npm run db:migrate    # drizzle migrate + applies src/db/sql/*.sql (overlap exclusion)
npm run db:seed       # idempotent: roles + 13 permissions + mapping + departments + facility_types
npm run dev           # → http://localhost:4000  (GET / → { name: SlotSync API })
```

Verify: `GET http://localhost:4000/api/v1/health` should return DB `select 1` OK.

### 2. Frontend

```bash
cd frontend
# .env already contains NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
# cp .env.example .env  (if needed)

npm install
npm run dev           # → http://localhost:3000
```

Login flow: register (any `@nitk.edu.in` email → becomes STUDENT) → login → `/dashboard`. For Faculty/Admin access, have an admin change your role via `/admin/users/[userId]` (`PATCH /users/:id/role`), or update directly in DB.

### 3. Full-stack check

1. Start backend (`:4000`) + frontend (`:3000`).
2. Register → browse `/facilities` → pick date → see slot grid.
3. As Faculty/Convenor: `/bookings/new` → request → `PENDING`.
4. As Admin: `/admin/bookings` → approve → user gets notification + 30-min reminder job fires automatically.

---

## Environment Variables

**`backend/.env` (see `.env.example`):**

```
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/slotsync
JWT_SECRET=change-me-to-a-long-random-string   # required, use ≥32 random hex in prod
JWT_EXPIRES_IN=7d
PORT=4000
COOKIE_NAME=slotsync_token
CORS_ORIGIN=http://localhost:3000              # comma-separated allowlist
REMINDER_INTERVAL_MS=60000
```

**`frontend/.env`:**

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Frontend sends `Authorization: Bearer <token>` (localStorage `slotsync_token`) **and** `credentials: include` (httpOnly cookie) — either works.

---

## Scripts

Backend (`backend/package.json`): `dev (tsx watch)`, `start (tsx)`, `build (tsc)`, `typecheck`, `db:generate`, `db:migrate`, `db:push`, `db:studio`, `db:seed`.
Frontend: `dev (next dev)`, `build`, `start`, `lint`.

---

## Screenshots / Demo

> TODO per spec Tips: add demo video link + screenshots here before submission.

- [ ] Demo video (≤5 min: register → browse → book → approve → cancel → waitlist → analytics)
- [ ] Screenshots: `/` marketing, `/facilities` grid, `/facilities/[id]` slot grid, `/bookings/new` wizard, `/admin/bookings` queue, `/admin/analytics`, notifications bell, `/admin/roles` matrix
- [ ] Brand assets already in `frontend/public/`: `logo.png`, `navbar_logo.png`, `SlotSync_Brand_Identity_Guide.png`

---

## Known Limitations / Bugs

- No email sending — reminders/notifications are in-app only.
- Waitlist `position` counts all `WAITING` entries for `facility + date` (not exact slot), so positions can skip numbers for a given hour.
- Availability uses UTC `dayOfWeek`; deployments far from IST may map operating hours to the wrong weekday around midnight.
- `GET /facilities/:id/waitlist` alias in `routes/index.ts` is unauthenticated (main `/waitlist/facilities/:id/waitlist` is authed).
- `next-auth` is a backend dependency but unused in `src/`.
- `frontend/AGENTS.md` + `CLAUDE.md` contain only Next.js agent boilerplate, no project rules.
- No seed admin user — first admin must be promoted manually via DB (`users.roleId → ADMIN role`).

---

## References

- Spec: `project_task.md` (this repo)
- Frontend spec: `frontend/frontend_plan.md` (2461 lines, 13 phases)
- Auth: [Passport.js](https://www.passportjs.org/), [Django Auth](https://docs.djangoproject.com/en/4.0/topics/auth/), [Devise](https://guides.railsgirls.com/devise)
- Mailers (not yet wired): [express-mailer](https://www.npmjs.com/package/express-mailer)
- DB: [Hybrid Schemas](https://www.stratoscale.com/blog/dbaas/hybrid-databases-combining-relational-nosql/), Drizzle docs, Postgres `btree_gist` + `EXCLUDE` constraints
