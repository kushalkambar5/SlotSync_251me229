// backend_plan.md §§15, 31, 40 — canonical permission names, statuses, transitions.

export const PERMISSIONS = [
  "view_facilities",
  "view_availability",
  "book_facility",
  "cancel_booking",
  "approve_booking",
  "reject_booking",
  "approve_cancellation",
  "reject_cancellation",
  "manage_facilities",
  "manage_users",
  "manage_roles",
  "view_analytics",
  "view_audit_logs",
] as const;

export type PermissionName = (typeof PERMISSIONS)[number];

export const DEFAULT_ROLE_NAMES = ["ADMIN", "FACULTY", "CONVENOR", "STUDENT"] as const;

/** Active booking states that consume the user's one-booking-per-day allowance (§26). */
export const ACTIVE_BOOKING_STATUSES = [
  "PENDING",
  "APPROVED",
  "CANCELLATION_REQUESTED",
] as const;

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLATION_REQUESTED"
  | "CANCELLED";

/** Explicit state machine (§31). No generic PATCH status endpoint. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["CANCELLATION_REQUESTED"],
  CANCELLATION_REQUESTED: ["CANCELLED", "APPROVED"],
  REJECTED: [],
  CANCELLED: [],
};

export const FACILITY_STATUSES = ["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"] as const;
