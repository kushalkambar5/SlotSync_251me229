import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import type { Database } from "../../db/client.js";
import {
  bookingRestrictions,
  bookings,
  facilities,
  facilityOperatingHours,
  users,
} from "../../db/schema/index.js";
import { Errors } from "../../utils/errors.js";
import {
  dayOfWeek,
  isOneHourSlot,
  isValidBookingDate,
  slotInsideHours,
} from "../../utils/date.js";
import { AuditService } from "../audit/audit.service.js";
import { NotificationService } from "../notifications/notification.service.js";
import {
  findActiveBookingForUserOnDate,
  findBookingById,
  findBookings,
  findOverlappingApproved,
} from "./booking.repository.js";
import { assertTransition } from "./booking.policy.js";

function normalizeTime(t: string): string {
  // Accept "10:00" or "10:00:00" -> store as "HH:MM:SS"? TIME accepts both; keep HH:MM.
  const parts = t.split(":");
  const h = (parts[0] ?? "00").padStart(2, "0");
  const m = (parts[1] ?? "00").padStart(2, "0");
  return `${h}:${m}`;
}

async function getFacilityOrThrow(facilityId: string, tx?: Database) {
  const runner = tx ?? db;
  const rows = await runner.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1);
  const f = rows[0];
  if (!f) throw Errors.notFound("Facility");
  return f;
}

async function validateFacilityBookable(facilityId: string, tx?: Database) {
  const f = await getFacilityOrThrow(facilityId, tx);
  if (!f.isActive) throw Errors.business("FACILITY_UNAVAILABLE", "The facility is deactivated.");
  if (f.status !== "AVAILABLE")
    throw Errors.business(
      "FACILITY_UNAVAILABLE",
      f.status === "MAINTENANCE"
        ? "The facility is currently under maintenance."
        : "The facility is currently unavailable.",
    );
  return f;
}

async function validateOperatingHours(
  facilityId: string,
  bookingDate: string,
  startTime: string,
  endTime: string,
  tx?: Database,
) {
  const runner = tx ?? db;
  const dow = dayOfWeek(bookingDate);
  const rows = await runner
    .select()
    .from(facilityOperatingHours)
    .where(
      and(
        eq(facilityOperatingHours.facilityId, facilityId),
        eq(facilityOperatingHours.dayOfWeek, dow),
      ),
    )
    .limit(1);
  const oh = rows[0];
  if (!oh || oh.isClosed || !oh.opensAt || !oh.closesAt)
    throw Errors.business(
      "FACILITY_OUTSIDE_OPERATING_HOURS",
      "The facility is closed on the requested day.",
    );
  // TIME columns may come back as "08:00:00"; compare via minutes.
  if (!slotInsideHours(startTime, endTime, oh.opensAt.slice(0, 5), oh.closesAt.slice(0, 5)))
    throw Errors.business(
      "FACILITY_OUTSIDE_OPERATING_HOURS",
      "Requested slot is outside the facility's operating hours.",
    );
}

async function validateRestriction(userId: string, tx?: Database) {
  const runner = tx ?? db;
  // postgres-js cannot serialize Date objects inside raw `sql` fragments,
  // so compare against ISO strings (coerced to timestamptz by Postgres).
  const nowIso = new Date().toISOString();
  const rows = await runner
    .select({ id: bookingRestrictions.id })
    .from(bookingRestrictions)
    .where(
      and(
        eq(bookingRestrictions.userId, userId),
        sql`${bookingRestrictions.startsAt} <= ${nowIso}::timestamptz AND ${bookingRestrictions.expiresAt} > ${nowIso}::timestamptz`,
      ),
    )
    .limit(1);
  if (rows.length > 0)
    throw Errors.business(
      "ACTIVE_BOOKING_RESTRICTION",
      "Your account has an active booking restriction.",
    );
}

export const BookingService = {
  /** backend_plan.md §§23–24 — transactional creation, starts as PENDING. */
  async createBooking(
    userId: string,
    input: {
      facilityId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      purpose?: string;
    },
  ) {
    const startTime = normalizeTime(input.startTime);
    const endTime = normalizeTime(input.endTime);

    // Fast pre-transaction checks for good error messages.
    if (!isValidBookingDate(input.bookingDate))
      throw Errors.business("VALIDATION_ERROR", "Booking date must be today or in the future (YYYY-MM-DD).");
    if (!isOneHourSlot(startTime, endTime))
      throw Errors.business(
        "INVALID_BOOKING_DURATION",
        "Bookings must be exactly one hour long.",
      );

    return db.transaction(async (raw) => {
      const tx = raw as unknown as Database;
      const userRows = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = userRows[0];
      if (!user || !user.isActive) throw Errors.business("VALIDATION_ERROR", "User is inactive.");

      const facility = await validateFacilityBookable(input.facilityId, tx);
      await validateOperatingHours(input.facilityId, input.bookingDate, startTime, endTime, tx);
      await validateRestriction(userId, tx);

      const existing = await findActiveBookingForUserOnDate(userId, input.bookingDate, tx);
      if (existing)
        throw Errors.conflict(
          "DAILY_BOOKING_LIMIT_REACHED",
          "You already have an active booking for this day (max one per day).",
        );

      const inserted = await tx
        .insert(bookings)
        .values({
          userId,
          facilityId: input.facilityId,
          bookingDate: input.bookingDate,
          startTime,
          endTime,
          status: "PENDING" as never,
          purpose: input.purpose ?? null,
        })
        .returning();
      const booking = inserted[0];
      if (!booking) throw Errors.internal("Failed to create booking.");

      await AuditService.log(
        {
          actorUserId: userId,
          action: "BOOKING_CREATED",
          entityType: "booking",
          entityId: booking.id,
          newValues: {
            facilityId: booking.facilityId,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
          },
        },
        tx,
      );
      void facility;
      return booking;
    });
  },

  async getBooking(requesterId: string, isAdmin: boolean, bookingId: string) {
    const booking = await findBookingById(bookingId);
    if (!booking) throw Errors.notFound("Booking");
    if (!isAdmin && booking.userId !== requesterId)
      throw Errors.forbidden("You cannot view another user's booking.");
    return booking;
  },

  listBookings(filters: {
    status?: string;
    facilityId?: string;
    userId?: string;
    date?: string;
    scopeUserId: string;
    isAdmin: boolean;
    limit: number;
    offset: number;
  }) {
    return findBookings(filters);
  },

  /** backend_plan.md §29 — approve PENDING; overlap checked then DB exclusion is final (409). */
  async approveBooking(adminId: string, bookingId: string, ip?: string, ua?: string) {
    return db.transaction(async (raw) => {
      const tx = raw as unknown as Database;
      const booking = await findBookingById(bookingId, tx);
      if (!booking) throw Errors.notFound("Booking");
      assertTransition(booking.status, "APPROVED");

      const facility = await validateFacilityBookable(booking.facilityId, tx);
      await validateOperatingHours(
        booking.facilityId,
        booking.bookingDate,
        booking.startTime.slice(0, 5),
        booking.endTime.slice(0, 5),
        tx,
      );

      const overlapping = await findOverlappingApproved(
        booking.facilityId,
        booking.bookingDate,
        booking.startTime,
        booking.endTime,
        tx,
        booking.id,
      );
      if (overlapping.length > 0)
        throw Errors.conflict("BOOKING_OVERLAP", "This slot overlaps an approved booking.");

      let updated: (typeof bookings.$inferSelect)[] = [];
      try {
        updated = await tx
          .update(bookings)
          .set({
            status: "APPROVED" as never,
            approvedAt: new Date(),
            approvedBy: adminId,
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, bookingId))
          .returning();
      } catch (e) {
        throw Errors.conflict("BOOKING_OVERLAP", "This slot overlaps an approved booking.");
      }
      const next = updated[0];
      if (!next) throw Errors.notFound("Booking");

      await NotificationService.bookingDecision(booking.userId, booking.id, true, facility.name, tx);
      await AuditService.log(
        {
          actorUserId: adminId,
          action: "BOOKING_APPROVED",
          entityType: "booking",
          entityId: booking.id,
          oldValues: { status: "PENDING" },
          newValues: { status: "APPROVED" },
          ipAddress: ip ?? null,
          userAgent: ua ?? null,
        },
        tx,
      );
      return next;
    });
  },

  /** backend_plan.md §30 — rejection reason mandatory. */
  async rejectBooking(adminId: string, bookingId: string, reason: string, ip?: string, ua?: string) {
    return db.transaction(async (raw) => {
      const tx = raw as unknown as Database;
      const booking = await findBookingById(bookingId, tx);
      if (!booking) throw Errors.notFound("Booking");
      assertTransition(booking.status, "REJECTED");

      const facility = await getFacilityOrThrow(booking.facilityId, tx);
      const updated = await tx
        .update(bookings)
        .set({
          status: "REJECTED" as never,
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: adminId,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))
        .returning();
      const next = updated[0];
      if (!next) throw Errors.notFound("Booking");
      await NotificationService.bookingDecision(booking.userId, booking.id, false, facility.name, tx);
      await AuditService.log(
        {
          actorUserId: adminId,
          action: "BOOKING_REJECTED",
          entityType: "booking",
          entityId: booking.id,
          oldValues: { status: "PENDING" },
          newValues: { status: "REJECTED", reason },
          ipAddress: ip ?? null,
          userAgent: ua ?? null,
        },
        tx,
      );
      return next;
    });
  },
};
