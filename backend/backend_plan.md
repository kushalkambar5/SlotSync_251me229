# SlotSync — Backend Architecture & Implementation Plan

## 1. Purpose

This document defines the backend architecture, API design, business logic, security model, transaction boundaries, background jobs, and implementation sequence for **SlotSync**.

SlotSync is a campus infrastructure booking system where authenticated users can browse facilities and availability, eligible users can request bookings, and administrators can manage facilities and approve/reject booking and cancellation requests.

The backend must enforce all important rules independently of the frontend.

---

# 2. Source Requirements

The backend must support the core requirements from the SlotSync task:

- Authentication is mandatory.
- Roles:
  - Admin / Facility Manager
  - Faculty
  - Convenor
  - Student
- Faculty and Convenor can create booking requests.
- Students can only view facilities and availability.
- Admins manage facilities.
- Admins approve/reject booking requests.
- Admins approve/reject cancellation requests.
- Facilities have operating hours and availability/status.
- Facilities outside operating hours or under maintenance cannot be booked.
- Bookings are one-hour slots.
- A user can make at most one booking per day.
- Approved bookings must never overlap on the same facility.
- Users receive booking decision notifications.
- Users receive a reminder 30 minutes before a booking.
- Backend authorization must prevent unauthorized users from directly calling protected APIs.

The task requires MVC architecture and a relational database.

---

# 3. Database Source of Truth

The backend uses:

- PostgreSQL
- Drizzle ORM
- Existing Drizzle schemas and migrations
- Database constraints for important invariants

The current database contains the core domain tables:

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
```

Optional/bonus tables:

```text
waitlist_entries
booking_restrictions
```

The database design uses:

- UUID primary keys
- Foreign keys
- TIMESTAMPTZ timestamps
- Soft deactivation for important entities
- Database-driven RBAC
- Transactional booking operations
- PostgreSQL exclusion constraint for approved booking overlap
- Partial uniqueness for the one-booking-per-day rule where appropriate
- Historical record preservation

The database remains the source of truth. The application layer implements business rules and the database provides final integrity guarantees.

---

# 4. Backend Architecture

## 4.1 High-Level Architecture

```text
                         FRONTEND
                            |
                            | HTTPS
                            v
                    +---------------+
                    |   REST API    |
                    |    /api/v1    |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    |  Middleware   |
                    |               |
                    | Authentication|
                    | Authorization |
                    | Validation    |
                    | Rate Limiting |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    | Controllers   |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    |   Services    |
                    |               |
                    | Auth          |
                    | RBAC          |
                    | Facilities    |
                    | Bookings      |
                    | Cancellations |
                    | Notifications |
                    | Audit         |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    | Repositories  |
                    +-------+-------+
                            |
                            v
                    +---------------+
                    |    Drizzle    |
                    +-------+-------+
                            |
                            v
                  +---------------------+
                  |     PostgreSQL      |
                  +---------------------+

                            ^
                            |
                    +-------+-------+
                    |   Scheduler   |
                    |               |
                    | 30m reminders |
                    | Background    |
                    | jobs          |
                    +---------------+
```

---

# 5. Architectural Layers

The backend follows this request flow:

```text
HTTP Request
     |
     v
Route
     |
     v
Middleware
     |
     v
Controller
     |
     v
Service
     |
     v
Repository
     |
     v
Drizzle
     |
     v
PostgreSQL
```

## 5.1 Routes

Routes define:

- HTTP method
- URL
- middleware
- controller

Routes must not contain business logic.

Example:

```text
POST /api/v1/bookings
        |
        +-- authenticate
        +-- requirePermission(book_facility)
        +-- validate(createBookingSchema)
        +-- bookingController.create
```

---

## 5.2 Middleware

Middleware handles cross-cutting concerns:

```text
Authentication
Authorization
Request validation
Error handling
Rate limiting
```

Middleware must reject unauthorized requests before business logic executes.

---

## 5.3 Controllers

Controllers are intentionally thin.

Responsibilities:

1. Read request parameters/body.
2. Read authenticated user.
3. Call the appropriate service.
4. Return the HTTP response.

Controllers must not contain complex business rules.

Bad:

```text
Controller
  -> check operating hours
  -> check overlap
  -> check booking limit
  -> update booking
```

Good:

```text
Controller
  -> bookingService.createBooking()
```

---

# 6. Service Layer

The service layer contains SlotSync's actual business logic.

Important services:

```text
AuthService
UserService
RBACService
FacilityService
BookingService
CancellationService
NotificationService
AuditService
```

The most important service is `BookingService`.

It is responsible for:

```text
createBooking()
getBooking()
getUserBookings()
getFacilityAvailability()

approveBooking()
rejectBooking()

validateBooking()
validateBookingTransition()
validateOperatingHours()
validateBookingDuration()
validateDailyBookingLimit()
validateFacilityAvailability()
validateBookingRestriction()
```

---

# 7. Repository Layer

Repositories isolate database queries from business logic.

Example:

```text
booking.repository.ts
```

Responsibilities:

```text
findById()
findByUser()
findByFacilityAndDate()
findPending()
findOverlappingApproved()
create()
updateStatus()
```

Services should call repositories instead of scattering Drizzle queries throughout controllers.

Example:

```text
BookingController
       |
       v
BookingService
       |
       v
BookingRepository
       |
       v
Drizzle
```

---

# 8. Proposed Backend Directory Structure

The existing `src/db` directory should remain.

Recommended structure:

```text
backend/
|
+-- src/
|   |
|   +-- app.ts
|   +-- server.ts
|   |
|   +-- config/
|   |   +-- env.ts
|   |   +-- constants.ts
|   |
|   +-- db/
|   |   +-- client.ts
|   |   +-- migrate.ts
|   |   +-- seed.ts
|   |   +-- schema/
|   |   +-- sql/
|   |
|   +-- middleware/
|   |   +-- auth.middleware.ts
|   |   +-- permission.middleware.ts
|   |   +-- validation.middleware.ts
|   |   +-- error.middleware.ts
|   |   +-- rate-limit.middleware.ts
|   |
|   +-- modules/
|   |   |
|   |   +-- auth/
|   |   |   +-- auth.controller.ts
|   |   |   +-- auth.service.ts
|   |   |   +-- auth.routes.ts
|   |   |   +-- auth.validation.ts
|   |   |   +-- auth.types.ts
|   |   |
|   |   +-- users/
|   |   |   +-- user.controller.ts
|   |   |   +-- user.service.ts
|   |   |   +-- user.repository.ts
|   |   |   +-- user.routes.ts
|   |   |   +-- user.validation.ts
|   |   |
|   |   +-- rbac/
|   |   |   +-- role.controller.ts
|   |   |   +-- role.service.ts
|   |   |   +-- permission.service.ts
|   |   |   +-- rbac.middleware.ts
|   |   |   +-- rbac.routes.ts
|   |   |   +-- rbac.validation.ts
|   |   |
|   |   +-- departments/
|   |   |   +-- department.controller.ts
|   |   |   +-- department.service.ts
|   |   |   +-- department.repository.ts
|   |   |   +-- department.routes.ts
|   |   |
|   |   +-- facility-types/
|   |   |   +-- facility-type.controller.ts
|   |   |   +-- facility-type.service.ts
|   |   |   +-- facility-type.repository.ts
|   |   |   +-- facility-type.routes.ts
|   |   |
|   |   +-- facilities/
|   |   |   +-- facility.controller.ts
|   |   |   +-- facility.service.ts
|   |   |   +-- facility.repository.ts
|   |   |   +-- facility.routes.ts
|   |   |   +-- facility.validation.ts
|   |   |
|   |   +-- bookings/
|   |   |   +-- booking.controller.ts
|   |   |   +-- booking.service.ts
|   |   |   +-- booking.repository.ts
|   |   |   +-- booking.routes.ts
|   |   |   +-- booking.validation.ts
|   |   |   +-- booking.policy.ts
|   |   |
|   |   +-- cancellations/
|   |   |   +-- cancellation.controller.ts
|   |   |   +-- cancellation.service.ts
|   |   |   +-- cancellation.repository.ts
|   |   |   +-- cancellation.routes.ts
|   |   |   +-- cancellation.validation.ts
|   |   |
|   |   +-- notifications/
|   |   |   +-- notification.controller.ts
|   |   |   +-- notification.service.ts
|   |   |   +-- notification.repository.ts
|   |   |   +-- notification.routes.ts
|   |   |   +-- notification.worker.ts
|   |   |
|   |   +-- audit/
|   |       +-- audit.service.ts
|   |       +-- audit.repository.ts
|   |       +-- audit.routes.ts
|   |
|   +-- jobs/
|   |   +-- scheduler.ts
|   |   +-- reminder.job.ts
|   |
|   +-- routes/
|   |   +-- index.ts
|   |
|   +-- utils/
|       +-- errors.ts
|       +-- response.ts
|       +-- date.ts
|       +-- logger.ts
|
+-- drizzle/
+-- .env
+-- .env.example
+-- drizzle.config.ts
+-- package.json
+-- tsconfig.json
```

---

# 9. API Design

All APIs should be versioned:

```text
/api/v1
```

Main API groups:

```text
/api/v1/auth
/api/v1/users
/api/v1/departments
/api/v1/roles
/api/v1/permissions
/api/v1/facility-types
/api/v1/facilities
/api/v1/bookings
/api/v1/cancellations
/api/v1/notifications
/api/v1/audit-logs
/api/v1/analytics
```

---

# 10. Authentication API

## Register

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "John Doe",
  "email": "john@nitk.edu.in",
  "password": "password",
  "departmentId": "uuid"
}
```

Important:

The client must not be allowed to select an arbitrary `roleId` during registration.

The backend assigns the appropriate default role.

---

## Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "john@nitk.edu.in",
  "password": "password"
}
```

---

## Logout

```http
POST /api/v1/auth/logout
```

---

## Current User

```http
GET /api/v1/auth/me
```

Returns authenticated user information and relevant permissions.

---

# 11. Authentication Architecture

Authentication and authorization are separate concerns.

```text
Authentication
=
Who is the user?

Authorization
=
What can the user do?
```

Recommended initial architecture:

```text
Login
  |
  v
Verify password
  |
  v
Create JWT/session
  |
  v
Authenticated requests
```

The final session strategy must remain consistent with the frontend authentication implementation.

If JWT sessions are used, no NextAuth database-session tables are required.

If database-backed NextAuth sessions are selected, the authentication adapter tables must be added separately.

---

# 12. Authentication Middleware

Protected request flow:

```text
Request
   |
   v
Read authentication token/session
   |
   v
Verify authentication
   |
   v
Identify user
   |
   v
Load user
   |
   v
Attach authenticated user to request
```

Example request context:

```ts
req.user = {
  id: "...",
  email: "...",
  roleId: "..."
}
```

The backend must not trust role information supplied by the frontend.

---

# 13. RBAC Architecture

The RBAC model is database-driven:

```text
users
  |
  v
roles
  |
  v
role_permissions
  |
  v
permissions
```

Authorization should be permission-based rather than hardcoded to role names.

Example:

```text
requirePermission("book_facility")
requirePermission("approve_booking")
requirePermission("manage_facilities")
requirePermission("approve_cancellation")
```

---

# 14. Permission Middleware

Conceptually:

```text
requirePermission("book_facility")
```

performs:

```text
authenticated user
       |
       v
user.role_id
       |
       v
role_permissions
       |
       v
permissions
       |
       v
required permission exists?
       |
    +--+--+
    |     |
   YES    NO
    |     |
 next()  403
```

This ensures database-driven permission changes take effect without changing application code.

---

# 15. Initial Permission Set

Recommended initial permissions:

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
view_audit_logs
```

The exact permission records should come from the database seed.

The authorization middleware should never assume:

```text
ADMIN = permission X
FACULTY = permission Y
```

Instead it should query the role-permission relationship.

---

# 16. User APIs

Authenticated:

```http
GET   /api/v1/users/me
PATCH /api/v1/users/me
```

Admin:

```http
GET   /api/v1/users
GET   /api/v1/users/:id
PATCH /api/v1/users/:id
PATCH /api/v1/users/:id/status
PATCH /api/v1/users/:id/role
```

Admin user-management operations require:

```text
manage_users
```

---

# 17. Department APIs

Authenticated users:

```http
GET /api/v1/departments
GET /api/v1/departments/:id
```

Admin:

```http
POST  /api/v1/departments
PATCH /api/v1/departments/:id
PATCH /api/v1/departments/:id/status
```

---

# 18. Facility Type APIs

Authenticated users:

```http
GET /api/v1/facility-types
GET /api/v1/facility-types/:id
```

Admin:

```http
POST  /api/v1/facility-types
PATCH /api/v1/facility-types/:id
PATCH /api/v1/facility-types/:id/status
```

Prefer soft deactivation over physical deletion where historical references exist.

---

# 19. Facility APIs

## Browse facilities

```http
GET /api/v1/facilities
```

Supported filters:

```text
typeId
minCapacity
status
building
```

Example:

```http
GET /api/v1/facilities?typeId=uuid&minCapacity=50
```

---

## Facility details

```http
GET /api/v1/facilities/:id
```

---

## Create facility

Admin:

```http
POST /api/v1/facilities
```

Example:

```json
{
  "name": "LH-101",
  "code": "LH101",
  "typeId": "uuid",
  "location": "Lecture Hall Complex",
  "building": "LHC",
  "floor": "1",
  "capacity": 120,
  "description": "Large lecture hall",
  "status": "AVAILABLE"
}
```

---

## Update facility

```http
PATCH /api/v1/facilities/:id
```

---

## Update facility status

```http
PATCH /api/v1/facilities/:id/status
```

Possible statuses:

```text
AVAILABLE
UNAVAILABLE
MAINTENANCE
```

A facility being:

```text
is_active = true
status = MAINTENANCE
```

means it still exists but cannot be booked.

---

# 20. Operating Hours API

Admin:

```http
GET   /api/v1/facilities/:id/operating-hours
PUT   /api/v1/facilities/:id/operating-hours
```

Operating hours are stored per day.

The application must use one consistent day-of-week convention.

Recommended:

```text
0 = Sunday
1 = Monday
2 = Tuesday
3 = Wednesday
4 = Thursday
5 = Friday
6 = Saturday
```

---

# 21. Availability API

```http
GET /api/v1/facilities/:facilityId/availability?date=2026-10-05
```

Example response:

```json
{
  "facility": {
    "id": "uuid",
    "name": "LH-101"
  },
  "date": "2026-10-05",
  "operatingHours": {
    "opensAt": "08:00",
    "closesAt": "18:00"
  },
  "slots": [
    {
      "startTime": "08:00",
      "endTime": "09:00",
      "status": "AVAILABLE"
    },
    {
      "startTime": "09:00",
      "endTime": "10:00",
      "status": "BOOKED"
    }
  ]
}
```

The availability service should derive slot availability from:

```text
facility status
operating hours
approved bookings
date
time
```

The frontend should not calculate booking availability independently.

---

# 22. Booking APIs

## Create Booking

```http
POST /api/v1/bookings
```

Permission:

```text
book_facility
```

Request:

```json
{
  "facilityId": "uuid",
  "bookingDate": "2026-10-05",
  "startTime": "10:00",
  "endTime": "11:00",
  "purpose": "Project discussion"
}
```

---

## Get bookings

```http
GET /api/v1/bookings
```

Normal users receive their relevant bookings.

Admins can filter:

```text
status
facilityId
userId
date
```

Example:

```http
GET /api/v1/bookings?status=PENDING
```

---

## Get booking

```http
GET /api/v1/bookings/:id
```

Authorization must ensure that normal users cannot access another user's private booking information unless their permissions allow it.

---

# 23. Booking Creation Flow

Booking creation must be transactional.

```text
POST /bookings
       |
       v
Authenticate
       |
       v
book_facility permission
       |
       v
Validate request
       |
       v
BEGIN TRANSACTION
       |
       +--> Validate user
       |
       +--> Validate facility
       |
       +--> Validate facility status
       |
       +--> Validate one-hour duration
       |
       +--> Validate operating hours
       |
       +--> Validate booking date/time
       |
       +--> Check active booking restriction
       |
       +--> Check one-booking-per-day
       |
       +--> Create PENDING booking
       |
       +--> Create audit record if required
       |
       v
COMMIT
```

A booking request is initially:

```text
PENDING
```

It is not automatically approved.

---

# 24. Booking Validation Rules

The backend must enforce:

1. User has `book_facility`.
2. User is active.
3. Facility exists.
4. Facility is active.
5. Facility status is `AVAILABLE`.
6. Requested booking is exactly one hour.
7. Requested time lies inside operating hours.
8. Booking date/time is valid.
9. User does not already have an active booking that day.
10. User does not have an active booking restriction.
11. Booking is created as `PENDING`.

These validations belong primarily in the booking service, with simple invariants also protected by the database.

---

# 25. One-Hour Booking Rule

The service must enforce:

```text
end_time - start_time = 1 hour
```

Examples:

```text
10:00 -> 11:00   valid
10:30 -> 11:30   valid if arbitrary one-hour ranges are supported
10:00 -> 12:00   invalid
```

Fixed hourly boundaries should only be enforced if that behavior is intentionally selected.

---

# 26. One Booking Per Day

The requirement is:

```text
maximum one active booking per user per day
```

Active states:

```text
PENDING
APPROVED
CANCELLATION_REQUESTED
```

Rejected and cancelled bookings should not permanently consume the user's daily allowance.

The application should check this inside a transaction.

The database should additionally use the appropriate partial unique constraint where implemented.

---

# 27. Approved Booking Overlap Protection

Approved bookings for the same facility must never overlap.

Example:

```text
Existing:
10:00 -> 11:00 APPROVED

Attempt:
10:30 -> 11:30 APPROVED
```

The second approval must fail.

The final safety boundary is the PostgreSQL exclusion constraint.

Conceptually:

```sql
EXCLUDE USING gist (
    facility_id WITH =,
    booking_range WITH &&
)
WHERE (status = 'APPROVED');
```

The required PostgreSQL extension is:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

The application should still perform an availability check before attempting approval, but the database constraint protects against concurrent requests.

---

# 28. Why Both Application Checks and Database Constraints Are Required

A normal check:

```text
SELECT overlapping booking
        |
        v
none found
        |
        v
INSERT
```

is vulnerable to concurrent requests.

Therefore:

```text
Application validation
        +
Transaction
        +
Database constraint
```

must work together.

The database is the final safety boundary.

---

# 29. Booking Approval API

```http
POST /api/v1/bookings/:id/approve
```

Permission:

```text
approve_booking
```

Transaction:

```text
BEGIN
   |
   +--> Load booking
   |
   +--> Verify PENDING
   |
   +--> Verify facility
   |
   +--> Verify facility status
   |
   +--> Verify operating hours
   |
   +--> Change booking to APPROVED
   |
   +--> Create notification
   |
   +--> Create audit log
   |
COMMIT
```

If the PostgreSQL overlap constraint rejects the approval:

```text
HTTP 409 CONFLICT
```

with a meaningful error code.

---

# 30. Booking Rejection API

```http
POST /api/v1/bookings/:id/reject
```

Permission:

```text
reject_booking
```

Request:

```json
{
  "reason": "Facility reserved for departmental event"
}
```

The rejection reason is mandatory.

Flow:

```text
PENDING
   |
   v
REJECTED
   |
   +--> notification
   |
   +--> audit log
```

---

# 31. Booking State Machine

The backend must not allow arbitrary status updates.

Do not expose:

```http
PATCH /bookings/:id
```

with:

```json
{
  "status": "APPROVED"
}
```

Instead use explicit action endpoints.

Valid transitions:

```text
PENDING
   |
   +----> APPROVED
   |
   +----> REJECTED

APPROVED
   |
   +----> CANCELLATION_REQUESTED

CANCELLATION_REQUESTED
   |
   +----> CANCELLED
   |
   +----> APPROVED
```

Forbidden examples:

```text
CANCELLED -> APPROVED
REJECTED -> APPROVED
```

The service layer must enforce these transitions.

---

# 32. Cancellation APIs

## Request cancellation

```http
POST /api/v1/bookings/:id/cancellation-request
```

Permission:

```text
cancel_booking
```

Request:

```json
{
  "reason": "Event cancelled"
}
```

Flow:

```text
APPROVED
    |
    v
CANCELLATION_REQUESTED
```

Only one pending cancellation request should exist for a booking.

---

## Approve cancellation

```http
POST /api/v1/cancellations/:id/approve
```

Permission:

```text
approve_cancellation
```

Transaction:

```text
BEGIN
   |
   +--> Load cancellation request
   |
   +--> Verify PENDING
   |
   +--> Update cancellation request
   |
   +--> Update booking -> CANCELLED
   |
   +--> Create notification
   |
   +--> Create audit log
   |
COMMIT
```

---

## Reject cancellation

```http
POST /api/v1/cancellations/:id/reject
```

Permission:

```text
reject_cancellation
```

Request:

```json
{
  "reason": "Cancellation cannot be approved at this time"
}
```

Flow:

```text
CANCELLATION_REQUESTED
          |
          v
       APPROVED
```

The booking remains approved.

---

# 33. Notifications

Notification APIs:

```http
GET   /api/v1/notifications
GET   /api/v1/notifications/unread-count
PATCH /api/v1/notifications/:id/read
PATCH /api/v1/notifications/read-all
```

Notification creation is performed by backend services.

Notification types:

```text
BOOKING_APPROVED
BOOKING_REJECTED

CANCELLATION_APPROVED
CANCELLATION_REJECTED

BOOKING_REMINDER

WAITLIST_PROMOTED
```

---

# 34. Notification Flow

Example:

```text
Admin approves booking
        |
        v
BookingService
        |
        v
NotificationService
        |
        v
notifications table
        |
        v
Frontend notification feed
```

The frontend must not create approval/rejection notifications itself.

---

# 35. Reminder Scheduler

The 30-minute reminder should be handled asynchronously.

Architecture:

```text
Scheduler
    |
    v
Find upcoming APPROVED bookings
    |
    v
Find bookings approximately 30 minutes away
    |
    v
NotificationService
    |
    v
Create BOOKING_REMINDER
```

The scheduler should not be implemented as part of the booking request.

For the initial implementation, a simple scheduled backend job is sufficient.

Avoid adding Redis/BullMQ unless the project actually requires a queue.

---

# 36. Audit Logging

Important administrative and state-changing operations should create audit logs.

Example:

```text
Admin approves booking
        |
        v
BookingService
        |
        +--> Update booking
        |
        +--> NotificationService
        |
        +--> AuditService
```

Example audit record:

```json
{
  "actorUserId": "admin-uuid",
  "action": "BOOKING_APPROVED",
  "entityType": "booking",
  "entityId": "booking-uuid",
  "oldValues": {
    "status": "PENDING"
  },
  "newValues": {
    "status": "APPROVED"
  }
}
```

Historical audit data must be preserved.

---

# 37. Audit APIs

Admin:

```http
GET /api/v1/audit-logs
GET /api/v1/audit-logs/:id
```

Filters:

```text
actorUserId
entityType
entityId
action
from
to
```

Recommended permission:

```text
view_audit_logs
```

---

# 38. Error Handling

All API errors should use a consistent structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "FACILITY_UNAVAILABLE",
    "message": "The facility is currently under maintenance."
  }
}
```

Recommended HTTP status codes:

```text
400  VALIDATION_ERROR
401  UNAUTHENTICATED
403  FORBIDDEN
404  NOT_FOUND
409  CONFLICT
422  BUSINESS_RULE_VIOLATION
500  INTERNAL_SERVER_ERROR
```

Important booking error codes:

```text
BOOKING_ALREADY_EXISTS
DAILY_BOOKING_LIMIT_REACHED
FACILITY_UNAVAILABLE
FACILITY_OUTSIDE_OPERATING_HOURS
BOOKING_OVERLAP
INVALID_BOOKING_DURATION
INVALID_BOOKING_TRANSITION
BOOKING_NOT_CANCELLABLE
ACTIVE_BOOKING_RESTRICTION
```

Database errors must be translated into meaningful API errors instead of exposing raw PostgreSQL errors.

---

# 39. API Response Convention

Successful responses should follow a consistent structure.

Example:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING"
  }
}
```

For lists:

```json
{
  "success": true,
  "data": [
    {}
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Pagination should be added to endpoints that may return large datasets.

---

# 40. Authorization Matrix

Initial authorization model:

| Feature | Student | Faculty | Convenor | Admin |
|---|---:|---:|---:|---:|
| View facilities | Yes | Yes | Yes | Yes |
| View availability | Yes | Yes | Yes | Yes |
| Create booking | No | Yes | Yes | Permission-based |
| View own bookings | No | Yes | Yes | Yes |
| Request cancellation | No | Yes | Yes | Permission-based |
| Approve booking | No | No | No | Yes |
| Reject booking | No | No | No | Yes |
| Approve cancellation | No | No | No | Yes |
| Manage facilities | No | No | No | Yes |
| Manage users | No | No | No | Yes |
| Manage roles | No | No | No | Yes |
| View analytics | No | No | No | Yes |
| View audit logs | No | No | No | Yes |

This table describes the default seeded permissions. The actual authorization mechanism must use database permissions.

---

# 41. Security Requirements

The backend must:

- Hash passwords using a secure password hashing algorithm.
- Never return password hashes through APIs.
- Never trust role/permission values from the client.
- Validate every request body/query/path parameter.
- Authenticate protected endpoints.
- Authorize protected operations.
- Prevent students from calling booking APIs.
- Prevent normal users from approving/rejecting bookings.
- Avoid exposing internal database errors.
- Use environment variables for secrets.
- Avoid committing `.env`.
- Apply reasonable rate limiting to authentication endpoints.
- Preserve audit history.
- Use transactions for critical state changes.

---

# 42. Important Security Rule

Hiding a button in the frontend is not authorization.

This is invalid security:

```text
Student
   |
   v
Frontend hides "Book" button
```

The backend must still reject:

```http
POST /api/v1/bookings
```

with:

```text
403 FORBIDDEN
```

if the authenticated user lacks:

```text
book_facility
```

---

# 43. Transaction Boundaries

The following operations must be transactional.

## Create booking

```text
BEGIN

validate user
validate facility
validate operating hours
check restriction
check daily booking limit
create booking

COMMIT
```

---

## Approve booking

```text
BEGIN

load booking
verify PENDING
verify facility
verify facility status
verify slot
approve booking
create notification
create audit log

COMMIT
```

The PostgreSQL exclusion constraint remains the final overlap guarantee.

---

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

---

## Waitlist promotion

When the bonus waitlist system is implemented:

```text
BEGIN

lock/select next WAITING entry
promote user
update waitlist
create booking
create notification

COMMIT
```

---

# 44. Soft Deletion

Important entities should not normally be physically deleted.

Users:

```text
is_active = false
```

Facilities:

```text
is_active = false
```

Roles:

```text
is_active = false
```

Facility types:

```text
is_active = false
```

Historical:

```text
bookings
cancellation_requests
audit_logs
```

must remain intact.

---

# 45. Repository Responsibilities

Repositories should contain data-access operations only.

Example:

```text
FacilityRepository
------------------
findAll()
findById()
findByFilters()
create()
update()
updateStatus()
findOperatingHours()
updateOperatingHours()
```

```text
BookingRepository
-----------------
findById()
findByUser()
findByFacilityAndDate()
findPending()
findOverlappingApproved()
findActiveBookingForUserOnDate()
create()
updateStatus()
```

```text
NotificationRepository
----------------------
findByUser()
findUnread()
countUnread()
create()
markRead()
markAllRead()
```

The service layer decides when and why these functions are called.

---

# 46. Booking Service Responsibilities

`BookingService` is the most critical domain service.

It should own:

```text
createBooking()
getBooking()
getUserBookings()
getAvailability()

approveBooking()
rejectBooking()

validateBooking()
validateDuration()
validateOperatingHours()
validateFacility()
validateDailyLimit()
validateRestriction()
validateTransition()
```

It must not depend on controllers.

---

# 47. Facility Service Responsibilities

`FacilityService`:

```text
listFacilities()
getFacility()
createFacility()
updateFacility()
updateFacilityStatus()

getOperatingHours()
updateOperatingHours()

getAvailability()
```

It should ensure:

```text
inactive facilities
maintenance facilities
unavailable facilities
```

are handled correctly.

---

# 48. RBAC Service Responsibilities

`RBACService`:

```text
getUserPermissions()
hasPermission()
getRole()
createRole()
updateRole()
deactivateRole()
assignPermission()
removePermission()
assignRoleToUser()
```

The configurable RBAC APIs should be implemented only after the core fixed/default permission model works.

---

# 49. Analytics API — Bonus

After core booking functionality is stable:

```http
GET /api/v1/analytics/overview
GET /api/v1/analytics/facilities
GET /api/v1/analytics/peak-hours
GET /api/v1/analytics/usage-trends
```

Possible analytics:

```text
Most booked facilities
Peak hours
Daily usage
Weekly usage
Monthly usage
Facility utilization
Approval/rejection counts
```

Analytics should be read-only and should not modify transactional data.

---

# 50. Waitlist API — Bonus

After core booking/cancellation works:

```http
POST   /api/v1/waitlist
GET    /api/v1/facilities/:id/waitlist
DELETE /api/v1/waitlist/:id
```

Promotion flow:

```text
Booking cancellation
       |
       v
Find earliest WAITING user
       |
       v
Transaction
       |
       +--> Create/promote booking
       |
       +--> Update waitlist
       |
       +--> Create notification
```

FIFO ordering must be preserved.

---

# 51. Penalty System — Bonus

When `booking_restrictions` is implemented:

```text
No-show
   |
   v
Create 24-hour restriction
   |
   v
booking_restrictions
```

Booking service checks:

```text
starts_at <= current_time
AND
expires_at > current_time
```

If true:

```text
reject booking request
```

---

# 52. Testing Strategy

Testing should be built alongside each module.

## Unit tests

Test services independently:

```text
BookingService
FacilityService
RBACService
CancellationService
```

Important booking tests:

```text
valid booking
invalid duration
outside operating hours
maintenance facility
inactive facility
daily booking limit
active restriction
invalid state transition
```

---

## Integration tests

Test:

```text
API
+
middleware
+
service
+
Drizzle
+
PostgreSQL
```

Important cases:

```text
student cannot create booking
faculty can create booking
admin can approve
admin can reject
cancellation workflow
notification creation
```

---

## Concurrency test

Specifically test:

```text
Two approvals
same facility
overlapping slot
simultaneously
```

Expected result:

```text
one succeeds
one receives conflict
```

The PostgreSQL exclusion constraint must guarantee the final result.

---

# 53. Implementation Phases

## Phase 0 — Backend Foundation

Implement:

```text
src/app.ts
src/server.ts

config
environment validation
logger
error handling
response helpers

GET /api/v1/health
```

Goal:

```text
Backend starts
Database connects
Health endpoint works
```

---

# 54. Phase 1 — Authentication

Implement:

```text
auth module
password hashing
register
login
logout
me
authentication middleware
```

Test:

```text
valid login
invalid login
unauthenticated request
authenticated request
inactive user
```

---

# 55. Phase 2 — RBAC

Implement:

```text
permission repository/service
role repository/service
permission middleware
default role permissions
user role lookup
```

Test:

```text
Student -> booking -> 403
Faculty -> booking -> allowed
Admin -> facility management -> allowed
Faculty -> facility management -> 403
```

---

# 56. Phase 3 — Facility Management

Implement:

```text
facility types
facilities
operating hours
facility filtering
facility status
availability endpoint
```

Test:

```text
create facility
update facility
deactivate facility
maintenance status
operating hours
capacity filtering
type filtering
availability
```

---

# 57. Phase 4 — Booking Engine

Implement:

```text
create booking
list bookings
get booking
availability
booking validation
daily limit
operating hours
one-hour rule
facility validation
```

Then implement:

```text
approve booking
reject booking
booking state machine
overlap protection
```

This is the most important implementation phase.

---

# 58. Phase 5 — Cancellation

Implement:

```text
request cancellation
approve cancellation
reject cancellation
cancellation state validation
```

All approval/rejection operations should create:

```text
notification
audit log
```

inside the same transaction where appropriate.

---

# 59. Phase 6 — Notifications

Implement:

```text
notification service
notification repository
notification APIs
unread count
mark read
mark all read
```

Then implement:

```text
30-minute reminder scheduler
```

---

# 60. Phase 7 — Audit Logging

Implement:

```text
AuditService
AuditRepository
Audit API
```

Log important events:

```text
USER_CREATED
USER_ROLE_CHANGED

FACILITY_CREATED
FACILITY_UPDATED
FACILITY_STATUS_CHANGED

BOOKING_CREATED
BOOKING_APPROVED
BOOKING_REJECTED

CANCELLATION_REQUESTED
CANCELLATION_APPROVED
CANCELLATION_REJECTED
```

---

# 61. Phase 8 — Admin APIs

Build APIs needed by the admin dashboard:

```text
pending bookings
pending cancellations
users
facilities
usage information
audit logs
```

---

# 62. Phase 9 — Testing and Hardening

Before bonus features:

```text
unit tests
integration tests
authorization tests
booking concurrency tests
validation tests
error handling tests
```

Verify every protected API independently of the frontend.

---

# 63. Phase 10 — Bonus Features

Implement in this order:

```text
Configurable RBAC
        |
        v
Waitlist
        |
        v
Penalty / restriction system
        |
        v
Analytics
        |
        v
Email notifications
```

Do not allow bonus features to destabilize the core booking workflow.

---

# 64. Recommended Development Order

The practical implementation order is:

```text
1. Backend foundation
       |
2. Authentication
       |
3. RBAC middleware
       |
4. Facility APIs
       |
5. Availability engine
       |
6. Booking creation
       |
7. Booking approval/rejection
       |
8. Cancellation workflow
       |
9. Notifications
       |
10. Reminder scheduler
       |
11. Audit logging
       |
12. Admin APIs
       |
13. Tests/concurrency validation
       |
14. Configurable RBAC
       |
15. Waitlist
       |
16. Penalties
       |
17. Analytics
       |
18. Email
```

---

# 65. Core API Summary

```text
AUTH
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

USERS
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
PATCH  /api/v1/users/:id/status
PATCH  /api/v1/users/:id/role

DEPARTMENTS
GET    /api/v1/departments
GET    /api/v1/departments/:id
POST   /api/v1/departments
PATCH  /api/v1/departments/:id
PATCH  /api/v1/departments/:id/status

FACILITY TYPES
GET    /api/v1/facility-types
GET    /api/v1/facility-types/:id
POST   /api/v1/facility-types
PATCH  /api/v1/facility-types/:id
PATCH  /api/v1/facility-types/:id/status

FACILITIES
GET    /api/v1/facilities
GET    /api/v1/facilities/:id
POST   /api/v1/facilities
PATCH  /api/v1/facilities/:id
PATCH  /api/v1/facilities/:id/status

OPERATING HOURS
GET    /api/v1/facilities/:id/operating-hours
PUT    /api/v1/facilities/:id/operating-hours

AVAILABILITY
GET    /api/v1/facilities/:id/availability

BOOKINGS
POST   /api/v1/bookings
GET    /api/v1/bookings
GET    /api/v1/bookings/:id
POST   /api/v1/bookings/:id/approve
POST   /api/v1/bookings/:id/reject
POST   /api/v1/bookings/:id/cancellation-request

CANCELLATIONS
POST   /api/v1/cancellations/:id/approve
POST   /api/v1/cancellations/:id/reject

NOTIFICATIONS
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all

AUDIT
GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/:id

BONUS
POST   /api/v1/waitlist
GET    /api/v1/facilities/:id/waitlist
DELETE /api/v1/waitlist/:id

GET    /api/v1/analytics/overview
GET    /api/v1/analytics/facilities
GET    /api/v1/analytics/peak-hours
GET    /api/v1/analytics/usage-trends
```

---

# 66. Final Architecture Principles

The SlotSync backend should follow these principles:

```text
1. PostgreSQL is the source of truth.

2. Drizzle is the database access layer.

3. Controllers remain thin.

4. Business rules live in services.

5. Database queries live in repositories.

6. Authentication and authorization are separate.

7. Authorization is enforced on the backend.

8. RBAC is permission-driven.

9. Booking state transitions are explicit.

10. Booking creation and approval use transactions.

11. PostgreSQL provides the final overlap guarantee.

12. The frontend never determines authorization.

13. Historical booking and audit data is preserved.

14. Important entities are soft-deactivated.

15. Notifications are generated by backend services.

16. Reminder notifications are asynchronous.

17. Bonus features are added only after the core workflow is stable.

18. API contracts remain versioned under /api/v1.

19. Critical business rules must be covered by tests.

20. Concurrency behavior must be explicitly tested.
```

---

# 67. Definition of Done — Core Backend

The core backend is considered complete when:

```text
[ ] Server starts successfully
[ ] PostgreSQL connection works
[ ] Drizzle migrations work
[ ] Seed data works

[ ] Registration works
[ ] Login works
[ ] Authentication middleware works
[ ] Logout works
[ ] Current-user endpoint works

[ ] Permission middleware works
[ ] Student cannot create booking
[ ] Faculty can create booking
[ ] Convenor can create booking
[ ] Admin can manage facilities

[ ] Facility CRUD works
[ ] Facility filtering works
[ ] Facility status works
[ ] Operating hours work
[ ] Availability API works

[ ] One-hour booking rule works
[ ] Operating-hours validation works
[ ] Daily booking limit works
[ ] Booking restrictions are checked when implemented
[ ] Booking starts as PENDING

[ ] Admin can approve booking
[ ] Admin can reject booking
[ ] Rejection reason is required
[ ] Booking state transitions are enforced
[ ] Approved overlaps are impossible

[ ] User can request cancellation
[ ] Admin can approve cancellation
[ ] Admin can reject cancellation

[ ] Booking notifications work
[ ] Cancellation notifications work
[ ] 30-minute reminder works

[ ] Audit logs are generated
[ ] Protected APIs return correct 401/403 responses
[ ] Database errors are translated into API errors

[ ] Unit tests exist
[ ] Integration tests exist
[ ] Booking concurrency is tested
```

---

# 68. Final Target Architecture

```text
                         SlotSync Backend
                               |
             +-----------------+-----------------+
             |                                   |
        REST API Layer                     Background Jobs
             |                                   |
      +------+-------+                           |
      |              |                           |
 Authentication   Authorization                  |
      |              |                           |
      +------+-------+                           |
             |                                   |
             v                                   v
       Controllers                         Reminder Worker
             |
             v
          Services
             |
     +-------+--------+----------------+
     |       |        |                |
    RBAC  Facilities Bookings    Notifications
                     |
                     v
              Cancellations
                     |
                     v
                 Audit
                     |
                     v
               Repositories
                     |
                     v
                  Drizzle
                     |
                     v
                PostgreSQL
```

The central design principle is:

```text
Frontend
   ↓
HTTP API
   ↓
Authentication
   ↓
Permission check
   ↓
Controller
   ↓
Business service
   ↓
Transaction
   ↓
Repository
   ↓
Drizzle
   ↓
PostgreSQL constraints
```

The booking engine is the critical domain of SlotSync. Build and test that correctly before spending significant time on analytics, waitlists, penalties, email, or other bonus features.
