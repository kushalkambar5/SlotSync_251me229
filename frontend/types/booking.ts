import type { BookingStatus, CancellationStatus } from "./api";

export interface Booking {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  facilityId: string;
  facilityName?: string | null;
  facilityCode?: string | null;
  facilityLocation?: string | null;
  facilityBuilding?: string | null;
  facilityFloor?: string | null;
  facilityCapacity?: number | null;
  facilityStatus?: string | null;
  facilityTypeName?: string | null;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string;
  purpose?: string | null;
  status: BookingStatus;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CancellationRequest {
  id: string;
  bookingId: string;
  requestedBy: string;
  reason: string;
  status: CancellationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewReason?: string | null;
  createdAt?: string;
  // joined booking context (list endpoint)
  facilityId?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
}

export const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLATION_REQUESTED",
  "CANCELLED",
];
