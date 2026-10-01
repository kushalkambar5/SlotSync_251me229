import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { bookingStatusEnum } from "./enums.js";
import { facilities } from "./facilities.js";
import { users } from "./users.js";

// §13–§19 of db_plan.md — bookings (central transaction table)
//
// Business rules enforced here at DB level:
// - start_time < end_time (§34)
// - one active booking per user per day via partial unique index (§18)
// - overlap protection for APPROVED bookings via Postgres exclusion
//   constraint — see src/db/sql/01-booking-overlap-exclusion.sql (§17).
//   Drizzle has no EXCLUDE builder, so it ships as versioned raw SQL
//   applied after `drizzle-kit migrate`. The 1-hour slot length itself
//   is enforced in the booking service (§15–§16).
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "restrict" }),
    bookingDate: date("booking_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    status: bookingStatusEnum("status").notNull(),
    purpose: text("purpose"),
    rejectionReason: text("rejection_reason"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: uuid("approved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectedBy: uuid("rejected_by").references(() => users.id, {
      onDelete: "set null",
    }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: uuid("cancelled_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("bookings_time_order", sql`${t.startTime} < ${t.endTime}`),
    // §18: rejected/cancelled bookings must NOT consume the user's day
    uniqueIndex("bookings_user_day_active_unique")
      .on(t.userId, t.bookingDate)
      .where(
        sql`${t.status} IN ('PENDING', 'APPROVED', 'CANCELLATION_REQUESTED')`,
      ),
    // §19 recommended indexes
    index("bookings_facility_date_idx").on(t.facilityId, t.bookingDate),
    index("bookings_facility_date_status_idx").on(t.facilityId, t.bookingDate, t.status),
    index("bookings_user_date_idx").on(t.userId, t.bookingDate),
    index("bookings_status_idx").on(t.status),
    index("bookings_approved_by_idx").on(t.approvedBy),
    index("bookings_created_at_idx").on(t.createdAt),
  ],
);
