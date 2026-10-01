import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { permissions } from "./permissions.js";
import { roles } from "./roles.js";

// §9 of db_plan.md — role_permissions (composite PK prevents duplicates)
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);
