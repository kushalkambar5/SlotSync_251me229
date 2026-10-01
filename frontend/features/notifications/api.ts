import { api } from "@/lib/api/client";
import type { AppNotification } from "@/types/notification";

export const notificationsApi = {
  list: (params: { page?: number; limit?: number; unread?: boolean } = {}) =>
    api.getPaginated<AppNotification>("/notifications", {
      query: { ...params, unread: params.unread ? "true" : undefined },
    }),
  unreadCount: () => api.get<{ unreadCount: number }>("/notifications/unread-count"),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ markedRead: number }>("/notifications/read-all"),
};
