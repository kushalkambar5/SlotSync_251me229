import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { db } from "../../db/client.js";
import { facilityTypes } from "../../db/schema/index.js";
import { AuditService } from "../audit/audit.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok } from "../../utils/response.js";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
});
const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).nullable().optional(),
});
const statusSchema = z.object({ isActive: z.boolean() });

export const facilityTypeRoutes = Router();

// Public reference data — same reason as departments (usable before login).
facilityTypeRoutes.get(
  "/",
  asyncHandler(async (_req, res) => {
    ok(res, await db.select().from(facilityTypes).where(eq(facilityTypes.isActive, true)).orderBy(facilityTypes.name));
  }),
);

facilityTypeRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const rows = await db
      .select()
      .from(facilityTypes)
      .where(eq(facilityTypes.id, req.params.id as string))
      .limit(1);
    if (!rows[0]) throw Errors.notFound("Facility type");
    ok(res, rows[0]);
  }),
);

facilityTypeRoutes.use(authenticate);

facilityTypeRoutes.post(
  "/",
  requirePermission("manage_facilities"),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const inserted = await db
      .insert(facilityTypes)
      .values({
        name: req.body.name.trim().toUpperCase(),
        description: req.body.description ?? null,
      })
      .returning();
    if (req.user)
      await AuditService.log({
        actorUserId: req.user.id,
        action: "FACILITY_TYPE_CREATED",
        entityType: "facility_type",
        entityId: inserted[0]?.id ?? null,
        newValues: req.body,
      });
    created(res, inserted[0]);
  }),
);

facilityTypeRoutes.patch(
  "/:id",
  requirePermission("manage_facilities"),
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const updated = await db
      .update(facilityTypes)
      .set({
        ...(req.body.name ? { name: req.body.name.trim().toUpperCase() } : {}),
        ...(req.body.description !== undefined ? { description: req.body.description } : {}),
        updatedAt: new Date(),
      })
      .where(eq(facilityTypes.id, req.params.id as string))
      .returning();
    if (!updated[0]) throw Errors.notFound("Facility type");
    ok(res, updated[0]);
  }),
);

facilityTypeRoutes.patch(
  "/:id/status",
  requirePermission("manage_facilities"),
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    const updated = await db
      .update(facilityTypes)
      .set({ isActive: req.body.isActive, updatedAt: new Date() })
      .where(eq(facilityTypes.id, req.params.id as string))
      .returning();
    if (!updated[0]) throw Errors.notFound("Facility type");
    ok(res, updated[0]);
  }),
);
