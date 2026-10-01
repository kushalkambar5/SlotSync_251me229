import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { bookings, facilities } from "../db/schema/index.js";
import { logger } from "../utils/logger.js";
import { NotificationService } from "../modules/notifications/notification.service.js";

/**
 * backend_plan.md §35 — every minute, find APPROVED bookings starting in
 * ~25–35 min and create a BOOKING_REMINDER (idempotent via existence check).
 */
export async function runReminderJob(): Promise<number> {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 25 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 35 * 60 * 1000);
  const todayStr = now.toISOString().slice(0, 10);

  // Compare booking_date + start_time as timestamptz against the reminder window.
  const rows = await db
    .select({
      id: bookings.id,
      userId: bookings.userId,
      facilityName: facilities.name,
      bookingDate: bookings.bookingDate,
      startTime: bookings.startTime,
    })
    .from(bookings)
    .leftJoin(facilities, eq(bookings.facilityId, facilities.id))
    .where(
      and(
        eq(bookings.status as never, "APPROVED" as never),
        sql`${bookings.bookingDate} >= ${todayStr}`,
        sql`(((${bookings.bookingDate}::text || ' ' || ${bookings.startTime}::text)::timestamptz) >= ${windowStart.toISOString()}::timestamptz)`,
        sql`(((${bookings.bookingDate}::text || ' ' || ${bookings.startTime}::text)::timestamptz) <= ${windowEnd.toISOString()}::timestamptz)`,
      ),
    )
    .limit(50);

  let sent = 0;
  for (const b of rows) {
    try {
      if (await NotificationService.hasReminderForBooking(b.id)) continue;
      await NotificationService.reminder(
        b.userId,
        b.id,
        b.facilityName ?? "your facility",
        `${b.bookingDate} ${String(b.startTime).slice(0, 5)}`,
      );
      sent += 1;
    } catch (err) {
      logger.warn("reminder failed for booking", b.id, err);
    }
  }
  if (sent > 0) logger.info(`reminder job: sent ${sent} reminders`);
  return sent;
}
