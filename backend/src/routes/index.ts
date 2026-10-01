import { Router } from "express";
import { sql } from "drizzle-orm";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { userRoutes } from "../modules/users/user.routes.js";
import { roleRoutes, permissionRoutes } from "../modules/rbac/rbac.routes.js";
import { departmentRoutes } from "../modules/departments/department.routes.js";
import { facilityTypeRoutes } from "../modules/facility-types/facility-type.routes.js";
import { facilityRoutes } from "../modules/facilities/facility.routes.js";
import { bookingRoutes } from "../modules/bookings/booking.routes.js";
import { cancellationRoutes } from "../modules/cancellations/cancellation.routes.js";
import { notificationRoutes } from "../modules/notifications/notification.routes.js";
import { auditRoutes } from "../modules/audit/audit.routes.js";
import { analyticsRoutes } from "../modules/analytics/analytics.routes.js";
import { waitlistRoutes } from "../modules/waitlist/waitlist.routes.js";
import { asyncHandler } from "../utils/async-handler.js";
import { db } from "../db/client.js";
import { ok } from "../utils/response.js";

export const apiRouter = Router();

apiRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    await db.execute(sql`select 1`);
    ok(res, { status: "ok", time: new Date().toISOString() });
  }),
);

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/roles", roleRoutes);
apiRouter.use("/permissions", permissionRoutes);
apiRouter.use("/departments", departmentRoutes);
apiRouter.use("/facility-types", facilityTypeRoutes);
apiRouter.use("/facilities", facilityRoutes);
// Facility waitlist alias: GET /facilities/:id/waitlist (bonus §50)
apiRouter.use("/waitlist", waitlistRoutes);
apiRouter.get(
  "/facilities/:id/waitlist",
  asyncHandler(async (req, res) => {
    const { waitlistEntries } = await import("../db/schema/index.js");
    const { and, eq } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(waitlistEntries)
      .where(
        and(
          eq(waitlistEntries.facilityId, req.params.id as string),
          eq(waitlistEntries.status as never, "WAITING" as never),
        ),
      )
      .orderBy(waitlistEntries.position);
    ok(res, rows);
  }),
);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/cancellations", cancellationRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/audit-logs", auditRoutes);
apiRouter.use("/analytics", analyticsRoutes);
