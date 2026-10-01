import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { FacilityController } from "./facility.controller.js";
import {
  availabilityQuerySchema,
  createFacilitySchema,
  listFacilitiesQuerySchema,
  putOperatingHoursSchema,
  updateFacilitySchema,
  updateFacilityStatusSchema,
} from "./facility.validation.js";

export const facilityRoutes = Router();

facilityRoutes.use(authenticate);
facilityRoutes.get("/", validate(listFacilitiesQuerySchema, "query"), asyncHandler(FacilityController.list));
facilityRoutes.get("/:id", asyncHandler(FacilityController.getOne));
facilityRoutes.post(
  "/",
  requirePermission("manage_facilities"),
  validate(createFacilitySchema),
  asyncHandler(FacilityController.create),
);
facilityRoutes.patch(
  "/:id",
  requirePermission("manage_facilities"),
  validate(updateFacilitySchema),
  asyncHandler(FacilityController.update),
);
facilityRoutes.patch(
  "/:id/status",
  requirePermission("manage_facilities"),
  validate(updateFacilityStatusSchema),
  asyncHandler(FacilityController.updateStatus),
);
facilityRoutes.get("/:id/operating-hours", asyncHandler(FacilityController.getOperatingHours));
facilityRoutes.put(
  "/:id/operating-hours",
  requirePermission("manage_facilities"),
  validate(putOperatingHoursSchema),
  asyncHandler(FacilityController.putOperatingHours),
);
facilityRoutes.get(
  "/:id/availability",
  validate(availabilityQuerySchema, "query"),
  asyncHandler(FacilityController.availability),
);
