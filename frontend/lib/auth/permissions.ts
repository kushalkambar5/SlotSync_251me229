// Permission helpers. Frontend reasons about permission strings
// (loaded from the backend), never hardcoded role names for authz UX.
// NOTE: hiding UI is UX only — the backend still enforces 403.

export function hasPermission(
  permissions: string[] | undefined,
  permission: string
): boolean {
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: string[] | undefined,
  required: string[]
): boolean {
  if (!permissions) return false;
  return required.some((p) => permissions.includes(p));
}

export const PERMISSIONS = {
  VIEW_FACILITIES: "view_facilities",
  VIEW_AVAILABILITY: "view_availability",
  BOOK_FACILITY: "book_facility",
  CANCEL_BOOKING: "cancel_booking",
  APPROVE_BOOKING: "approve_booking",
  REJECT_BOOKING: "reject_booking",
  APPROVE_CANCELLATION: "approve_cancellation",
  REJECT_CANCELLATION: "reject_cancellation",
  MANAGE_FACILITIES: "manage_facilities",
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  VIEW_ANALYTICS: "view_analytics",
  VIEW_AUDIT_LOGS: "view_audit_logs",
} as const;
