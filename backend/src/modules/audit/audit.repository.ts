import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { db } from "../../db/client.js";
import { auditLogs } from "../../db/schema/index.js";

export interface CreateAuditInput {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAudit(
  input: CreateAuditInput,
  tx?: Database,
): Promise<void> {
  const runner = tx ?? db;
  await runner.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    oldValues: (input.oldValues ?? null) as never,
    newValues: (input.newValues ?? null) as never,
    ipAddress: (input.ipAddress ?? null) as never,
    userAgent: input.userAgent ?? null,
  });
}

export interface AuditFilters {
  actorUserId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  from?: string;
  to?: string;
  limit: number;
  offset: number;
}

export async function listAudits(filters: AuditFilters): Promise<{
  rows: (typeof auditLogs.$inferSelect)[];
  total: number;
}> {
  const conds = [];
  if (filters.actorUserId) conds.push(eq(auditLogs.actorUserId, filters.actorUserId));
  if (filters.entityType) conds.push(eq(auditLogs.entityType, filters.entityType));
  if (filters.entityId) conds.push(eq(auditLogs.entityId, filters.entityId));
  if (filters.action) conds.push(eq(auditLogs.action, filters.action));
  if (filters.from) conds.push(gte(auditLogs.createdAt, new Date(filters.from)));
  if (filters.to) conds.push(lte(auditLogs.createdAt, new Date(filters.to)));
  const where = conds.length > 0 ? and(...conds) : undefined;
  const rows = await db
    .select()
    .from(auditLogs)
    .where(where)
    .orderBy(desc(auditLogs.createdAt))
    .limit(filters.limit)
    .offset(filters.offset);
  const totalRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(where);
  return { rows, total: Number(totalRows[0]?.count ?? 0) };
}

export async function getAuditById(id: string): Promise<typeof auditLogs.$inferSelect | null> {
  const rows = await db.select().from(auditLogs).where(eq(auditLogs.id, id)).limit(1);
  return rows[0] ?? null;
}
