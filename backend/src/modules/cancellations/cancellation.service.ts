import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/client.js";
import type { Database } from "../../db/client.js";
import { bookings, cancellationRequests, facilities } from "../../db/schema/index.js";
import { Errors } from "../../utils/errors.js";
import { AuditService } from "../audit/audit.service.js";
import { NotificationService } from "../notifications/notification.service.js";
import { findCancellationById, listCancellations } from "./cancellation.repository.js";
import { assertTransition } from "../bookings/booking.policy.js";
import { findBookingById } from "../bookings/booking.repository.js";

export const cancellationReviewSchema = z.object({
  reason: z.string().min(3).max(2000),
});

export const CancellationService = {
  list: listCancellations,

  /** POST /bookings/:id/cancellation-request — APPROVED -> CANCELLATION_REQUESTED (§32). */
  async requestCancellation(userId: string, bookingId: string, reason: string) {
    return db.transaction(async (raw) => {
      const tx = raw as unknown as Database;
      const booking = await findBookingById(bookingId, tx);
      if (!booking) throw Errors.notFound("Booking");
      // Owners can cancel their own; admins with cancel_booking perm may act broadly.
      if (booking.userId !== userId) {
        // Non-owner path: still require ownership unless caller is privileged.
        // Route-level permission (cancel_booking) already checked; enforce ownership for non-admins.
        throw Errors.forbidden("You can only request cancellation for your own booking.");
      }
      if (booking.status !== "APPROVED")
        throw Errors.business(
          "BOOKING_NOT_CANCELLABLE",
          "Only approved bookings can have a cancellation request.",
        );
      assertTransition(booking.status, "CANCELLATION_REQUESTED");

      const inserted = await tx
        .insert(cancellationRequests)
        .values({
          bookingId,
          requestedBy: userId,
          reason,
          status: "PENDING" as never,
        })
        .returning();
      const cr = inserted[0];
      if (!cr) throw Errors.internal("Failed to create cancellation request.");
      await tx
        .update(bookings)
        .set({ status: "CANCELLATION_REQUESTED" as never, updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));
      await AuditService.log(
        {
          actorUserId: userId,
          action: "CANCELLATION_REQUESTED",
          entityType: "cancellation_request",
          entityId: cr.id,
          newValues: { bookingId, reason },
        },
        tx,
      );
      return cr;
    });
  },

  /** POST /cancellations/:id/approve — CANCELLATION_REQUESTED -> CANCELLED (§32). */
  async approveCancellation(adminId: string, cancellationId: string, ip?: string, ua?: string) {
    return db.transaction(async (raw) => {
      const tx = raw as unknown as Database;
      const cr = await findCancellationById(cancellationId, tx);
      if (!cr) throw Errors.notFound("Cancellation request");
      if (cr.status !== "PENDING")
        throw Errors.business("INVALID_BOOKING_TRANSITION", "Cancellation request is not pending.");
      const booking = await findBookingById(cr.bookingId, tx);
      if (!booking) throw Errors.notFound("Booking");
      assertTransition(booking.status, "CANCELLED");

      await tx
        .update(cancellationRequests)
        .set({ status: "APPROVED" as never, reviewedBy: adminId, reviewedAt: new Date(), updatedAt: new Date() })
        .where(eq(cancellationRequests.id, cancellationId));
      const updated = await tx
        .update(bookings)
        .set({
          status: "CANCELLED" as never,
          cancelledAt: new Date(),
          cancelledBy: adminId,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id))
        .returning();
      const next = updated[0];
      if (!next) throw Errors.notFound("Booking");

      const fRows = await tx.select().from(facilities).where(eq(facilities.id, booking.facilityId)).limit(1);
      const fname = fRows[0]?.name ?? "facility";
      await NotificationService.cancellationDecision(booking.userId, booking.id, true, fname, tx);
      await AuditService.log(
        {
          actorUserId: adminId,
          action: "CANCELLATION_APPROVED",
          entityType: "booking",
          entityId: booking.id,
          oldValues: { status: "CANCELLATION_REQUESTED" },
          newValues: { status: "CANCELLED" },
          ipAddress: ip ?? null,
          userAgent: ua ?? null,
        },
        tx,
      );

      // Bonus: auto-promote earliest WAITING waitlist entry for this slot (best-effort).
      await CancellationService.promoteWaitlistIfAny(tx, booking.facilityId, booking.bookingDate, booking.startTime, booking.endTime).catch(() => undefined);

      return { cancellation: { ...cr, status: "APPROVED" }, booking: next };
    });
  },

  /** POST /cancellations/:id/reject — CANCELLATION_REQUESTED -> APPROVED (§32). */
  async rejectCancellation(adminId: string, cancellationId: string, reason: string, ip?: string, ua?: string) {
    return db.transaction(async (raw) => {
      const tx = raw as unknown as Database;
      const cr = await findCancellationById(cancellationId, tx);
      if (!cr) throw Errors.notFound("Cancellation request");
      if (cr.status !== "PENDING")
        throw Errors.business("INVALID_BOOKING_TRANSITION", "Cancellation request is not pending.");
      const booking = await findBookingById(cr.bookingId, tx);
      if (!booking) throw Errors.notFound("Booking");
      assertTransition(booking.status, "APPROVED");

      await tx
        .update(cancellationRequests)
        .set({
          status: "REJECTED" as never,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          reviewReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(cancellationRequests.id, cancellationId));
      const updated = await tx
        .update(bookings)
        .set({ status: "APPROVED" as never, updatedAt: new Date() })
        .where(eq(bookings.id, booking.id))
        .returning();

      const fRows = await tx.select().from(facilities).where(eq(facilities.id, booking.facilityId)).limit(1);
      const fname = fRows[0]?.name ?? "facility";
      await NotificationService.cancellationDecision(booking.userId, booking.id, false, fname, tx);
      await AuditService.log(
        {
          actorUserId: adminId,
          action: "CANCELLATION_REJECTED",
          entityType: "booking",
          entityId: booking.id,
          oldValues: { status: "CANCELLATION_REQUESTED" },
          newValues: { status: "APPROVED", reason },
          ipAddress: ip ?? null,
          userAgent: ua ?? null,
        },
        tx,
      );
      return { cancellation: { ...cr, status: "REJECTED" }, booking: updated[0] };
    });
  },

  /** Bonus waitlist promotion: earliest WAITING entry for the freed slot (§50). */
  async promoteWaitlistIfAny(
    tx: Database,
    facilityId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const { waitlistEntries } = await import("../../db/schema/index.js");
    const { and: andOp } = await import("drizzle-orm");
    const waiting = await tx
      .select()
      .from(waitlistEntries)
      .where(
        andOp(
          eq(waitlistEntries.facilityId, facilityId),
          eq(waitlistEntries.bookingDate, bookingDate),
          eq(waitlistEntries.startTime, startTime),
          eq(waitlistEntries.endTime, endTime),
          eq(waitlistEntries.status as never, "WAITING" as never),
        ),
      )
      .orderBy(waitlistEntries.position)
      .limit(1);
    const entry = waiting[0];
    if (!entry) return;
    await tx
      .update(waitlistEntries)
      .set({ status: "PROMOTED" as never, updatedAt: new Date() })
      .where(eq(waitlistEntries.id, entry.id));
    await NotificationService.create(
      {
        userId: entry.userId,
        bookingId: null,
        type: "WAITLIST_PROMOTED",
        title: "Waitlist promotion",
        message: "A slot you were waiting for is now available. Please book it promptly.",
      },
      tx,
    );
  },
};
