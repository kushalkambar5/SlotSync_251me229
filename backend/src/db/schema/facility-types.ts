import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// §10 of db_plan.md — facility_types
export const facilityTypes = pgTable("facility_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
