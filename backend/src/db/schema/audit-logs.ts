import {
  index,
  inet,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

// §27–§28 of db_plan.md — audit_logs (immutable history, JSONB payloads)
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 150 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: uuid("entity_id"),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_actor_idx").on(t.actorUserId),
    index("audit_logs_entity_idx").on(t.entityType, t.entityId),
    index("audit_logs_created_at_idx").on(t.createdAt),
  ],
);
