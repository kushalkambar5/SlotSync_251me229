import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// §5 of db_plan.md — departments
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
