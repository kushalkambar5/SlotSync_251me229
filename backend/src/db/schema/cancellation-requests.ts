import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.js";
import { cancellationStatusEnum } from "./enums.js";
import { users } from "./users.js";

// §20 of db_plan.md — cancellation_requests (separate approval workflow)
export const cancellationRequests = pgTable(
  "cancellation_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "restrict" }),
    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    reason: text("reason").notNull(),
    status: cancellationStatusEnum("status").notNull(),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewReason: text("review_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Only one active PENDING request per booking
    uniqueIndex("cancellation_requests_booking_pending_unique")
      .on(t.bookingId)
      .where(sql`${t.status} = 'PENDING'`),
  ],
);
