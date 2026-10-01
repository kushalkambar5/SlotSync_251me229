import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { db } from "../../db/client.js";
import { departments } from "../../db/schema/index.js";
import { AuditService } from "../audit/audit.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok } from "../../utils/response.js";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  code: z.string().min(2).max(20),
});
const updateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  code: z.string().min(2).max(20).optional(),
});
const statusSchema = z.object({ isActive: z.boolean() });

export const departmentRoutes = Router();

// Public — needed by register page (unauthenticated) to populate department dropdown.
departmentRoutes.get(
  "/",
  asyncHandler(async (_req, res) => {
    ok(res, await db.select().from(departments).where(eq(departments.isActive, true)).orderBy(departments.name));
  }),
);

departmentRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const rows = await db.select().from(departments).where(eq(departments.id, req.params.id as string)).limit(1);
    if (!rows[0]) throw Errors.notFound("Department");
    ok(res, rows[0]);
  }),
);

departmentRoutes.use(authenticate);

departmentRoutes.post(
  "/",
  requirePermission("manage_facilities"),
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const inserted = await db
      .insert(departments)
      .values({
        name: req.body.name.trim(),
        code: req.body.code.trim().toUpperCase(),
      })
      .returning();
    if (req.user)
      await AuditService.log({
        actorUserId: req.user.id,
        action: "DEPARTMENT_CREATED",
        entityType: "department",
        entityId: inserted[0]?.id ?? null,
        newValues: req.body,
      });
    created(res, inserted[0]);
  }),
);

departmentRoutes.patch(
  "/:id",
  requirePermission("manage_facilities"),
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const updated = await db
      .update(departments)
      .set({
        ...(req.body.name ? { name: req.body.name.trim() } : {}),
        ...(req.body.code ? { code: req.body.code.trim().toUpperCase() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(departments.id, req.params.id as string))
      .returning();
    if (!updated[0]) throw Errors.notFound("Department");
    ok(res, updated[0]);
  }),
);

departmentRoutes.patch(
  "/:id/status",
  requirePermission("manage_facilities"),
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    const updated = await db
      .update(departments)
      .set({ isActive: req.body.isActive, updatedAt: new Date() })
      .where(
        and(eq(departments.id, req.params.id as string)),
      )
      .returning();
    if (!updated[0]) throw Errors.notFound("Department");
    ok(res, updated[0]);
  }),
);
