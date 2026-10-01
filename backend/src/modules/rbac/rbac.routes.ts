import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { RbacController } from "./rbac.controller.js";
import {
  assignPermissionSchema,
  createRoleSchema,
  updateRoleSchema,
} from "./rbac.validation.js";

export const rbacRoutes = Router();

rbacRoutes.use(authenticate);
rbacRoutes.get("/roles", requirePermission("manage_roles"), asyncHandler(RbacController.listRoles));
rbacRoutes.post(
  "/roles",
  requirePermission("manage_roles"),
  validate(createRoleSchema),
  asyncHandler(RbacController.createRole),
);
rbacRoutes.get("/roles/:id", requirePermission("manage_roles"), asyncHandler(RbacController.getRole));
rbacRoutes.patch(
  "/roles/:id",
  requirePermission("manage_roles"),
  validate(updateRoleSchema),
  asyncHandler(RbacController.updateRole),
);
rbacRoutes.patch(
  "/roles/:id/status",
  requirePermission("manage_roles"),
  asyncHandler(RbacController.deactivateRole),
);
rbacRoutes.post(
  "/roles/:id/permissions",
  requirePermission("manage_roles"),
  validate(assignPermissionSchema),
  asyncHandler(RbacController.assignPermission),
);
rbacRoutes.delete(
  "/roles/:id/permissions/:permissionId",
  requirePermission("manage_roles"),
  asyncHandler(RbacController.removePermission),
);
rbacRoutes.get(
  "/permissions",
  requirePermission("manage_roles"),
  asyncHandler(RbacController.listPermissions),
);
