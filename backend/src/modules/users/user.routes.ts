import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { UserController } from "./user.controller.js";
import { restrictionRoutes } from "./restriction.routes.js";
import {
  listUsersQuerySchema,
  updateMeSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./user.validation.js";
import { assignRoleSchema } from "../rbac/rbac.validation.js";

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get("/me", asyncHandler(UserController.getMe));
userRoutes.patch("/me", validate(updateMeSchema), asyncHandler(UserController.patchMe));

userRoutes.get(
  "/",
  requirePermission("manage_users"),
  validate(listUsersQuerySchema, "query"),
  asyncHandler(UserController.list),
);
userRoutes.get("/:id", requirePermission("manage_users"), asyncHandler(UserController.getOne));
userRoutes.patch(
  "/:id",
  requirePermission("manage_users"),
  validate(updateUserSchema),
  asyncHandler(UserController.updateOne),
);
userRoutes.patch(
  "/:id/status",
  requirePermission("manage_users"),
  validate(updateUserStatusSchema),
  asyncHandler(UserController.setStatus),
);
userRoutes.patch(
  "/:id/role",
  requirePermission("manage_users"),
  validate(assignRoleSchema),
  asyncHandler(UserController.setRole),
);
userRoutes.use("/:id/restrictions", restrictionRoutes);
