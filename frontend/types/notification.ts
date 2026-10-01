import type { NotificationType } from "./api";

export interface AppNotification {
  id: string;
  userId: string;
  bookingId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
