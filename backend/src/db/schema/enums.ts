import { pgEnum } from "drizzle-orm/pg-core";

// §33 of db_plan.md — PostgreSQL enums

export const facilityStatusEnum = pgEnum("facility_status", [
  "AVAILABLE",
  "UNAVAILABLE",
  "MAINTENANCE",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLATION_REQUESTED",
  "CANCELLED",
]);

export const cancellationStatusEnum = pgEnum("cancellation_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "BOOKING_APPROVED",
  "BOOKING_REJECTED",
  "CANCELLATION_APPROVED",
  "CANCELLATION_REJECTED",
  "BOOKING_REMINDER",
  "WAITLIST_PROMOTED",
]);

export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "WAITING",
  "PROMOTED",
  "CANCELLED",
  "EXPIRED",
]);

export const restrictionTypeEnum = pgEnum("restriction_type", [
  "NO_SHOW",
  "ADMIN_RESTRICTION",
]);
