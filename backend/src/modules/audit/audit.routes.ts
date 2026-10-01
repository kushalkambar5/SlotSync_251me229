import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AuditService } from "./audit.service.js";
import { ok, paginated } from "../../utils/response.js";

const listQuery = z.object({
  actorUserId: z.string().uuid().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  action: z.string().max(150).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const auditRoutes = Router();

auditRoutes.use(authenticate);
auditRoutes.get(
  "/",
  requirePermission("view_audit_logs"),
  validate(listQuery, "query"),
  asyncHandler(async (req, res) => {
    const q = req.query as Record<string, string>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { rows, total } = await AuditService.list({
      actorUserId: q.actorUserId,
      entityType: q.entityType,
      entityId: q.entityId,
      action: q.action,
      from: q.from,
      to: q.to,
      limit,
      offset: (page - 1) * limit,
    });
    paginated(res, rows, { page, limit, total });
  }),
);
auditRoutes.get(
  "/:id",
  requirePermission("view_audit_logs"),
  asyncHandler(async (req, res) => {
    ok(res, await AuditService.getOrThrow(req.params.id as string));
  }),
);
