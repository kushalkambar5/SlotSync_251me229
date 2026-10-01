# SlotSync Frontend Plan

## 1. Purpose

This document defines the frontend architecture, page structure, component organization, implementation order, API integration strategy, and UX requirements for **SlotSync**.

SlotSync is a campus facility booking system with four primary user types:

- **Admin / Facility Manager**
- **Faculty**
- **Convenor**
- **Student**

The frontend must provide a clean booking experience while treating the backend and PostgreSQL database as the source of truth for authentication, authorization, facility availability, booking validation, booking lifecycle, notifications, and auditability.

> **Core principle:** The frontend is responsible for presentation, user experience, client-side validation, and API interaction. It must not become a second implementation of backend business rules.

---

# 2. Existing Project Status

The project already contains:

- PostgreSQL database implemented according to the database plan.
- Drizzle-based backend implemented according to the backend architecture.
- Existing SlotSync homepage.
- Existing brand identity and logo.
- Existing marketing components.

Current frontend structure:

```text
frontend/
├── app/
│   ├── globals.css
│   ├── icon.png
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── BonusFeaturesSection.tsx
│   ├── BrandHighlights.tsx
│   ├── FacilityExplorer.tsx
│   ├── FaqSection.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── LiveSlotGridDemo.tsx
│   ├── Navbar.tsx
│   └── RoleWorkflowSection.tsx
│
└── public/
    ├── logo.png
    ├── navbar_logo.png
    └── SlotSync_Brand_Identity_Guide.png
```

The existing homepage and visual identity must be preserved and improved rather than unnecessarily rewritten.

---

# 3. Frontend Goals

The frontend should provide:

1. A polished SlotSync public/marketing experience.
2. Secure authentication flows.
3. Permission-aware navigation and UI.
4. Facility discovery and filtering.
5. Real-time availability viewing through backend APIs.
6. A simple booking workflow.
7. Booking status tracking.
8. Cancellation request workflow.
9. Admin approval/rejection workflow.
10. Notifications and unread counts.
11. Facility management for authorized users.
12. User and RBAC management.
13. Analytics and audit-log interfaces.
14. Responsive desktop/tablet/mobile UX.
15. Strong loading, error, empty, and success states.

---

# 4. Architecture Principles

## 4.1 Separate the Product into Three UI Surfaces

The frontend should be conceptually divided into:

```text
1. Marketing / Public UI
2. Authenticated Application UI
3. Admin UI
```

### Marketing UI

Used by unauthenticated users.

Examples:

- Homepage
- About
- FAQ
- Product/feature explanation

### Application UI

Used by authenticated students, faculty, and convenors.

Examples:

- Dashboard
- Facilities
- Availability
- Bookings
- Notifications
- Profile

### Admin UI

Used by users with appropriate management permissions.

Examples:

- Admin dashboard
- Booking approvals
- Cancellation approvals
- Facility management
- User management
- RBAC
- Analytics
- Audit logs

---

# 5. Recommended Next.js Route Structure

Use Next.js App Router route groups.

```text
app/
│
├── (marketing)/
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   └── faq/
│       └── page.tsx
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── unauthorized/
│       └── page.tsx
│
├── (app)/
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── facilities/
│   │   ├── page.tsx
│   │   └── [facilityId]/
│   │       └── page.tsx
│   │
│   ├── bookings/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [bookingId]/
│   │       └── page.tsx
│   │
│   ├── notifications/
│   │   └── page.tsx
│   │
│   └── profile/
│       └── page.tsx
│
└── (admin)/
    ├── admin/
    │   ├── page.tsx
    │   │
    │   ├── bookings/
    │   │   ├── page.tsx
    │   │   └── [bookingId]/
    │   │       └── page.tsx
    │   │
    │   ├── cancellations/
    │   │   └── page.tsx
    │   │
    │   ├── facilities/
    │   │   ├── page.tsx
    │   │   ├── new/
    │   │   │   └── page.tsx
    │   │   └── [facilityId]/
    │   │       └── page.tsx
    │   │
    │   ├── users/
    │   │   ├── page.tsx
    │   │   └── [userId]/
    │   │       └── page.tsx
    │   │
    │   ├── roles/
    │   │   └── page.tsx
    │   │
    │   ├── analytics/
    │   │   └── page.tsx
    │   │
    │   └── audit-logs/
    │       └── page.tsx
    │
    └── ...
```

Do not create separate route trees such as:

```text
/student
/faculty
/convenor
```

unless a future requirement specifically demands them.

Use permission-aware rendering instead.

---

# 6. Why Permission-Aware UI

The backend uses database-driven RBAC:

```text
User
  ↓
Role
  ↓
Role Permissions
  ↓
Permission
```

Therefore the frontend should primarily reason about permissions rather than hardcoding role names.

Example:

```ts
hasPermission("book_facility")
hasPermission("manage_facilities")
hasPermission("approve_booking")
hasPermission("manage_users")
```

A student's booking button should be hidden because the student does not have the booking permission.

However:

> Hiding a button is only a UX decision. It is not authorization.

The backend must still reject unauthorized API requests with `403`.

---

# 7. Recommended Frontend Directory Architecture

Move toward a domain/feature-oriented architecture.

```text
frontend/
│
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── (app)/
│   └── (admin)/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── feedback/
│   ├── shared/
│   └── marketing/
│
├── features/
│   ├── auth/
│   ├── facilities/
│   ├── bookings/
│   ├── cancellations/
│   ├── notifications/
│   ├── users/
│   ├── rbac/
│   ├── analytics/
│   └── audit/
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── errors.ts
│   │   └── response.ts
│   │
│   ├── auth/
│   │   ├── session.ts
│   │   └── permissions.ts
│   │
│   ├── constants/
│   └── utils/
│
├── hooks/
│
├── providers/
│   ├── AuthProvider.tsx
│   └── QueryProvider.tsx
│
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── facility.ts
│   ├── booking.ts
│   └── user.ts
│
└── public/
```

---

# 8. Component Responsibilities

## 8.1 `components/ui`

Generic reusable UI primitives.

Examples:

```text
Button
Input
Select
Dialog
Dropdown
Badge
Card
Table
Tabs
Tooltip
Skeleton
Spinner
Alert
Toast
Calendar
Pagination
```

These components must not contain SlotSync business logic.

---

## 8.2 `components/layout`

Application-wide layout components.

```text
AppShell.tsx
AppSidebar.tsx
AppHeader.tsx
MobileNavigation.tsx
AdminShell.tsx
PageHeader.tsx
```

---

## 8.3 `components/navigation`

Permission-aware navigation.

```text
SidebarNavigation.tsx
NavigationItem.tsx
AdminNavigation.tsx
UserMenu.tsx
NotificationBell.tsx
```

---

## 8.4 `components/feedback`

Common states:

```text
LoadingState.tsx
ErrorState.tsx
EmptyState.tsx
SuccessMessage.tsx
PermissionDenied.tsx
```

---

# 9. Authentication Architecture

The frontend must integrate consistently with the backend authentication strategy.

Required screens:

```text
/login
/register
/unauthorized
```

## Login

Fields:

```text
Email
Password
```

Features:

- Login validation
- Loading state
- Invalid credentials state
- Backend error handling
- Redirect after login
- Link to registration

## Registration

Fields should follow the backend contract.

Expected structure:

```text
Name
Email
Password
Department
Confirm Password
```

Do **not** expose a role selector.

The backend assigns the default role.

Example:

```text
❌ Role:
   Student
   Faculty
   Admin
```

must not be a registration option.

---

# 10. Session and Permission Management

Create:

```text
lib/auth/session.ts
lib/auth/permissions.ts
```

The frontend should obtain the authenticated user and their permissions from the backend/auth system.

Example conceptual API:

```ts
getCurrentUser()
getCurrentPermissions()
hasPermission(permission)
```

Permission checks should be reusable throughout the application.

Example:

```tsx
{hasPermission("book_facility") && (
  <BookFacilityButton />
)}
```

Do not duplicate permission logic across pages.

---

# 11. API Client Architecture

Create a centralized API client:

```text
lib/api/client.ts
```

Responsibilities:

- Base URL handling
- HTTP methods
- Authentication/session handling
- JSON parsing
- Standardized error handling
- Request headers
- API response parsing

Example conceptual interface:

```ts
api.get()
api.post()
api.put()
api.patch()
api.delete()
```

Feature-specific API functions should live with their feature.

Example:

```text
features/
└── facilities/
    └── api.ts

features/
└── bookings/
    └── api.ts
```

Avoid doing raw `fetch()` calls directly throughout page components.

---

# 12. Server State Management

Use **TanStack Query** for server state.

Good candidates:

```text
Facilities
Facility details
Availability
Bookings
Booking details
Notifications
Users
Roles
Permissions
Analytics
Audit logs
```

Use local React state for UI-only state.

Examples:

```text
Modal open/closed
Selected filter
Current wizard step
Temporary form state
Dropdown state
```

Do not introduce a large Redux store unless an actual requirement appears.

---

# 13. Forms and Validation

Use:

```text
React Hook Form
+
Zod
```

for complex forms.

Examples:

```text
Login
Registration
Booking
Facility creation
Facility editing
Operating hours
User editing
Role/permission editing
```

Frontend validation exists for user experience.

Backend validation remains authoritative.

---

# 14. Application Shell

Authenticated pages should use:

```text
AppShell
├── Sidebar
├── Header
├── Main Content
└── Mobile Navigation
```

Desktop:

```text
┌─────────────────────────────────────────────┐
│ Header                              User 🔔 │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Sidebar      │ Main Content                 │
│              │                              │
│ Dashboard    │                              │
│ Facilities   │                              │
│ Bookings     │                              │
│ Notifications│                              │
│ Profile      │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

Admin users should receive additional navigation items based on permissions.

---

# 15. Dashboard

Route:

```text
/dashboard
```

The dashboard should be permission-aware.

## Student

Primary focus:

```text
Find facilities
View availability
Upcoming information
Notifications
```

Students should not receive a booking action if they lack `book_facility`.

## Faculty / Convenor

Primary focus:

```text
Quick Book
Upcoming bookings
Pending booking requests
Recent notifications
```

## Admin / Facility Manager

Primary focus:

```text
Pending bookings
Cancellation requests
Facility status
Recent activity
Usage overview
```

---

# 16. Facilities

Route:

```text
/facilities
```

Purpose:

Allow users to discover available campus facilities.

Features:

```text
Search
Facility type filter
Capacity filter
Status filter
Building/location filter
Facility cards
Pagination
Loading states
Empty states
```

Example card:

```text
┌───────────────────────────────┐
│ Seminar Hall A                │
│ Academic Block                │
│                               │
│ Capacity: 100                 │
│ Type: Seminar Hall            │
│ Status: Available             │
│                               │
│ [View Availability]           │
└───────────────────────────────┘
```

---

# 17. Facility Feature Components

Create:

```text
features/facilities/components/

FacilityCard.tsx
FacilityGrid.tsx
FacilityFilters.tsx
FacilitySearch.tsx
FacilityHeader.tsx
FacilityMetadata.tsx
FacilityStatusBadge.tsx
OperatingHours.tsx
AvailabilityCalendar.tsx
AvailabilitySlot.tsx
AvailabilityLegend.tsx
FacilityForm.tsx
OperatingHoursForm.tsx
```

---

# 18. Facility Details

Route:

```text
/facilities/[facilityId]
```

Display:

```text
Facility name
Facility type
Location/building
Capacity
Status
Description
Operating hours
Availability
```

The page should provide a date selector and availability grid.

---

# 19. Availability System

The backend availability API is authoritative.

The frontend must consume:

```text
facility
date
operatingHours
slots
slot status
```

The frontend must **not** independently calculate whether a slot is available for booking.

Conceptual flow:

```text
User selects facility
        ↓
User selects date
        ↓
Frontend requests availability
        ↓
Backend returns slot statuses
        ↓
Frontend renders slot grid
        ↓
User selects available slot
```

---

# 20. Slot Grid UX

Example:

```text
Date: 12 October 2026

08:00 ── Available
09:00 ── Booked
10:00 ── Available
11:00 ── Pending
12:00 ── Closed
13:00 ── Available
```

Use clear visual states:

```text
AVAILABLE
BOOKED
PENDING
UNAVAILABLE
OUTSIDE OPERATING HOURS
SELECTED
```

The exact colors should follow the SlotSync design system rather than arbitrary component-level colors.

---

# 21. Booking Workflow

Route:

```text
/bookings/new
```

Use a multi-step booking wizard.

```text
Step 1: Facility
        ↓
Step 2: Date
        ↓
Step 3: Time Slot
        ↓
Step 4: Booking Details
        ↓
Step 5: Confirmation
```

---

# 22. Booking Wizard Components

Create:

```text
features/bookings/components/

BookingCard.tsx
BookingStatusBadge.tsx
BookingDetails.tsx
BookingTimeline.tsx
BookingFilters.tsx

BookingWizard.tsx
BookingFacilityStep.tsx
BookingDateStep.tsx
BookingSlotStep.tsx
BookingDetailsStep.tsx
BookingConfirmation.tsx

CancellationDialog.tsx
ApproveBookingDialog.tsx
RejectBookingDialog.tsx

BookingEmptyState.tsx
BookingSkeleton.tsx
```

---

# 23. Booking Details

Booking details should contain:

```text
Facility
Date
Start time
End time
Purpose/details
Requester
Current status
Created time
Approval information
Cancellation information
```

Also show a lifecycle timeline.

Example:

```text
Booking requested
      ↓
Pending approval
      ↓
Approved
      ↓
Cancellation requested
      ↓
Cancelled
```

Only display states that actually apply to the booking.

---

# 24. Booking Statuses

Frontend must support the backend lifecycle:

```text
PENDING
APPROVED
REJECTED
CANCELLATION_REQUESTED
CANCELLED
```

Do not allow users to directly mutate booking status.

The frontend should call explicit backend actions.

Examples:

```text
POST /bookings
POST /bookings/:id/approve
POST /bookings/:id/reject
POST /bookings/:id/cancellation
POST /cancellations/:id/approve
POST /cancellations/:id/reject
```

The exact endpoint paths must follow the implemented backend API.

---

# 25. My Bookings

Route:

```text
/bookings
```

Provide:

```text
All
Pending
Approved
Rejected
Cancellation Requested
Cancelled
```

Each booking should be displayed as a card/table row depending on screen size.

Actions must be permission- and state-aware.

---

# 26. Cancellation Workflow

User flow:

```text
Approved Booking
       ↓
Request Cancellation
       ↓
Cancellation Requested
       ↓
Admin Review
       ↓
Approved → Cancelled
Rejected → Booking remains Approved
```

User-facing UI:

```text
Request Cancellation
Reason
Confirm
```

Admin UI:

```text
Cancellation request
Requester
Booking
Reason
Requested at

[Approve]
[Reject]
```

---

# 27. Admin Dashboard

Route:

```text
/admin
```

Dashboard should focus on operational actions.

Example sections:

```text
Pending Bookings
Cancellation Requests
Active Facilities
Inactive Facilities
Recent Activity
Usage Overview
```

Avoid overwhelming the first version with analytics.

Operational workflows should be prioritized.

---

# 28. Admin Booking Management

Route:

```text
/admin/bookings
```

Features:

```text
Pending booking table
Filters
Search
Booking details
Approve action
Reject action
Rejection reason
Loading state
Success state
Error state
```

Admin detail route:

```text
/admin/bookings/[bookingId]
```

---

# 29. Booking Approval UX

Approval:

```text
Review booking
       ↓
Confirm approval
       ↓
API request
       ↓
Success
       ↓
Booking becomes APPROVED
```

Rejection:

```text
Review booking
       ↓
Reject
       ↓
Require rejection reason
       ↓
Confirm
       ↓
API request
```

Never provide a generic status-edit dropdown such as:

```text
Status:
[Pending ▼]
```

Booking state transitions must use explicit actions.

---

# 30. Notifications

Route:

```text
/notifications
```

Header:

```text
🔔
```

Display unread count.

Notification types may include:

```text
Booking submitted
Booking approved
Booking rejected
Cancellation requested
Cancellation approved
Cancellation rejected
Booking reminder
```

Notifications are generated by the backend.

The frontend only renders and manages read/unread interaction according to the API contract.

---

# 31. Booking Reminder UX

The backend is responsible for the 30-minute reminder.

Frontend responsibilities:

```text
Display reminder
Show notification
Link notification to booking
```

The frontend must not implement its own independent reminder scheduler.

---

# 32. Facility Administration

Route:

```text
/admin/facilities
```

Features:

```text
List facilities
Search
Filter
Create
Edit
Activate/deactivate
View details
Manage operating hours
```

Create:

```text
/admin/facilities/new
```

Edit:

```text
/admin/facilities/[facilityId]
```

---

# 33. Facility Form

Facility form should support the backend model.

Fields include:

```text
Name
Facility type
Location/building
Capacity
Description
Status
Operating hours
```

Operating hours should be configurable per day.

Example:

```text
Monday     08:00 – 20:00
Tuesday    08:00 – 20:00
Wednesday  08:00 – 20:00
Thursday   08:00 – 20:00
Friday     08:00 – 20:00
Saturday   09:00 – 17:00
Sunday     Closed
```

---

# 34. User Management

Route:

```text
/admin/users
/admin/users/[userId]
```

Features:

```text
Search users
Filter by department
Filter by role
View user
Activate/deactivate
Manage appropriate role/permissions
```

Do not allow unauthorized users to modify permissions.

All authorization must remain backend-enforced.

---

# 35. RBAC Management

Route:

```text
/admin/roles
```

This is primarily a bonus/configurable RBAC feature.

Potential UI:

```text
Role
    ↓
Permissions

Student
  view_facilities
  view_availability

Faculty
  view_facilities
  view_availability
  book_facility

Convenor
  view_facilities
  view_availability
  book_facility

Admin
  manage_facilities
  approve_booking
  manage_users
  ...
```

The UI must represent the backend permission model instead of inventing a second RBAC system.

---

# 36. Profile

Route:

```text
/profile
```

Display:

```text
Name
Email
Department
Role
Account status
```

Only expose editable fields that the backend supports.

---

# 37. Analytics

Route:

```text
/admin/analytics
```

Implement after the core booking workflow is stable.

Potential metrics:

```text
Facility utilization
Bookings per facility
Bookings over time
Peak booking hours
Department usage
Approval/rejection counts
Cancellation counts
```

Analytics data must come from backend APIs.

The frontend must not derive official analytics from incomplete client-side data.

---

# 38. Audit Logs

Route:

```text
/admin/audit-logs
```

Display:

```text
Timestamp
Actor
Action
Entity
Entity ID
Metadata/details
```

Useful filters:

```text
Date
User
Action
Entity type
```

Audit logs should be read-only from the frontend.

---

# 39. Responsive Design

The system must work on:

```text
Desktop
Laptop
Tablet
Mobile
```

Desktop:

```text
Sidebar + content
```

Mobile:

```text
Top header
Bottom/mobile navigation or drawer
Full-width content
```

Tables should become:

```text
Cards
Scrollable tables
Or responsive stacked layouts
```

Do not simply shrink desktop UI until it becomes unusable.

---

# 40. Loading States

Every API-driven page must have an intentional loading state.

Examples:

```text
Skeleton cards
Skeleton tables
Skeleton facility details
Slot-grid loading state
Button loading state
Form submission state
```

Avoid showing blank pages while requests are pending.

---

# 41. Empty States

Every list should handle zero results.

Examples:

```text
No facilities found.

No bookings yet.

No pending approvals.

No cancellation requests.

No notifications.

No audit events found.
```

Empty states should explain what the user can do next when appropriate.

---

# 42. Error Handling

Standardize API errors.

Handle:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Rate Limited
500 Server Error
```

Important:

### 401

User is not authenticated.

Action:

```text
Redirect to login
```

### 403

User is authenticated but lacks permission.

Action:

```text
Show permission denied
```

### 404

Resource does not exist.

Action:

```text
Show not-found page
```

### 409

Important for booking conflicts.

Example:

```text
This slot is no longer available.
Please select another slot.
```

---

# 43. Booking Conflict UX

Because concurrent booking attempts can happen, the frontend must expect the backend to reject a slot that was available when the user first viewed it.

Flow:

```text
Slot shown as AVAILABLE
        ↓
Another user books it
        ↓
Current user submits booking
        ↓
Backend rejects request
        ↓
Frontend receives conflict
        ↓
Refresh availability
        ↓
Ask user to choose another slot
```

Never assume that a previously displayed slot is guaranteed to remain available.

---

# 44. Data Fetching Strategy

Suggested query structure:

```text
useFacilities()
useFacility(id)
useFacilityAvailability(id, date)

useBookings(filters)
useBooking(id)

useNotifications()
useUnreadNotificationCount()

useUsers(filters)
useRoles()
usePermissions()

useAnalytics()
useAuditLogs(filters)
```

Mutations:

```text
useCreateBooking()
useRequestCancellation()

useApproveBooking()
useRejectBooking()

useApproveCancellation()
useRejectCancellation()

useCreateFacility()
useUpdateFacility()
useUpdateFacilityStatus()
```

After mutations, invalidate/refetch the appropriate queries.

Example:

```text
Approve booking
    ↓
Invalidate pending bookings
Invalidate booking detail
Invalidate notifications
Refresh dashboard
```

---

# 45. Domain Type Definitions

Create frontend types that match the backend API contract.

Suggested:

```text
types/
├── api.ts
├── auth.ts
├── facility.ts
├── booking.ts
├── user.ts
├── notification.ts
├── cancellation.ts
└── rbac.ts
```

Do not duplicate backend schemas manually in dozens of places.

Keep API response types centralized and consistent.

---

# 46. Marketing Components

Existing components should remain part of the marketing layer.

Conceptually:

```text
components/marketing/

HeroSection.tsx
Navbar.tsx
Footer.tsx
FacilityExplorer.tsx
LiveSlotGridDemo.tsx
RoleWorkflowSection.tsx
BrandHighlights.tsx
BonusFeaturesSection.tsx
FaqSection.tsx
```

The homepage should continue communicating:

```text
What SlotSync is
Why it exists
How booking works
How availability works
Who can use it
Core features
Future/bonus capabilities
```

Do not replace the homepage with an application dashboard.

---

# 47. Design System

The existing SlotSync brand identity is the source for visual direction.

Create reusable design tokens for:

```text
Colors
Typography
Spacing
Border radius
Shadows
Transitions
Status colors
```

Status colors should be consistent:

```text
Pending
Approved
Rejected
Cancelled
Available
Booked
Unavailable
```

Do not hardcode different colors for the same semantic status in different components.

---

# 48. Accessibility

Frontend components should support:

```text
Keyboard navigation
Visible focus states
Semantic HTML
Accessible labels
ARIA where necessary
Color-independent status communication
Readable contrast
Screen-reader-friendly dialogs
```

Important statuses should not be communicated only through color.

Example:

```text
🟢 Available
🔴 Booked
🟡 Pending
```

with text labels included.

---

# 49. Security Rules

The frontend must follow these rules:

### Never store secrets in frontend code

Do not expose:

```text
Database credentials
JWT signing secrets
Private keys
API secrets
```

### Never trust client-side permissions

This:

```tsx
if (isAdmin) {
  showAdminButton();
}
```

does not provide security.

The backend must enforce the permission.

### Never expose sensitive data unnecessarily

Only request and display data required for the current workflow.

---

# 50. Core Product Workflow

The most important frontend journey is:

```text
Need a room
     ↓
Find facility
     ↓
View facility
     ↓
Select date
     ↓
View availability
     ↓
Select slot
     ↓
Enter booking purpose/details
     ↓
Submit booking
     ↓
Booking becomes PENDING
     ↓
Admin reviews
     ↓
APPROVED / REJECTED
     ↓
User receives notification
     ↓
User can view booking
     ↓
If needed:
Request cancellation
     ↓
Admin approves/rejects
```

This vertical slice should be completed before spending significant time on bonus features.

---

# 51. Implementation Order

Implement in the following order.

## Phase 1 — Frontend Foundation

```text
1. Clean route architecture
2. Shared UI primitives
3. API client
4. API error handling
5. Providers
6. TanStack Query
7. Form/validation setup
8. Type definitions
9. AppShell
10. Responsive navigation
```

---

## Phase 2 — Authentication

```text
1. Login
2. Register
3. Current-user/session handling
4. Protected routes
5. Unauthorized page
6. Permission utilities
```

---

## Phase 3 — Facilities

```text
1. Facilities page
2. Facility search
3. Filters
4. Facility cards
5. Facility detail page
6. Operating hours
7. Availability API integration
8. Availability calendar
9. Slot grid
```

---

## Phase 4 — Booking

```text
1. Booking wizard
2. Facility selection
3. Date selection
4. Slot selection
5. Booking details
6. Confirmation
7. Booking creation
8. My bookings
9. Booking details
10. Booking timeline
```

---

## Phase 5 — Cancellation

```text
1. Cancellation request dialog
2. Request cancellation API
3. Cancellation status
4. Cancellation information in booking detail
```

---

## Phase 6 — Admin Booking Workflow

```text
1. Admin dashboard
2. Pending booking list
3. Booking detail
4. Approve booking
5. Reject booking
6. Rejection reason
7. Cancellation request list
8. Approve cancellation
9. Reject cancellation
```

---

## Phase 7 — Notifications

```text
1. Notification bell
2. Unread count
3. Notification list
4. Read/unread actions
5. Booking deep links
```

---

## Phase 8 — Facility Administration

```text
1. Facility admin list
2. Create facility
3. Edit facility
4. Activate/deactivate
5. Operating-hours management
```

---

## Phase 9 — User Management

```text
1. User list
2. Search/filter
3. User details
4. Account status
5. Role management where supported
```

---

## Phase 10 — Profile

```text
1. Profile page
2. Account information
3. Department
4. Role
5. Supported profile updates
```

---

## Phase 11 — Configurable RBAC

```text
1. Roles
2. Permissions
3. Role-permission matrix
4. Permission-aware UI
5. Backend integration
```

---

## Phase 12 — Analytics

```text
1. Metrics
2. Facility usage
3. Booking trends
4. Peak hours
5. Department usage
```

---

## Phase 13 — Audit Logs

```text
1. Audit log list
2. Filters
3. Event details
4. Pagination
```

---

# 52. Bonus Features

Implement only after the core workflow is stable.

Potential bonus work:

```text
Waitlist
Booking restrictions / penalties
Advanced analytics
Email notifications
Advanced UI polish
```

Suggested order:

```text
Core booking workflow
        ↓
Notifications
        ↓
Admin management
        ↓
RBAC
        ↓
Analytics
        ↓
Audit logs
        ↓
Waitlist
        ↓
Penalties
        ↓
Email
```

---

# 53. Recommended Feature Structure

Example:

```text
features/bookings/
├── api.ts
├── hooks.ts
├── schemas.ts
├── types.ts
├── constants.ts
└── components/
    ├── BookingCard.tsx
    ├── BookingStatusBadge.tsx
    ├── BookingDetails.tsx
    ├── BookingTimeline.tsx
    ├── BookingFilters.tsx
    ├── BookingWizard.tsx
    ├── BookingFacilityStep.tsx
    ├── BookingDateStep.tsx
    ├── BookingSlotStep.tsx
    ├── BookingDetailsStep.tsx
    ├── BookingConfirmation.tsx
    ├── CancellationDialog.tsx
    ├── ApproveBookingDialog.tsx
    ├── RejectBookingDialog.tsx
    ├── BookingEmptyState.tsx
    └── BookingSkeleton.tsx
```

Similarly:

```text
features/facilities/
features/auth/
features/notifications/
features/users/
features/rbac/
features/analytics/
features/audit/
```

---

# 54. Frontend-to-Backend Boundary

The frontend should consume backend capabilities rather than reproduce backend logic.

## Backend owns

```text
Authentication
Authorization
Role resolution
Permission resolution
Facility validity
Operating-hour validation
Booking validity
One-booking-per-day validation
Overlap prevention
Booking state transitions
Cancellation state transitions
Notifications
Audit logs
Concurrency guarantees
```

## Frontend owns

```text
Rendering
Navigation
Forms
Client-side validation
Loading states
Error states
Dialogs
Filters
Tables
Calendars
Slot-grid presentation
Optimistic UX only where safe
Responsive design
Accessibility
```

---

# 55. Important Anti-Patterns to Avoid

## Do not calculate availability independently

Bad:

```ts
const isAvailable =
  !bookings.some(...)
```

Use the backend availability API.

---

## Do not hardcode roles everywhere

Bad:

```ts
if (user.role === "admin")
```

Prefer permission checks where possible:

```ts
hasPermission("manage_facilities")
```

---

## Do not put business logic inside page components

Bad:

```text
page.tsx
 ├── API request
 ├── validation
 ├── permission logic
 ├── booking rules
 ├── state machine
 └── UI
```

Prefer:

```text
page
 ↓
feature component
 ↓
hook
 ↓
API/service
 ↓
backend
```

---

## Do not create a giant global store

Server state belongs in TanStack Query.

Local UI state belongs in components/hooks.

---

## Do not allow arbitrary booking status edits

Avoid:

```text
PATCH /booking
{
  status: "APPROVED"
}
```

Use explicit actions provided by the backend.

---

## Do not build bonus features before the core workflow

The critical path is:

```text
Auth
 ↓
Facilities
 ↓
Availability
 ↓
Booking
 ↓
Approval
 ↓
Cancellation
 ↓
Notifications
```

---

# 56. Testing Plan

Frontend testing should cover the core user journeys.

## Authentication

```text
Login success
Login failure
Registration success
Unauthorized access
```

## Facilities

```text
Facility list
Search
Filters
Facility detail
Availability
```

## Booking

```text
Select facility
Select date
Select slot
Submit booking
Booking appears as pending
```

## Authorization

```text
Student cannot see booking action
Unauthorized API action results in proper error UI
Admin actions only appear for permitted users
```

## Booking lifecycle

```text
Pending
Approved
Rejected
Cancellation requested
Cancelled
```

## Error cases

```text
Slot conflict
Expired session
Forbidden action
Facility not found
Server error
```

---

# 57. Final Frontend Build Sequence

The practical implementation sequence is:

```text
01. Frontend architecture
02. API client
03. Auth/session
04. AppShell
05. Navigation
06. Permission system
07. Facilities list
08. Facility details
09. Availability
10. Slot grid
11. Booking wizard
12. My bookings
13. Booking details
14. Admin dashboard
15. Booking approval
16. Booking rejection
17. Cancellation workflow
18. Notifications
19. Facility administration
20. User management
21. Profile
22. RBAC UI
23. Analytics
24. Audit logs
25. Waitlist
26. Penalties
27. Email notifications
28. Final responsive/accessibility polish
29. Testing
30. Production hardening
```

---

# 58. Definition of Done

The frontend core is complete when:

- [ ] Users can register and log in.
- [ ] Authentication/session state works.
- [ ] Protected routes work.
- [ ] Permissions are loaded from the backend.
- [ ] Navigation is permission-aware.
- [ ] Users can browse facilities.
- [ ] Users can filter facilities.
- [ ] Users can view facility details.
- [ ] Users can view backend-provided availability.
- [ ] Faculty/Convenor can select a valid slot.
- [ ] Authorized users can create bookings.
- [ ] Students cannot create bookings.
- [ ] Booking status is displayed correctly.
- [ ] Users can view their bookings.
- [ ] Users can request cancellation where allowed.
- [ ] Admin can view pending bookings.
- [ ] Admin can approve bookings.
- [ ] Admin can reject bookings with a reason.
- [ ] Admin can review cancellation requests.
- [ ] Notifications are displayed.
- [ ] Admin can manage facilities.
- [ ] User management works where supported.
- [ ] Responsive UI works on mobile and desktop.
- [ ] Loading/empty/error states exist.
- [ ] Core accessibility requirements are covered.
- [ ] Frontend does not duplicate backend business rules.

---

# 59. Final Architecture

The intended frontend architecture can be summarized as:

```text
                         SlotSync Frontend
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
        Marketing            Auth             Application
             │                  │                  │
       Homepage             Login             AppShell
       About                Register               │
       FAQ                  Session         ┌──────┼──────┐
                                            │      │      │
                                       Facilities Bookings Notifications
                                            │      │
                                       Availability │
                                            │      │
                                            └──┬───┘
                                               │
                                         Admin Surface
                                               │
                            ┌──────────────────┼──────────────────┐
                            │                  │                  │
                        Bookings          Facilities           Users
                            │                  │                  │
                       Cancellations          RBAC            Analytics
                                                               │
                                                          Audit Logs
```

The core data flow is:

```text
Next.js UI
    ↓
Feature Hooks
    ↓
API Client
    ↓
REST API /api/v1
    ↓
Backend Controllers
    ↓
Backend Services
    ↓
Repositories / Drizzle
    ↓
PostgreSQL
```

The frontend must remain a thin, well-structured client around this backend architecture.

---

# 60. Priority Rule

When choosing what to implement next, always prioritize:

```text
Core user workflow
    >
Security / authorization UX
    >
Data correctness
    >
Error handling
    >
Responsive UX
    >
Accessibility
    >
Visual polish
    >
Bonus features
```

The most important goal is not the number of pages.

The most important goal is a reliable end-to-end flow:

```text
Login
  ↓
Find facility
  ↓
See availability
  ↓
Book slot
  ↓
Admin approval
  ↓
Notification
  ↓
Manage booking
```

Once this vertical slice is reliable, expand the system feature-by-feature.
