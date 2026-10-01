import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  pgTable,
  smallint,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { facilities } from "./facilities.js";

// §12 of db_plan.md — facility_operating_hours
// day_of_week: 0 = Sunday … 6 = Saturday
export const facilityOperatingHours = pgTable(
  "facility_operating_hours",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
    dayOfWeek: smallint("day_of_week").notNull(),
    opensAt: time("opens_at"),
    closesAt: time("closes_at"),
    isClosed: boolean("is_closed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("facility_operating_hours_facility_day_unique").on(
      t.facilityId,
      t.dayOfWeek,
    ),
    check("facility_operating_hours_day_range", sql`${t.dayOfWeek} BETWEEN 0 AND 6`),
    check(
      "facility_operating_hours_open_valid",
      sql`(${t.isClosed} = true) OR (${t.opensAt} IS NOT NULL AND ${t.closesAt} IS NOT NULL AND ${t.opensAt} < ${t.closesAt})`,
    ),
  ],
);
