import { Router } from "express";
import { sql } from "drizzle-orm";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { db } from "../../db/client.js";
import { bookings, facilities } from "../../db/schema/index.js";
import { ok } from "../../utils/response.js";

export const analyticsRoutes = Router();
analyticsRoutes.use(authenticate);
analyticsRoutes.use(requirePermission("view_analytics"));

analyticsRoutes.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const byStatus = await db
      .select({ status: bookings.status, count: sql<number>`count(*)` })
      .from(bookings)
      .groupBy(bookings.status);
    const totalFac = await db.select({ count: sql<number>`count(*)` }).from(facilities);
    ok(res, {
      bookingsByStatus: byStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
      totalFacilities: Number(totalFac[0]?.count ?? 0),
    });
  }),
);

analyticsRoutes.get(
  "/facilities",
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select({
        facilityId: bookings.facilityId,
        facilityName: facilities.name,
        count: sql<number>`count(*)`,
      })
      .from(bookings)
      .leftJoin(facilities, sql`${bookings.facilityId} = ${facilities.id}`)
      .groupBy(bookings.facilityId, facilities.name)
      .orderBy(sql`count(*) desc`)
      .limit(10);
    ok(res, rows.map((r) => ({ ...r, count: Number(r.count) })));
  }),
);

analyticsRoutes.get(
  "/peak-hours",
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select({ startTime: bookings.startTime, count: sql<number>`count(*)` })
      .from(bookings)
      .groupBy(bookings.startTime)
      .orderBy(sql`count(*) desc`)
      .limit(12);
    ok(res, rows.map((r) => ({ startTime: r.startTime, count: Number(r.count) })));
  }),
);

analyticsRoutes.get(
  "/usage-trends",
  asyncHandler(async (req, res) => {
    const granularity = (req.query.granularity as string) ?? "daily";
    const trunc = granularity === "monthly" ? "month" : granularity === "weekly" ? "week" : "day";
    const rows = await db
      .select({
        period: sql<string>`date_trunc(${trunc}, ${bookings.createdAt})::text`,
        count: sql<number>`count(*)`,
      })
      .from(bookings)
      .groupBy(sql`date_trunc(${trunc}, ${bookings.createdAt})`)
      .orderBy(sql`date_trunc(${trunc}, ${bookings.createdAt})`)
      .limit(30);
    ok(res, rows.map((r) => ({ period: r.period, count: Number(r.count) })));
  }),
);
