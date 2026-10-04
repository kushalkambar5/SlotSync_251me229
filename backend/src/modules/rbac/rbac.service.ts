import { and, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { permissions, rolePermissions, roles, users } from "../../db/schema/index.js";
import { Errors } from "../../utils/errors.js";

export const RbacService = {
  async getUserPermissions(userId: string): Promise<string[]> {
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userRows[0];
    if (!user) return [];
    const rows = await db
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, user.roleId));
    return rows.map((r) => r.name);
  },

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    return (await RbacService.getUserPermissions(userId)).includes(permission);
  },

  listRoles() {
    return db.select().from(roles).orderBy(roles.name);
  },

  async getRoleOrThrow(id: string) {
    const rows = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    const role = rows[0];
    if (!role) throw Errors.notFound("Role");
    const perms = await db
      .select({ id: permissions.id, name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, id));
    return { ...role, permissions: perms };
  },

  async createRole(input: { name: string; description?: string; permissionIds?: string[] }) {
    const name = input.name.trim().toUpperCase();
    const inserted = await db
      .insert(roles)
      .values({ name, description: input.description ?? null })
      .returning();
    const role = inserted[0];
    if (!role) throw Errors.internal("Failed to create role.");
    if (input.permissionIds?.length) {
      await db
        .insert(rolePermissions)
        .values(input.permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })))
        .onConflictDoNothing();
    }
    return RbacService.getRoleOrThrow(role.id);
  },

  async updateRole(id: string, input: { name?: string; description?: string }) {
    const existing = await RbacService.getRoleOrThrow(id);
    if (existing.isSystemRole && input.name && input.name.trim().toUpperCase() !== existing.name)
      throw Errors.business("VALIDATION_ERROR", "System roles cannot be renamed.");
    const updated = await db
      .update(roles)
      .set({
        ...(input.name ? { name: input.name.trim().toUpperCase() } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    if (!updated[0]) throw Errors.notFound("Role");
    return RbacService.getRoleOrThrow(id);
  },

  async deactivateRole(id: string) {
    const existing = await RbacService.getRoleOrThrow(id);
    if (existing.isSystemRole)
      throw Errors.business("VALIDATION_ERROR", "System roles cannot be deactivated.");
    await db.update(roles).set({ isActive: false, updatedAt: new Date() }).where(eq(roles.id, id));
  },

  async assignPermission(roleId: string, permissionId: string) {
    await RbacService.getRoleOrThrow(roleId);
    const perm = await db.select().from(permissions).where(eq(permissions.id, permissionId)).limit(1);
    if (!perm[0]) throw Errors.notFound("Permission");
    await db.insert(rolePermissions).values({ roleId, permissionId }).onConflictDoNothing();
  },

  async removePermission(roleId: string, permissionId: string) {
    await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
  },

  listPermissions() {
    return db.select().from(permissions).orderBy(permissions.name);
  },

  async assignRoleToUser(adminId: string, userId: string, roleId: string) {
    const roleRows = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    const role = roleRows[0];
    if (!role || !role.isActive) throw Errors.business("VALIDATION_ERROR", "Role is not available.");
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const target = userRows[0];
    if (!target) throw Errors.notFound("User");
    const oldRoleId = target.roleId;
    // No-op when the role is unchanged — avoids noisy audit rows and a
    // needless updatedAt bump while still returning the fresh user below.
    if (oldRoleId !== roleId) {
      await db.update(users).set({ roleId, updatedAt: new Date() }).where(eq(users.id, userId));
      const { createAudit } = await import("../audit/audit.repository.js");
      await createAudit({
        actorUserId: adminId,
        action: "USER_ROLE_CHANGED",
        entityType: "user",
        entityId: userId,
        oldValues: { roleId: oldRoleId },
        newValues: { roleId },
      });
    }
    const { findUserById } = await import("../users/user.repository.js");
    const fresh = await findUserById(userId);
    if (!fresh) throw Errors.notFound("User");
    return fresh;
  },
};
