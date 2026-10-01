import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { departments } from "./departments.js";
import { roles } from "./roles.js";

// §6 of db_plan.md — users (role_id FK, not a raw role string)
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    departmentId: uuid("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    isActive: boolean("is_active").notNull().default(true),
    emailVerified: boolean("email_verified").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Functional unique index so FOO@x.com / foo@x.com collide (§6 note)
    uniqueIndex("users_email_lower_unique").on(sql`lower(${t.email})`),
    index("users_role_id_idx").on(t.roleId),
    index("users_department_id_idx").on(t.departmentId),
    index("users_is_active_idx").on(t.isActive),
  ],
);
