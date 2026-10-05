import { and, desc, eq, sql } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { db } from "../../db/client.js";
import { bookings, facilities, facilityTypes, users } from "../../db/schema/index.js";

export type BookingRow = typeof bookings.$inferSelect;

export async function findBookingById(id: string, tx?: Database): Promise<BookingRow | null> {
  const runner = tx ?? db;
  const rows = await runner.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return rows[0] ?? null;
}

export interface BookingDetail {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  facilityId: string;
  facilityName: string | null;
  facilityCode: string | null;
  facilityLocation: string | null;
  facilityBuilding: string | null;
  facilityFloor: string | null;
  facilityCapacity: number | null;
  facilityStatus: string | null;
  facilityTypeName: string | null;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingRow["status"];
  purpose: string | null;
  rejectionReason: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function findBookingDetailById(
  id: string,
  tx?: Database,
): Promise<BookingDetail | null> {
  const runner = tx ?? db;
  const rows = await runner
    .select({
      id: bookings.id,
      userId: bookings.userId,
      userName: users.name,
      userEmail: users.email,
      facilityId: bookings.facilityId,
      facilityName: facilities.name,
      facilityCode: facilities.code,
      facilityLocation: facilities.location,
      facilityBuilding: facilities.building,
      facilityFloor: facilities.floor,
      facilityCapacity: facilities.capacity,
      facilityStatus: facilities.status,
      facilityTypeName: facilityTypes.name,
      bookingDate: bookings.bookingDate,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      purpose: bookings.purpose,
      rejectionReason: bookings.rejectionReason,
      approvedAt: bookings.approvedAt,
      rejectedAt: bookings.rejectedAt,
      cancelledAt: bookings.cancelledAt,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .leftJoin(facilities, eq(bookings.facilityId, facilities.id))
    .leftJoin(facilityTypes, eq(facilities.typeId, facilityTypes.id))
    .where(eq(bookings.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export interface BookingListFilters {
  status?: string;
  facilityId?: string;
  userId?: string;
  date?: string;
  scopeUserId?: string; // non-admin scoping: own bookings only
  isAdmin: boolean;
  limit: number;
  offset: number;
}

export async function findBookings(filters: BookingListFilters) {
  const conds = [];
  if (filters.status) conds.push(eq(bookings.status as never, filters.status as never));
  if (filters.facilityId) conds.push(eq(bookings.facilityId, filters.facilityId));
  if (filters.date) conds.push(eq(bookings.bookingDate, filters.date));
  if (filters.isAdmin) {
    if (filters.userId) conds.push(eq(bookings.userId, filters.userId));
  } else if (filters.scopeUserId) {
    conds.push(eq(bookings.userId, filters.scopeUserId));
  }
  const where = conds.length > 0 ? and(...conds) : undefined;
  const rows = await db
    .select({
      id: bookings.id,
      userId: bookings.userId,
      userName: users.name,
      userEmail: users.email,
      facilityId: bookings.facilityId,
      facilityName: facilities.name,
      facilityCode: facilities.code,
      facilityLocation: facilities.location,
      facilityBuilding: facilities.building,
      facilityFloor: facilities.floor,
      facilityCapacity: facilities.capacity,
      facilityTypeName: facilityTypes.name,
      bookingDate: bookings.bookingDate,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      purpose: bookings.purpose,
      rejectionReason: bookings.rejectionReason,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.userId, users.id))
    .leftJoin(facilities, eq(bookings.facilityId, facilities.id))
    .leftJoin(facilityTypes, eq(facilities.typeId, facilityTypes.id))
    .where(where)
    .orderBy(desc(bookings.createdAt))
    .limit(filters.limit)
    .offset(filters.offset);
  const totalRes = await db.select({ value: sql<number>`count(*)` }).from(bookings).where(where);
  return { rows, total: Number(totalRes[0]?.value ?? 0) };
}

/** Active (PENDING/APPROVED/CANCELLATION_REQUESTED) booking for user+day (§26). */
export async function findActiveBookingForUserOnDate(
  userId: string,
  bookingDate: string,
  tx?: Database,
): Promise<BookingRow | null> {
  const runner = tx ?? db;
  const rows = await runner
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, userId),
        eq(bookings.bookingDate, bookingDate),
        sql`${bookings.status} IN ('PENDING','APPROVED','CANCELLATION_REQUESTED')`,
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** APPROVED bookings overlapping [start,end) for facility+date (app-level check; DB exclusion is final). */
export async function findOverlappingApproved(
  facilityId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  tx?: Database,
  excludeBookingId?: string,
): Promise<BookingRow[]> {
  const runner = tx ?? db;
  const conds = [
    eq(bookings.facilityId, facilityId),
    eq(bookings.bookingDate, bookingDate),
    eq(bookings.status as never, "APPROVED" as never),
    // half-open overlap
    sql`${bookings.startTime} < ${endTime} AND ${bookings.endTime} > ${startTime}`,
  ];
  if (excludeBookingId) conds.push(sql`${bookings.id} <> ${excludeBookingId}`);
  return runner
    .select()
    .from(bookings)
    .where(and(...conds));
}
