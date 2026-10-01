import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { db } from "../../db/client.js";
import { bookingRestrictions } from "../../db/schema/index.js";
import { AuditService } from "../audit/audit.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok } from "../../utils/response.js";

/**
 * Bonus penalty system (backend_plan.md §51): admins can place a user under
 * a booking restriction (e.g. 24h no-show penalty). BookingService rejects
 * creation attempts while a restriction is active.
 */
const createSchema = z.object({
  reason: z.string().min(3).max(1000),
  restrictionType: z.enum(["NO_SHOW", "ADMIN_RESTRICTION"]).default("ADMIN_RESTRICTION"),
  durationHours: z.number().min(1).max(24 * 30).default(24),
});

export const restrictionRoutes = Router({ mergeParams: true });

restrictionRoutes.use(authenticate);

restrictionRoutes.get(
  "/",
  requirePermission("manage_users"),
  asyncHandler(async (req, res) => {
    const rows = await db
      .select()
      .from(bookingRestrictions)
      .where(eq(bookingRestrictions.userId, req.params.id as string))
      .orderBy(desc(bookingRestrictions.createdAt));
    ok(res, rows);
  }),
);

restrictionRoutes.post(
  "/",
  requirePermission("manage_users"),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw Errors.unauthenticated();
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + Number(req.body.durationHours) * 3600_000);
    const inserted = await db
      .insert(bookingRestrictions)
      .values({
        userId: req.params.id as string,
        reason: req.body.reason,
        restrictionType: req.body.restrictionType as never,
        startsAt,
        expiresAt,
        createdBy: req.user.id,
      })
      .returning();
    await AuditService.log({
      actorUserId: req.user.id,
      action: "BOOKING_RESTRICTION_CREATED",
      entityType: "booking_restriction",
      entityId: inserted[0]?.id ?? null,
      newValues: { userId: req.params.id, reason: req.body.reason },
    });
    created(res, inserted[0]);
  }),
);
