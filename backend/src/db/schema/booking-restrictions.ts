import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { restrictionTypeEnum } from "./enums.js";
import { users } from "./users.js";

// §25–§26 of db_plan.md — booking_restrictions (bonus penalty system)
export const bookingRestrictions = pgTable(
  "booking_restrictions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    reason: text("reason").notNull(),
    restrictionType: restrictionTypeEnum("restriction_type").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      "booking_restrictions_expiry_after_start",
      sql`${t.expiresAt} > ${t.startsAt}`,
    ),
    index("booking_restrictions_user_window_idx").on(t.userId, t.startsAt, t.expiresAt),
  ],
);
