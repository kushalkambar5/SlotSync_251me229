import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { bookings } from "./bookings.js";
import { notificationTypeEnum } from "./enums.js";
import { users } from "./users.js";

// §21–§22 of db_plan.md — notifications (in-app; booking_id nullable)
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("notifications_user_read_idx").on(t.userId, t.isRead),
    index("notifications_user_created_idx").on(t.userId, t.createdAt),
    index("notifications_booking_id_idx").on(t.bookingId),
    index("notifications_created_at_idx").on(t.createdAt),
  ],
);
