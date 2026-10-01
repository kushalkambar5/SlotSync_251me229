import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import type { Database } from "../../db/client.js";
import { bookings, cancellationRequests } from "../../db/schema/index.js";

export type CancellationRow = typeof cancellationRequests.$inferSelect;

export async function findCancellationById(id: string, tx?: Database): Promise<CancellationRow | null> {
  const runner = tx ?? db;
  const rows = await runner
    .select()
    .from(cancellationRequests)
    .where(eq(cancellationRequests.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listCancellations(filters: {
  status?: string;
  limit: number;
  offset: number;
}) {
  const where = filters.status
    ? eq(cancellationRequests.status as never, filters.status as never)
    : undefined;
  const rows = await db
    .select({
      id: cancellationRequests.id,
      bookingId: cancellationRequests.bookingId,
      requestedBy: cancellationRequests.requestedBy,
      reason: cancellationRequests.reason,
      status: cancellationRequests.status,
      reviewedBy: cancellationRequests.reviewedBy,
      reviewedAt: cancellationRequests.reviewedAt,
      createdAt: cancellationRequests.createdAt,
      facilityId: bookings.facilityId,
      bookingDate: bookings.bookingDate,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
    })
    .from(cancellationRequests)
    .leftJoin(bookings, eq(cancellationRequests.bookingId, bookings.id))
    .where(where)
    .orderBy(desc(cancellationRequests.createdAt))
    .limit(filters.limit)
    .offset(filters.offset);
  const totalRes = await db
    .select({ value: sql<number>`count(*)` })
    .from(cancellationRequests)
    .where(where);
  return { rows, total: Number(totalRes[0]?.value ?? 0) };
}

export { and };
