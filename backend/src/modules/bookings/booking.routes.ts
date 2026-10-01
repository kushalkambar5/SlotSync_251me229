import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { BookingController } from "./booking.controller.js";
import { CancellationController } from "../cancellations/cancellation.controller.js";
import {
  createBookingSchema,
  listBookingsQuerySchema,
  rejectBookingSchema,
  requestCancellationSchema,
} from "./booking.validation.js";

export const bookingRoutes = Router();

bookingRoutes.use(authenticate);
bookingRoutes.post(
  "/",
  requirePermission("book_facility"),
  validate(createBookingSchema),
  asyncHandler(BookingController.create),
);
bookingRoutes.get(
  "/",
  validate(listBookingsQuerySchema, "query"),
  asyncHandler(BookingController.list),
);
bookingRoutes.get("/:id", asyncHandler(BookingController.getOne));
bookingRoutes.post(
  "/:id/approve",
  requirePermission("approve_booking"),
  asyncHandler(BookingController.approve),
);
bookingRoutes.post(
  "/:id/reject",
  requirePermission("reject_booking"),
  validate(rejectBookingSchema),
  asyncHandler(BookingController.reject),
);
bookingRoutes.post(
  "/:id/cancellation-request",
  requirePermission("cancel_booking"),
  validate(requestCancellationSchema),
  asyncHandler(CancellationController.request),
);
