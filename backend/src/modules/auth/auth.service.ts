import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { departments, permissions, rolePermissions, roles, users } from "../../db/schema/index.js";
import { Errors } from "../../utils/errors.js";
import { signToken } from "../../middleware/auth.middleware.js";

const SALT_ROUNDS = 10;

const NITK_EMAIL_DOMAIN = "@nitk.edu.in";

/** Defense-in-depth: zod schemas reject non-NITK emails first, service re-checks. */
function assertNitkEmail(normalizedEmail: string): void {
  if (!normalizedEmail.endsWith(NITK_EMAIL_DOMAIN)) {
    throw Errors.validation(`email: Only ${NITK_EMAIL_DOMAIN} email addresses are allowed.`);
  }
}

function sanitizeUser(row: typeof users.$inferSelect) {
  const { passwordHash: _omit, ...rest } = row;
  return rest;
}

async function getRoleByName(name: string) {
  const rows = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  return rows[0] ?? null;
}

async function getPermissionsForRole(roleId: string): Promise<string[]> {
  const rows = await db
    .select({ name: permissions.name })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId));
  return rows.map((r) => r.name);
}

export const AuthService = {
  /** backend_plan.md §10 — client must NOT choose roleId; backend assigns default STUDENT. */
  async register(input: { name: string; email: string; password: string; departmentId?: string }) {
    const email = input.email.trim().toLowerCase();
    assertNitkEmail(email);
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);
    if (existing.length > 0)
      throw Errors.conflict("BOOKING_ALREADY_EXISTS", "Email is already registered.");

    if (input.departmentId) {
      const dept = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.id, input.departmentId))
        .limit(1);
      if (!dept[0]) throw Errors.business("VALIDATION_ERROR", "Department does not exist.");
    }

    const role = await getRoleByName("STUDENT");
    if (!role) throw Errors.internal("Default STUDENT role is not seeded.");

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const inserted = await db
      .insert(users)
      .values({
        name: input.name.trim(),
        email,
        passwordHash,
        departmentId: input.departmentId ?? null,
        roleId: role.id,
      })
      .returning();
    const user = inserted[0];
    if (!user) throw Errors.internal("Failed to create user.");
    await db
      .insert((await import("../../db/schema/index.js")).auditLogs)
      .values({
        actorUserId: user.id,
        action: "USER_CREATED",
        entityType: "user",
        entityId: user.id,
        newValues: { email: user.email, role: "STUDENT" } as never,
      });
    const token = signToken(user.id);
    return { user: sanitizeUser(user), token, permissions: await getPermissionsForRole(role.id), roleName: role.name };
  },

  async login(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    assertNitkEmail(email);
    const rows = await db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);
    const user = rows[0];
    if (!user) throw Errors.unauthenticated("Invalid email or password.");
    if (!user.isActive) throw Errors.unauthenticated("Account is inactive.");
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw Errors.unauthenticated("Invalid email or password.");
    const roleRows = await db.select().from(roles).where(eq(roles.id, user.roleId)).limit(1);
    const role = roleRows[0];
    if (!role || !role.isActive) throw Errors.unauthenticated("Role is inactive.");
    const token = signToken(user.id);
    return {
      user: sanitizeUser(user),
      token,
      permissions: await getPermissionsForRole(role.id),
      roleName: role.name,
    };
  },

  async me(userId: string) {
    const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = rows[0];
    if (!user) throw Errors.unauthenticated();
    const roleRows = await db.select().from(roles).where(eq(roles.id, user.roleId)).limit(1);
    const role = roleRows[0];
    return {
      user: sanitizeUser(user),
      roleName: role?.name ?? null,
      permissions: user ? await getPermissionsForRole(user.roleId) : [],
    };
  },
};
