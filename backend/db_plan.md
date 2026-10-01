# SlotSync — PostgreSQL Database Plan

## 1. Purpose

This document defines the PostgreSQL database architecture for **SlotSync**, a campus infrastructure booking system.

The design is based on the SlotSync task requirements:

- Authentication is mandatory.
- Roles: Admin/Facility Manager, Faculty, Convenor, Student.
- Faculty and Convenor can create bookings.
- Students can only view facilities and availability.
- Admins manage facilities and approve/reject bookings and cancellation requests.
- Facilities have operating hours and availability/maintenance status.
- Bookings are one-hour slots.
- A user can make at most one booking per day.
- Approved bookings must never overlap for the same facility.
- Notifications are required for booking decisions and 30-minute reminders.
- Configurable RBAC, waitlists, penalties, analytics and auditability are supported as scalable extensions.

---

# 2. Database Design Principles

The database follows these principles:

1. **PostgreSQL as the source of truth**
2. **UUID primary keys**
3. **Foreign keys for relational integrity**
4. **`TIMESTAMPTZ` for timestamps**
5. **Soft deactivation instead of destructive deletion for important entities**
6. **Database constraints for invariants where practical**
7. **Transactional booking creation**
8. **PostgreSQL exclusion constraint for approved-booking overlap prevention**
9. **Database-driven RBAC**
10. **Indexes based on expected query patterns**
11. **Historical booking and audit data must remain intact**
12. **Business rules are enforced in the backend and supported by database constraints**

---

# 3. Entity Overview

## Core tables

1. `departments`
2. `users`
3. `roles`
4. `permissions`
5. `role_permissions`
6. `facility_types`
7. `facilities`
8. `facility_operating_hours`
9. `bookings`
10. `cancellation_requests`
11. `notifications`
12. `audit_logs`

## Optional / Bonus tables

13. `waitlist_entries`
14. `booking_restrictions`

---

# 4. High-Level Relationship Diagram

```text
                              ┌──────────────────┐
                              │   departments    │
                              └────────┬─────────┘
                                       │
                                       │ 1:N
                                       ▼
┌──────────────┐               ┌──────────────┐
│    roles     │◄──────────────│    users     │
└──────┬───────┘      N:1      └──────┬───────┘
       │                              │
       │ 1:N                          │
       ▼                              │
┌──────────────────┐                  │
│ role_permissions │                  │
└────────┬─────────┘                  │
         │                            │
         │ N:1                        │
         ▼                            │
┌────────────────┐                    │
│  permissions   │                    │
└────────────────┘                    │
                                      │
             ┌────────────────────────┼───────────────────────┐
             │                        │                       │
             │ 1:N                    │ 1:N                   │ 1:N
             ▼                        ▼                       ▼
      ┌─────────────┐          ┌───────────────┐       ┌──────────────┐
      │  bookings   │          │notifications  │       │  audit_logs  │
      └──────┬──────┘          └───────────────┘       └──────────────┘
             │
             │ 1:N
             ▼
      ┌──────────────────────┐
      │ cancellation_requests│
      └──────────────────────┘


┌──────────────────┐
│  facility_types  │
└────────┬─────────┘
         │ 1:N
         ▼
┌─────────────────────────┐
│       facilities        │
└────────────┬────────────┘
             │
             ├─────────────────────────┐
             │ 1:N                    │ 1:N
             ▼                         ▼
┌─────────────────────────┐     ┌─────────────────┐
│facility_operating_hours│     │    bookings     │
└─────────────────────────┘     └─────────────────┘


users
 │
 ├───────────────► waitlist_entries
 │
 └───────────────► booking_restrictions
```

---

# 5. Table: `departments`

Stores campus departments/branches.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `name` | VARCHAR(150) | NOT NULL |
| `code` | VARCHAR(20) | NOT NULL, UNIQUE |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Example records

```text
Computer Science and Engineering  → CSE
Electronics and Communication     → ECE
Mechanical Engineering            → ME
Civil Engineering                 → CE
Electrical Engineering            → EEE
Information Technology            → IT
```

## Constraints

```text
UNIQUE(code)
```

---

# 6. Table: `users`

Stores application users.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `department_id` | UUID | FK → departments.id |
| `role_id` | UUID | NOT NULL, FK → roles.id |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Relationships

```text
users.department_id → departments.id
users.role_id       → roles.id
```

## Notes

`role_id` is used instead of storing a raw role string such as:

```text
role = "FACULTY"
```

This is required for the configurable RBAC architecture.

## Constraints

```text
UNIQUE(email)
```

For robust email uniqueness, normalize emails to lowercase before storage or use a PostgreSQL functional unique index on `LOWER(email)`.

---

# 7. Table: `roles`

Stores application roles.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE |
| `description` | TEXT | NULL |
| `is_system_role` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Default roles

```text
ADMIN
FACULTY
CONVENOR
STUDENT
```

## `is_system_role`

System roles should not normally be deletable through the UI.

Example:

```text
ADMIN     → true
FACULTY   → true
CONVENOR  → true
STUDENT   → true

EVENT_COORDINATOR → false
```

---

# 8. Table: `permissions`

Stores atomic application permissions.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `name` | VARCHAR(150) | NOT NULL |
| `description` | TEXT | NULL |
| `resource` | VARCHAR(100) | NOT NULL |
| `action` | VARCHAR(100) | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Example permissions

```text
view_facilities
view_availability
book_facility
cancel_booking

approve_booking
reject_booking

approve_cancellation
reject_cancellation

manage_facilities
manage_users
manage_roles
view_analytics
```

## Recommended model

Store permissions using:

```text
resource + action
```

Example:

```text
resource = booking
action   = approve
```

The `name` can be a stable human-readable identifier such as:

```text
approve_booking
```

## Constraint

```text
UNIQUE(resource, action)
```

---

# 9. Table: `role_permissions`

Many-to-many relationship between roles and permissions.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `role_id` | UUID | FK → roles.id |
| `permission_id` | UUID | FK → permissions.id |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Primary Key

```text
PRIMARY KEY(role_id, permission_id)
```

This prevents duplicate role-permission assignments.

## Example

```text
FACULTY
 ├── view_facilities
 ├── view_availability
 ├── book_facility
 └── cancel_booking
```

---

# 10. Table: `facility_types`

Stores facility categories.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL, UNIQUE |
| `description` | TEXT | NULL |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Example

```text
CLASSROOM
LAB
SEMINAR_HALL
AUDITORIUM
MEETING_ROOM
```

---

# 11. Table: `facilities`

Stores physical campus facilities.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `name` | VARCHAR(150) | NOT NULL |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE |
| `type_id` | UUID | NOT NULL, FK → facility_types.id |
| `location` | TEXT | NULL |
| `building` | VARCHAR(100) | NULL |
| `floor` | VARCHAR(30) | NULL |
| `capacity` | INTEGER | NOT NULL |
| `description` | TEXT | NULL |
| `status` | FACILITY_STATUS | NOT NULL |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Facility status

```text
AVAILABLE
UNAVAILABLE
MAINTENANCE
```

## Important constraints

```text
UNIQUE(code)

capacity > 0
```

`is_active` is separate from `status`.

For example:

```text
is_active = true
status = MAINTENANCE
```

means the facility exists but is temporarily unavailable for booking.

```text
is_active = false
```

means the facility is retired/deactivated.

---

# 12. Table: `facility_operating_hours`

Stores operating hours per day of the week.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `facility_id` | UUID | NOT NULL, FK → facilities.id |
| `day_of_week` | SMALLINT | NOT NULL |
| `opens_at` | TIME | NULL |
| `closes_at` | TIME | NULL |
| `is_closed` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Day representation

Use:

```text
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
```

or consistently use another convention. The application and database must use the same convention.

## Constraints

```text
UNIQUE(facility_id, day_of_week)
```

When:

```text
is_closed = false
```

then:

```text
opens_at IS NOT NULL
closes_at IS NOT NULL
opens_at < closes_at
```

When:

```text
is_closed = true
```

`opens_at` and `closes_at` should normally be NULL.

---

# 13. Table: `bookings`

This is the central transaction table.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `user_id` | UUID | NOT NULL, FK → users.id |
| `facility_id` | UUID | NOT NULL, FK → facilities.id |
| `booking_date` | DATE | NOT NULL |
| `start_time` | TIME | NOT NULL |
| `end_time` | TIME | NOT NULL |
| `status` | BOOKING_STATUS | NOT NULL |
| `purpose` | TEXT | NULL |
| `rejection_reason` | TEXT | NULL |
| `approved_at` | TIMESTAMPTZ | NULL |
| `approved_by` | UUID | NULL, FK → users.id |
| `rejected_at` | TIMESTAMPTZ | NULL |
| `rejected_by` | UUID | NULL, FK → users.id |
| `cancelled_at` | TIMESTAMPTZ | NULL |
| `cancelled_by` | UUID | NULL, FK → users.id |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Booking statuses

```text
PENDING
APPROVED
REJECTED
CANCELLATION_REQUESTED
CANCELLED
```

## Why `rejected_by` and `rejected_at`?

They should be included even though they were not in the initial simplified design.

They make the booking lifecycle auditable without requiring every query to reconstruct rejection information from `audit_logs`.

---

# 14. Booking lifecycle

```text
                         ┌───────────┐
                         │  PENDING  │
                         └─────┬─────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
               APPROVED                REJECTED
                    │
                    ▼
       CANCELLATION_REQUESTED
              │           │
              ▼           ▼
          CANCELLED    APPROVED
```

The backend service must enforce legal transitions.

Examples:

```text
PENDING → APPROVED                 allowed
PENDING → REJECTED                 allowed

APPROVED → CANCELLATION_REQUESTED  allowed
CANCELLATION_REQUESTED → CANCELLED allowed
CANCELLATION_REQUESTED → APPROVED  allowed

CANCELLED → APPROVED               forbidden
REJECTED → APPROVED                forbidden
```

---

# 15. Booking validation rules

The backend must enforce:

1. User has `book_facility`.
2. Facility exists and is active.
3. Facility status is `AVAILABLE`.
4. Requested slot is exactly one hour.
5. Requested slot lies inside operating hours.
6. User has no active booking for that day.
7. Requested slot does not overlap an approved booking.
8. User does not have an active booking restriction.
9. Booking date/time is valid.
10. Booking is created as `PENDING`.

The database should additionally enforce the constraints that are suitable for database-level enforcement.

---

# 16. One-hour slot rule

The application should enforce:

```text
end_time - start_time = 1 hour
```

For example:

```text
10:00 → 11:00  valid
10:30 → 11:30  valid only if the system supports arbitrary one-hour slots
10:00 → 12:00  invalid
```

If SlotSync is intentionally designed around fixed hourly boundaries, then additionally enforce:

```text
minutes(start_time) = 0
minutes(end_time) = 0
```

The current task only requires a one-hour slot, so arbitrary one-hour ranges are not prohibited by the source specification.

---

# 17. Approved booking overlap protection

This is one of the most important database guarantees.

Two approved bookings for the same facility must never overlap.

Example:

```text
Facility A

Existing:
10:00 → 11:00 APPROVED

Attempt:
10:30 → 11:30 APPROVED
```

The second booking must be rejected.

## PostgreSQL approach

Use a PostgreSQL range and GiST exclusion constraint.

Conceptually:

```sql
EXCLUDE USING gist (
    facility_id WITH =,
    booking_range WITH &&
)
WHERE (status = 'APPROVED');
```

The exact implementation can use a generated `tstzrange`/`tsrange` column or an equivalent PostgreSQL expression.

Because this is a PostgreSQL-specific constraint, enable the required GiST support extension, typically:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

The exact Drizzle implementation should be finalized when writing the schema/migration.

## Why this matters

A normal application flow:

```text
SELECT overlapping booking
        ↓
none found
        ↓
INSERT booking
```

can race under concurrent requests.

A database exclusion constraint protects the invariant even when two requests arrive simultaneously.

---

# 18. One booking per user per day

The requirement is:

```text
1 slot per day per user
```

This should be enforced in the booking service inside a transaction.

Do not blindly use:

```text
UNIQUE(user_id, booking_date)
```

because rejected and cancelled bookings should not necessarily permanently consume the user's day.

The exact database implementation can use a partial unique index for active statuses if desired.

Recommended active statuses:

```text
PENDING
APPROVED
CANCELLATION_REQUESTED
```

Example concept:

```sql
CREATE UNIQUE INDEX ...
ON bookings(user_id, booking_date)
WHERE status IN (
    'PENDING',
    'APPROVED',
    'CANCELLATION_REQUESTED'
);
```

This gives the database an additional safety layer.

---

# 19. Booking indexes

Recommended indexes:

```text
bookings(facility_id, booking_date)

bookings(facility_id, booking_date, status)

bookings(user_id, booking_date)

bookings(status)

bookings(approved_by)

bookings(created_at)
```

The most important availability query is:

```text
facility + date + status
```

so:

```text
(facility_id, booking_date, status)
```

is particularly useful.

---

# 20. Table: `cancellation_requests`

Cancellation is modeled as a separate workflow.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `booking_id` | UUID | NOT NULL, FK → bookings.id |
| `requested_by` | UUID | NOT NULL, FK → users.id |
| `reason` | TEXT | NOT NULL |
| `status` | CANCELLATION_STATUS | NOT NULL |
| `reviewed_by` | UUID | NULL, FK → users.id |
| `reviewed_at` | TIMESTAMPTZ | NULL |
| `review_reason` | TEXT | NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Status

```text
PENDING
APPROVED
REJECTED
```

## Relationship

```text
booking
   │
   └── cancellation_request
```

Only one active pending cancellation request should normally exist for a booking.

Recommended partial unique index:

```text
UNIQUE(booking_id)
WHERE status = 'PENDING'
```

---

# 21. Table: `notifications`

Stores in-app notifications.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `user_id` | UUID | NOT NULL, FK → users.id |
| `booking_id` | UUID | NULL, FK → bookings.id |
| `type` | NOTIFICATION_TYPE | NOT NULL |
| `title` | VARCHAR(200) | NOT NULL |
| `message` | TEXT | NOT NULL |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `read_at` | TIMESTAMPTZ | NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Notification types

```text
BOOKING_APPROVED
BOOKING_REJECTED

CANCELLATION_APPROVED
CANCELLATION_REJECTED

BOOKING_REMINDER

WAITLIST_PROMOTED
```

`booking_id` should be nullable because not every future notification necessarily needs to reference a booking.

---

# 22. Notification indexes

```text
notifications(user_id, is_read)

notifications(user_id, created_at)

notifications(booking_id)

notifications(created_at)
```

For a user's notification feed, the main query becomes:

```text
WHERE user_id = ?
ORDER BY created_at DESC
```

---

# 23. Table: `waitlist_entries`

Optional bonus functionality.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `user_id` | UUID | NOT NULL, FK → users.id |
| `facility_id` | UUID | NOT NULL, FK → facilities.id |
| `booking_date` | DATE | NOT NULL |
| `start_time` | TIME | NOT NULL |
| `end_time` | TIME | NOT NULL |
| `position` | INTEGER | NOT NULL |
| `status` | WAITLIST_STATUS | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Status

```text
WAITING
PROMOTED
CANCELLED
EXPIRED
```

## Uniqueness

Prevent duplicate active waitlist entries for the same user and slot.

Conceptually:

```text
UNIQUE(
    user_id,
    facility_id,
    booking_date,
    start_time,
    end_time
)
```

If users should be able to rejoin after cancellation, use a partial unique index for active `WAITING` records instead of a global unique constraint.

---

# 24. Waitlist position

`position` represents FIFO ordering.

Example:

```text
position 1 → User A
position 2 → User B
position 3 → User C
```

When a slot becomes available:

```text
slot cancelled
     ↓
find WAITING entry with lowest position
     ↓
promote first user
     ↓
create booking / promotion
     ↓
create notification
```

This process must happen transactionally.

---

# 25. Table: `booking_restrictions`

Optional penalty system.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `user_id` | UUID | NOT NULL, FK → users.id |
| `reason` | TEXT | NOT NULL |
| `restriction_type` | RESTRICTION_TYPE | NOT NULL |
| `starts_at` | TIMESTAMPTZ | NOT NULL |
| `expires_at` | TIMESTAMPTZ | NOT NULL |
| `created_by` | UUID | NULL, FK → users.id |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Restriction types

Initially:

```text
NO_SHOW
ADMIN_RESTRICTION
```

The schema can support additional types later.

## Constraint

```text
expires_at > starts_at
```

---

# 26. Active restriction check

A booking request should check:

```text
restriction.starts_at <= now
AND
restriction.expires_at > now
```

If an active restriction exists:

```text
booking request → reject
```

The specified bonus behavior is a 24-hour restriction after a no-show.

---

# 27. Table: `audit_logs`

Provides an immutable history of important actions.

## Columns

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | UUID | PRIMARY KEY |
| `actor_user_id` | UUID | NULL, FK → users.id |
| `action` | VARCHAR(150) | NOT NULL |
| `entity_type` | VARCHAR(100) | NOT NULL |
| `entity_id` | UUID | NULL |
| `old_values` | JSONB | NULL |
| `new_values` | JSONB | NULL |
| `ip_address` | INET | NULL |
| `user_agent` | TEXT | NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

## Example

```text
actor_user_id = admin123
action        = BOOKING_APPROVED
entity_type   = booking
entity_id     = booking456
```

## Why JSONB?

Different entities have different fields.

For example:

```json
{
  "status": "PENDING"
}
```

can become:

```json
{
  "status": "APPROVED"
}
```

without requiring a different audit table for every entity.

---

# 28. Audit log indexes

```text
audit_logs(actor_user_id)

audit_logs(entity_type, entity_id)

audit_logs(created_at)
```

For a high-volume production system, audit logs can later be partitioned by date.

For the current project, normal indexing is sufficient.

---

# 29. Soft deletion strategy

Do not physically delete important historical entities.

## Users

```text
is_active = false
```

## Facilities

```text
is_active = false
```

## Roles

```text
is_active = false
```

## Facility types

```text
is_active = false
```

This preserves references from historical records.

---

# 30. Foreign Key Delete Rules

Recommended policy:

### Users

Historical bookings should not disappear when a user is deactivated.

Therefore:

```text
bookings.user_id
→ users.id
ON DELETE RESTRICT
```

or otherwise preserve the referenced user record.

### Facilities

Do not cascade-delete bookings.

Use:

```text
facilities.id
→ bookings.facility_id
ON DELETE RESTRICT
```

and deactivate the facility instead.

### Roles

Do not delete a role while users still reference it.

```text
roles.id
→ users.role_id
ON DELETE RESTRICT
```

### Permissions

Do not cascade-delete permissions unexpectedly from the system.

For `role_permissions`, cascading from a role/permission to the join rows is reasonable.

---

# 31. Indexing Strategy

Indexes should support actual queries rather than being added indiscriminately.

## Users

```text
UNIQUE(email)

INDEX(role_id)

INDEX(department_id)

INDEX(is_active)
```

## Departments

```text
UNIQUE(code)
```

## Roles

```text
UNIQUE(name)
```

## Permissions

```text
UNIQUE(resource, action)
```

## Facilities

```text
UNIQUE(code)

INDEX(type_id)

INDEX(status)

INDEX(capacity)

INDEX(type_id, capacity, status)
```

The composite index should be retained only if the actual query workload uses this filter combination frequently.

## Facility operating hours

```text
UNIQUE(facility_id, day_of_week)
```

## Bookings

```text
INDEX(facility_id, booking_date)

INDEX(facility_id, booking_date, status)

INDEX(user_id, booking_date)

INDEX(status)

INDEX(created_at)
```

## Notifications

```text
INDEX(user_id, is_read)

INDEX(user_id, created_at)

INDEX(booking_id)
```

## Audit logs

```text
INDEX(actor_user_id)

INDEX(entity_type, entity_id)

INDEX(created_at)
```

---

# 32. Important PostgreSQL extensions

For overlap protection, use:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

This allows the facility UUID equality operator to participate in a GiST exclusion constraint.

No other PostgreSQL extension is required for the core design.

---

# 33. Enums

Recommended PostgreSQL enums:

```text
facility_status
────────────────
AVAILABLE
UNAVAILABLE
MAINTENANCE
```

```text
booking_status
───────────────
PENDING
APPROVED
REJECTED
CANCELLATION_REQUESTED
CANCELLED
```

```text
cancellation_status
───────────────────
PENDING
APPROVED
REJECTED
```

```text
notification_type
──────────────────
BOOKING_APPROVED
BOOKING_REJECTED
CANCELLATION_APPROVED
CANCELLATION_REJECTED
BOOKING_REMINDER
WAITLIST_PROMOTED
```

```text
waitlist_status
───────────────
WAITING
PROMOTED
CANCELLED
EXPIRED
```

```text
restriction_type
─────────────────
NO_SHOW
ADMIN_RESTRICTION
```

---

# 34. Check Constraints

Recommended database checks:

```text
facilities.capacity > 0
```

```text
facility_operating_hours.day_of_week BETWEEN 0 AND 6
```

```text
facility_operating_hours.opens_at < closes_at
```

when the facility is open.

```text
bookings.start_time < bookings.end_time
```

```text
booking_restrictions.expires_at > booking_restrictions.starts_at
```

```text
waitlist_entries.position > 0
```

The database should not be responsible for every business rule, but simple invariants should be enforced as close to the data as practical.

---

# 35. NextAuth Consideration

The application is using NextAuth.

There are two possible architectures.

## Option A — JWT sessions

Use NextAuth with JWT sessions.

In this model, the SlotSync application database does not need NextAuth session tables.

The database contains:

```text
users
roles
permissions
...
```

while NextAuth manages the authentication session through JWT.

This keeps the database simpler.

## Option B — Database sessions / Drizzle adapter

If NextAuth is configured to persist sessions in PostgreSQL using a Drizzle adapter, additional authentication tables are required, typically:

```text
accounts
sessions
verification_tokens
```

and the `users` table needs to follow the adapter's expected structure.

### Recommendation for SlotSync

Decide this explicitly before implementing the database schema.

If the project only needs normal email/password authentication and JWT-based sessions are acceptable, **JWT sessions avoid unnecessary authentication tables**.

If you specifically want database-backed NextAuth sessions, add the adapter tables as a separate authentication section rather than mixing them with SlotSync's domain tables.

---

# 36. Database transaction boundaries

The following operations should be transactional.

## Create booking

```text
BEGIN

validate user
validate facility
validate operating hours
check restriction
check daily booking limit
check availability
INSERT booking

COMMIT
```

The PostgreSQL exclusion constraint provides the final overlap guarantee.

## Approve booking

```text
BEGIN

load booking
verify PENDING
verify facility still bookable
verify slot still valid
approve booking
create notification
create audit log

COMMIT
```

## Approve cancellation

```text
BEGIN

load cancellation request
verify PENDING
update cancellation request
update booking
create notification
create audit log

COMMIT
```

## Waitlist promotion

```text
BEGIN

lock/select next waiting entry
promote user
update waitlist
create booking
create notification

COMMIT
```

---

# 37. Concurrency Considerations

The booking system must be designed for concurrent requests.

Potential race:

```text
User A ──┐
         ├── requests Facility A, 10:00–11:00
User B ──┘
```

Both requests could reach the backend at nearly the same time.

Therefore:

```text
Application validation
        +
Database transaction
        +
PostgreSQL exclusion constraint
```

should work together.

The database constraint is the final safety boundary.

---

# 38. Data Retention

Do not delete historical:

```text
bookings
cancellation_requests
audit_logs
```

just because:

```text
facility
user
role
```

is deactivated.

Historical records are important for:

- administration
- analytics
- debugging
- dispute resolution
- auditing

---

# 39. Final Table List

## Core

```text
01. departments
02. users
03. roles
04. permissions
05. role_permissions

06. facility_types
07. facilities
08. facility_operating_hours

09. bookings
10. cancellation_requests
11. notifications
12. audit_logs
```

## Bonus

```text
13. waitlist_entries
14. booking_restrictions
```

## Optional NextAuth database-session tables

Only if database-backed NextAuth sessions are selected:

```text
15. accounts
16. sessions
17. verification_tokens
```

---

# 40. Final Relationship Summary

```text
departments
    │
    └── users
          │
          ├── role_id ───────────► roles
          │                          │
          │                          └── role_permissions
          │                                │
          │                                └── permissions
          │
          ├── bookings
          │      │
          │      ├── facility_id ─────► facilities
          │      │                         │
          │      │                         ├── facility_types
          │      │                         │
          │      │                         └── facility_operating_hours
          │      │
          │      └── cancellation_requests
          │
          ├── notifications
          │
          ├── waitlist_entries
          │
          ├── booking_restrictions
          │
          └── audit_logs
```

---

# 41. Implementation Priority

Build the database in this order:

```text
Phase 1
────────
departments
roles
permissions
role_permissions
users

Phase 2
────────
facility_types
facilities
facility_operating_hours

Phase 3
────────
bookings
booking constraints
booking indexes
overlap protection

Phase 4
────────
cancellation_requests
notifications

Phase 5
────────
audit_logs

Phase 6 — Bonus
───────────────
waitlist_entries
booking_restrictions

Phase 7 — Authentication decision
─────────────────────────────────
NextAuth JWT
OR
NextAuth database adapter tables
```

---

# 42. Final Design Decision

The final production-oriented SlotSync domain schema is:

```text
departments
users
roles
permissions
role_permissions

facility_types
facilities
facility_operating_hours

bookings
cancellation_requests

notifications
audit_logs

waitlist_entries       ← bonus
booking_restrictions   ← bonus
```

The most important architectural decisions are:

```text
1. RBAC is database-driven.

2. Facilities have separate operating-hour records.

3. Booking lifecycle is explicit.

4. Cancellation is a separate workflow.

5. Approved booking overlap is protected at the PostgreSQL level.

6. One-booking-per-day is enforced with a transaction +
   an appropriate partial unique constraint.

7. Historical records are preserved.

8. Important entities use soft deactivation.

9. Audit logs preserve administrative actions.

10. Waitlist and penalty functionality can be added without
    redesigning the core booking tables.
```

