import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { CancellationController } from "./cancellation.controller.js";
import { cancellationReviewSchema } from "./cancellation.service.js";

const listQuery = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const cancellationRoutes = Router();

cancellationRoutes.use(authenticate);
cancellationRoutes.get(
  "/",
  requirePermission("approve_cancellation"),
  validate(listQuery, "query"),
  asyncHandler(CancellationController.list),
);
cancellationRoutes.post(
  "/:id/approve",
  requirePermission("approve_cancellation"),
  asyncHandler(CancellationController.approve),
);
cancellationRoutes.post(
  "/:id/reject",
  requirePermission("reject_cancellation"),
  validate(cancellationReviewSchema),
  asyncHandler(CancellationController.reject),
);
