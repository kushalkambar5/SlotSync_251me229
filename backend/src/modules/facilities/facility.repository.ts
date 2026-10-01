import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { bookings, facilities, facilityOperatingHours, facilityTypes } from "../../db/schema/index.js";

export interface FacilityFilters {
  typeId?: string;
  minCapacity?: number;
  status?: string;
  building?: string;
  limit: number;
  offset: number;
}

export async function findFacilities(filters: FacilityFilters) {
  const conds = [eq(facilities.isActive, true)];
  if (filters.typeId) conds.push(eq(facilities.typeId, filters.typeId));
  if (filters.minCapacity) conds.push(gte(facilities.capacity, filters.minCapacity));
  if (filters.status) conds.push(eq(facilities.status as never, filters.status as never));
  if (filters.building) conds.push(eq(facilities.building, filters.building));
  const where = and(...conds);
  const rows = await db
    .select({
      id: facilities.id,
      name: facilities.name,
      code: facilities.code,
      typeId: facilities.typeId,
      typeName: facilityTypes.name,
      location: facilities.location,
      building: facilities.building,
      floor: facilities.floor,
      capacity: facilities.capacity,
      description: facilities.description,
      status: facilities.status,
      isActive: facilities.isActive,
      createdAt: facilities.createdAt,
    })
    .from(facilities)
    .leftJoin(facilityTypes, eq(facilities.typeId, facilityTypes.id))
    .where(where)
    .orderBy(desc(facilities.createdAt))
    .limit(filters.limit)
    .offset(filters.offset);
  const totalRes = await db.select({ value: sql<number>`count(*)` }).from(facilities).where(where);
  return { rows, total: Number(totalRes[0]?.value ?? 0) };
}

export async function findFacilityById(id: string) {
  const rows = await db
    .select({
      id: facilities.id,
      name: facilities.name,
      code: facilities.code,
      typeId: facilities.typeId,
      typeName: facilityTypes.name,
      location: facilities.location,
      building: facilities.building,
      floor: facilities.floor,
      capacity: facilities.capacity,
      description: facilities.description,
      status: facilities.status,
      isActive: facilities.isActive,
      createdAt: facilities.createdAt,
      updatedAt: facilities.updatedAt,
    })
    .from(facilities)
    .leftJoin(facilityTypes, eq(facilities.typeId, facilityTypes.id))
    .where(eq(facilities.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getOperatingHours(facilityId: string) {
  return db
    .select()
    .from(facilityOperatingHours)
    .where(eq(facilityOperatingHours.facilityId, facilityId))
    .orderBy(facilityOperatingHours.dayOfWeek);
}

export async function findApprovedBookingsForDate(facilityId: string, bookingDate: string) {
  return db
    .select({
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.facilityId, facilityId),
        eq(bookings.bookingDate, bookingDate),
        eq(bookings.status as never, "APPROVED" as never),
      ),
    );
}

export async function findBookingsForDateAllStatuses(facilityId: string, bookingDate: string) {
  return db
    .select({
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
    })
    .from(bookings)
    .where(and(eq(bookings.facilityId, facilityId), eq(bookings.bookingDate, bookingDate)));
}

export { lte };
