import { and, count, desc, eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { db } from "../../db/client.js";
import { notifications } from "../../db/schema/index.js";

export type NotificationType =
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "CANCELLATION_APPROVED"
  | "CANCELLATION_REJECTED"
  | "BOOKING_REMINDER"
  | "WAITLIST_PROMOTED";

export interface CreateNotificationInput {
  userId: string;
  bookingId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
}

export async function createNotification(
  input: CreateNotificationInput,
  tx?: Database,
): Promise<typeof notifications.$inferSelect> {
  const runner = tx ?? db;
  const rows = await runner
    .insert(notifications)
    .values({
      userId: input.userId,
      bookingId: input.bookingId ?? null,
      type: input.type as never,
      title: input.title,
      message: input.message,
    })
    .returning();
  const row = rows[0];
  if (!row) throw new Error("Failed to create notification");
  return row;
}

export async function findByUser(
  userId: string,
  limit: number,
  offset: number,
  unreadOnly = false,
): Promise<{ rows: (typeof notifications.$inferSelect)[]; total: number }> {
  const where = unreadOnly
    ? and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    : eq(notifications.userId, userId);
  const rows = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
  const totalRes = await db
    .select({ value: count() })
    .from(notifications)
    .where(where);
  return { rows, total: totalRes[0]?.value ?? 0 };
}

export async function countUnread(userId: string): Promise<number> {
  const res = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return res[0]?.value ?? 0;
}

export async function markRead(id: string, userId: string): Promise<boolean> {
  const updated = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning({ id: notifications.id });
  return updated.length > 0;
}

export async function markAllRead(userId: string): Promise<number> {
  const updated = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .returning({ id: notifications.id });
  return updated.length;
}

export async function hasReminderForBooking(bookingId: string): Promise<boolean> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.bookingId, bookingId),
        eq(notifications.type as never, "BOOKING_REMINDER" as never),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
