import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { facilityStatusEnum } from "./enums.js";
import { facilityTypes } from "./facility-types.js";

// §11 of db_plan.md — facilities
// is_active (soft-deactivation) is separate from status (AVAILABLE/UNAVAILABLE/MAINTENANCE)
export const facilities = pgTable(
  "facilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 150 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    typeId: uuid("type_id")
      .notNull()
      .references(() => facilityTypes.id, { onDelete: "restrict" }),
    location: text("location"),
    building: varchar("building", { length: 100 }),
    floor: varchar("floor", { length: 30 }),
    capacity: integer("capacity").notNull(),
    description: text("description"),
    status: facilityStatusEnum("status").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("facilities_capacity_positive", sql`${t.capacity} > 0`),
    index("facilities_type_id_idx").on(t.typeId),
    index("facilities_status_idx").on(t.status),
    index("facilities_capacity_idx").on(t.capacity),
    index("facilities_type_capacity_status_idx").on(t.typeId, t.capacity, t.status),
  ],
);
