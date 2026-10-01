import { pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";

// §8 of db_plan.md — permissions (UNIQUE(resource, action))
export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    resource: varchar("resource", { length: 100 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("permissions_resource_action_unique").on(t.resource, t.action)],
);
