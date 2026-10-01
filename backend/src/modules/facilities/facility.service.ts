import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { facilities, facilityOperatingHours, facilityTypes } from "../../db/schema/index.js";
import { AuditService } from "../audit/audit.service.js";
import { Errors } from "../../utils/errors.js";
import {
  dayOfWeek,
  minutesToTime,
  slotsOverlap,
  timeToMinutes,
} from "../../utils/date.js";
import {
  findApprovedBookingsForDate,
  findFacilities,
  findFacilityById,
  getOperatingHours,
} from "./facility.repository.js";
import type { FacilityFilters } from "./facility.repository.js";

export const FacilityService = {
  list: findFacilities,

  async getOrThrow(id: string, opts: { includeInactive?: boolean } = {}) {
    const f = await findFacilityById(id);
    if (!f) throw Errors.notFound("Facility");
    if (!opts.includeInactive && !f.isActive) throw Errors.notFound("Facility");
    const hours = await getOperatingHours(id);
    return { ...f, operatingHours: hours };
  },

  async create(actorId: string, input: Record<string, unknown>) {
    const typeRows = await db
      .select({ id: facilityTypes.id })
      .from(facilityTypes)
      .where(eq(facilityTypes.id, input.typeId as string))
      .limit(1);
    if (!typeRows[0]) throw Errors.business("VALIDATION_ERROR", "Facility type does not exist.");
    const inserted = await db
      .insert(facilities)
      .values({
        name: (input.name as string).trim(),
        code: (input.code as string).trim().toUpperCase(),
        typeId: input.typeId as string,
        location: (input.location as string | undefined) ?? null,
        building: (input.building as string | undefined) ?? null,
        floor: (input.floor as string | undefined) ?? null,
        capacity: input.capacity as number,
        description: (input.description as string | undefined) ?? null,
        status: (input.status as never) ?? ("AVAILABLE" as never),
      })
      .returning();
    const row = inserted[0];
    if (!row) throw Errors.internal("Failed to create facility.");
    // Default operating hours: Mon–Sat 08:00–18:00, Sunday closed.
    await db.insert(facilityOperatingHours).values(
      [0, 1, 2, 3, 4, 5, 6].map((d) => ({
        facilityId: row.id,
        dayOfWeek: d,
        opensAt: d === 0 ? null : "08:00",
        closesAt: d === 0 ? null : "18:00",
        isClosed: d === 0,
      })),
    );
    await AuditService.log({
      actorUserId: actorId,
      action: "FACILITY_CREATED",
      entityType: "facility",
      entityId: row.id,
      newValues: { name: row.name, code: row.code },
    });
    return FacilityService.getOrThrow(row.id, { includeInactive: true });
  },

  async update(actorId: string, id: string, input: Record<string, unknown>) {
    const before = await FacilityService.getOrThrow(id, { includeInactive: true });
    if (input.typeId) {
      const t = await db
        .select({ id: facilityTypes.id })
        .from(facilityTypes)
        .where(eq(facilityTypes.id, input.typeId as string))
        .limit(1);
      if (!t[0]) throw Errors.business("VALIDATION_ERROR", "Facility type does not exist.");
    }
    const updated = await db
      .update(facilities)
      .set({
        ...(input.name ? { name: (input.name as string).trim() } : {}),
        ...(input.typeId ? { typeId: input.typeId as string } : {}),
        ...(input.location !== undefined ? { location: (input.location as string | null) } : {}),
        ...(input.building !== undefined ? { building: (input.building as string | null) } : {}),
        ...(input.floor !== undefined ? { floor: (input.floor as string | null) } : {}),
        ...(input.capacity !== undefined ? { capacity: input.capacity as number } : {}),
        ...(input.description !== undefined ? { description: input.description as string | null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(facilities.id, id))
      .returning();
    if (!updated[0]) throw Errors.notFound("Facility");
    await AuditService.log({
      actorUserId: actorId,
      action: "FACILITY_UPDATED",
      entityType: "facility",
      entityId: id,
      oldValues: { name: before.name },
      newValues: input,
    });
    return FacilityService.getOrThrow(id, { includeInactive: true });
  },

  async updateStatus(actorId: string, id: string, status: string) {
    const before = await FacilityService.getOrThrow(id, { includeInactive: true });
    await db
      .update(facilities)
      .set({ status: status as never, updatedAt: new Date() })
      .where(eq(facilities.id, id));
    await AuditService.log({
      actorUserId: actorId,
      action: "FACILITY_STATUS_CHANGED",
      entityType: "facility",
      entityId: id,
      oldValues: { status: before.status },
      newValues: { status },
    });
    return FacilityService.getOrThrow(id, { includeInactive: true });
  },

  async deactivate(actorId: string, id: string) {
    await FacilityService.getOrThrow(id, { includeInactive: true });
    await db.update(facilities).set({ isActive: false, updatedAt: new Date() }).where(eq(facilities.id, id));
    await AuditService.log({
      actorUserId: actorId,
      action: "FACILITY_DEACTIVATED",
      entityType: "facility",
      entityId: id,
    });
    return FacilityService.getOrThrow(id, { includeInactive: true });
  },

  async getOperatingHours(facilityId: string) {
    await FacilityService.getOrThrow(facilityId, { includeInactive: true });
    return getOperatingHours(facilityId);
  },

  async putOperatingHours(actorId: string, facilityId: string, hours: Array<{
    dayOfWeek: number;
    opensAt?: string | null;
    closesAt?: string | null;
    isClosed: boolean;
  }>) {
    await FacilityService.getOrThrow(facilityId, { includeInactive: true });
    for (const h of hours) {
      if (!h.isClosed) {
        if (!h.opensAt || !h.closesAt)
          throw Errors.business("VALIDATION_ERROR", "Open days require opensAt and closesAt.");
        if (timeToMinutes(h.closesAt) <= timeToMinutes(h.opensAt))
          throw Errors.business("VALIDATION_ERROR", "closesAt must be after opensAt.");
      }
    }
    // Replace per-day rows (upsert on facility+day unique).
    for (const h of hours) {
      await db
        .insert(facilityOperatingHours)
        .values({
          facilityId,
          dayOfWeek: h.dayOfWeek,
          opensAt: h.isClosed ? null : (h.opensAt as string),
          closesAt: h.isClosed ? null : (h.closesAt as string),
          isClosed: h.isClosed,
        })
        .onConflictDoUpdate({
          target: [facilityOperatingHours.facilityId, facilityOperatingHours.dayOfWeek],
          set: {
            opensAt: h.isClosed ? null : (h.opensAt as string),
            closesAt: h.isClosed ? null : (h.closesAt as string),
            isClosed: h.isClosed,
            updatedAt: new Date(),
          },
        });
    }
    await AuditService.log({
      actorUserId: actorId,
      action: "FACILITY_HOURS_UPDATED",
      entityType: "facility",
      entityId: facilityId,
      newValues: { hours },
    });
    return getOperatingHours(facilityId);
  },

  /**
   * Availability engine (§§21, 47): derives 1-hour slots from operating
   * hours + facility status + APPROVED bookings. Frontend must not
   * compute availability itself.
   */
  async getAvailability(facilityId: string, date: string) {
    const facility = await FacilityService.getOrThrow(facilityId);
    const dow = dayOfWeek(date);
    const hours = await getOperatingHours(facilityId);
    const today = hours.find((h) => h.dayOfWeek === dow) ?? null;

    const bookable = facility.isActive && facility.status === "AVAILABLE";
    if (!today || today.isClosed || !today.opensAt || !today.closesAt || !bookable) {
      return {
        facility: { id: facility.id, name: facility.name, status: facility.status },
        date,
        operatingHours: today
          ? { opensAt: today.opensAt, closesAt: today.closesAt, isClosed: today.isClosed }
          : null,
        slots: [],
      };
    }

    const open = timeToMinutes(today.opensAt);
    const close = timeToMinutes(today.closesAt);
    const approved = await findApprovedBookingsForDate(facilityId, date);
    const slots: Array<{ startTime: string; endTime: string; status: string }> = [];
    for (let s = open; s + 60 <= close; s += 60) {
      const start = minutesToTime(s);
      const end = minutesToTime(s + 60);
      const booked = approved.some((b) => slotsOverlap(start, end, b.startTime, b.endTime));
      slots.push({ startTime: start, endTime: end, status: booked ? "BOOKED" : "AVAILABLE" });
    }
    return {
      facility: { id: facility.id, name: facility.name, status: facility.status },
      date,
      operatingHours: { opensAt: today.opensAt, closesAt: today.closesAt, isClosed: false },
      slots,
    };
  },
};

export type { FacilityFilters };
