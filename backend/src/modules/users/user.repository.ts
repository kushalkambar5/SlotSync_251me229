import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { roles, users } from "../../db/schema/index.js";

export interface UserFilters {
  roleId?: string;
  search?: string;
  isActive?: boolean;
  limit: number;
  offset: number;
}

export async function findUsers(filters: UserFilters) {
  const conds = [];
  if (filters.roleId) conds.push(eq(users.roleId, filters.roleId));
  if (filters.isActive !== undefined) conds.push(eq(users.isActive, filters.isActive));
  if (filters.search)
    conds.push(ilike(users.email, `%${filters.search}%`));
  const where = conds.length > 0 ? and(...conds) : undefined;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      departmentId: users.departmentId,
      roleId: users.roleId,
      roleName: roles.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(filters.limit)
    .offset(filters.offset);
  const totalRes = await db.select({ value: sql<number>`count(*)` }).from(users).where(where);
  return { rows, total: Number(totalRes[0]?.value ?? 0) };
}

export async function findUserById(id: string) {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      departmentId: users.departmentId,
      roleId: users.roleId,
      roleName: roles.name,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);
  return rows[0] ?? null;
}
