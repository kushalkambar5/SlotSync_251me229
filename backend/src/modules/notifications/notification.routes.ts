import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { NotificationController } from "./notification.controller.js";

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);
notificationRoutes.get("/", asyncHandler(NotificationController.list));
notificationRoutes.get("/unread-count", asyncHandler(NotificationController.unreadCount));
notificationRoutes.patch("/read-all", asyncHandler(NotificationController.markAllRead));
notificationRoutes.patch("/:id/read", asyncHandler(NotificationController.markRead));
