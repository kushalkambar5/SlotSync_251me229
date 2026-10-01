import type { Database } from "../../db/client.js";
import { Errors } from "../../utils/errors.js";
import {
  countUnread,
  createNotification,
  findByUser,
  hasReminderForBooking,
  markAllRead,
  markRead,
} from "./notification.repository.js";
import type { CreateNotificationInput } from "./notification.repository.js";

export const NotificationService = {
  create: (input: CreateNotificationInput, tx?: Database) =>
    createNotification(input, tx),

  list(userId: string, limit: number, offset: number, unreadOnly = false) {
    return findByUser(userId, limit, offset, unreadOnly);
  },

  unreadCount(userId: string) {
    return countUnread(userId);
  },

  async markOneRead(id: string, userId: string) {
    const ok = await markRead(id, userId);
    if (!ok) throw Errors.notFound("Notification");
  },

  markAllRead(userId: string) {
    return markAllRead(userId);
  },

  // --- domain helpers used by booking / cancellation / scheduler ---

  bookingDecision(
    userId: string,
    bookingId: string,
    approved: boolean,
    facilityName: string,
    tx?: Database,
  ) {
    return createNotification(
      {
        userId,
        bookingId,
        type: approved ? "BOOKING_APPROVED" : "BOOKING_REJECTED",
        title: approved ? "Booking approved" : "Booking rejected",
        message: approved
          ? `Your booking for ${facilityName} has been approved.`
          : `Your booking for ${facilityName} has been rejected.`,
      },
      tx,
    );
  },

  cancellationDecision(
    userId: string,
    bookingId: string,
    approved: boolean,
    facilityName: string,
    tx?: Database,
  ) {
    return createNotification(
      {
        userId,
        bookingId,
        type: approved ? "CANCELLATION_APPROVED" : "CANCELLATION_REJECTED",
        title: approved ? "Cancellation approved" : "Cancellation rejected",
        message: approved
          ? `Cancellation for your booking at ${facilityName} has been approved.`
          : `Cancellation for your booking at ${facilityName} was rejected; the booking remains approved.`,
      },
      tx,
    );
  },

  reminder(userId: string, bookingId: string, facilityName: string, when: string, tx?: Database) {
    return createNotification(
      {
        userId,
        bookingId,
        type: "BOOKING_REMINDER",
        title: "Upcoming booking in 30 minutes",
        message: `Reminder: your booking at ${facilityName} starts at ${when}.`,
      },
      tx,
    );
  },

  hasReminderForBooking,
};
