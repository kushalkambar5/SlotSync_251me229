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

export const roleRoutes = Router();
export const permissionRoutes = Router();

roleRoutes.use(authenticate);
roleRoutes.get("/", requirePermission("manage_roles"), asyncHandler(RbacController.listRoles));
roleRoutes.post(
  "/",
  requirePermission("manage_roles"),
  validate(createRoleSchema),
  asyncHandler(RbacController.createRole),
);
roleRoutes.get("/:id", requirePermission("manage_roles"), asyncHandler(RbacController.getRole));
roleRoutes.patch(
  "/:id",
  requirePermission("manage_roles"),
  validate(updateRoleSchema),
  asyncHandler(RbacController.updateRole),
);
roleRoutes.patch(
  "/:id/status",
  requirePermission("manage_roles"),
  asyncHandler(RbacController.deactivateRole),
);
roleRoutes.post(
  "/:id/permissions",
  requirePermission("manage_roles"),
  validate(assignPermissionSchema),
  asyncHandler(RbacController.assignPermission),
);
roleRoutes.delete(
  "/:id/permissions/:permissionId",
  requirePermission("manage_roles"),
  asyncHandler(RbacController.removePermission),
);

permissionRoutes.use(authenticate);
permissionRoutes.get(
  "/",
  requirePermission("manage_roles"),
  asyncHandler(RbacController.listPermissions),
);
