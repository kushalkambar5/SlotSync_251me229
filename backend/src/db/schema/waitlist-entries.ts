import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgTable,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { waitlistStatusEnum } from "./enums.js";
import { facilities } from "./facilities.js";
import { users } from "./users.js";

// §23–§24 of db_plan.md — waitlist_entries (bonus, FIFO via position)
export const waitlistEntries = pgTable(
  "waitlist_entries",
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
    position: integer("position").notNull(),
    status: waitlistStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("waitlist_entries_position_positive", sql`${t.position} > 0`),
    check("waitlist_entries_time_order", sql`${t.startTime} < ${t.endTime}`),
    // Partial unique so a user can rejoin after cancel/expiry (§23)
    uniqueIndex("waitlist_entries_active_slot_unique")
      .on(t.userId, t.facilityId, t.bookingDate, t.startTime, t.endTime)
      .where(sql`${t.status} = 'WAITING'`),
    index("waitlist_entries_slot_idx").on(t.facilityId, t.bookingDate, t.status),
    index("waitlist_entries_user_idx").on(t.userId, t.status),
  ],
);
