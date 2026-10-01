import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { departments, users } from "../../db/schema/index.js";
import { AuditService } from "../audit/audit.service.js";
import { Errors } from "../../utils/errors.js";
import { findUserById, findUsers } from "./user.repository.js";

export const UserService = {
  list: findUsers,

  async getOrThrow(id: string) {
    const user = await findUserById(id);
    if (!user) throw Errors.notFound("User");
    return user;
  },

  async updateProfile(userId: string, input: { name?: string }) {
    const updated = await db
      .update(users)
      .set({ ...(input.name ? { name: input.name.trim() } : {}), updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id });
    if (!updated[0]) throw Errors.notFound("User");
    return UserService.getOrThrow(userId);
  },

  async updateUser(adminId: string, id: string, input: { name?: string; departmentId?: string | null }) {
    if (input.departmentId) {
      const dept = await db.select().from(departments).where(eq(departments.id, input.departmentId)).limit(1);
      if (!dept[0]) throw Errors.business("VALIDATION_ERROR", "Department does not exist.");
    }
    const before = await UserService.getOrThrow(id);
    await db
      .update(users)
      .set({
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
    await AuditService.log({
      actorUserId: adminId,
      action: "USER_UPDATED",
      entityType: "user",
      entityId: id,
      oldValues: { name: before.name },
      newValues: input,
    });
    return UserService.getOrThrow(id);
  },

  async setStatus(adminId: string, id: string, isActive: boolean) {
    const before = await UserService.getOrThrow(id);
    await db.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, id));
    await AuditService.log({
      actorUserId: adminId,
      action: isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
      entityType: "user",
      entityId: id,
      oldValues: { isActive: before.isActive },
      newValues: { isActive },
    });
    return UserService.getOrThrow(id);
  },
};
