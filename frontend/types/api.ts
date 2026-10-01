export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLATION_REQUESTED"
  | "CANCELLED";

export type FacilityStatus = "AVAILABLE" | "UNAVAILABLE" | "MAINTENANCE";

export type CancellationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type NotificationType =
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "CANCELLATION_APPROVED"
  | "CANCELLATION_REJECTED"
  | "BOOKING_REMINDER"
  | "WAITLIST_PROMOTED";

export type WaitlistStatus = "WAITING" | "PROMOTED" | "CANCELLED" | "EXPIRED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
