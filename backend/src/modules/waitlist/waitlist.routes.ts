import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { db } from "../../db/client.js";
import { waitlistEntries } from "../../db/schema/index.js";
import { Errors } from "../../utils/errors.js";
import { created, ok } from "../../utils/response.js";

const joinSchema = z.object({
  facilityId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

export const waitlistRoutes = Router();
waitlistRoutes.use(authenticate);

waitlistRoutes.post(
  "/",
  requirePermission("book_facility"),
  validate(joinSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) throw Errors.unauthenticated();
    const existing = await db
      .select()
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.facilityId, req.body.facilityId),
          eq(waitlistEntries.bookingDate, req.body.bookingDate),
          eq(waitlistEntries.status as never, "WAITING" as never),
        ),
      );
    const position = existing.length + 1;
    const inserted = await db
      .insert(waitlistEntries)
      .values({
        userId: req.user.id,
        facilityId: req.body.facilityId,
        bookingDate: req.body.bookingDate,
        startTime: req.body.startTime.slice(0, 5),
        endTime: req.body.endTime.slice(0, 5),
        position,
        status: "WAITING" as never,
      })
      .returning();
    created(res, inserted[0]);
  }),
);

waitlistRoutes.get(
  "/facilities/:id/waitlist",
  asyncHandler(async (req, res) => {
    const rows = await db
      .select()
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.facilityId, req.params.id as string),
          eq(waitlistEntries.status as never, "WAITING" as never),
        ),
      )
      .orderBy(waitlistEntries.position);
    ok(res, rows);
  }),
);

waitlistRoutes.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!req.user) throw Errors.unauthenticated();
    const rows = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.id, req.params.id as string))
      .limit(1);
    const entry = rows[0];
    if (!entry) throw Errors.notFound("Waitlist entry");
    if (entry.userId !== req.user.id && !req.user.permissions.includes("manage_facilities"))
      throw Errors.forbidden();
    await db
      .update(waitlistEntries)
      .set({ status: "CANCELLED" as never, updatedAt: new Date() })
      .where(eq(waitlistEntries.id, entry.id));
    ok(res, { id: entry.id, status: "CANCELLED" });
  }),
);

export const facilityWaitlistAlias = Router();
void desc;
