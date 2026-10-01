import type { Request, Response } from "express";
import { NotificationService } from "./notification.service.js";
import { Errors } from "../../utils/errors.js";
import { ok, paginated, parsePagination } from "../../utils/response.js";

export const NotificationController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    const { page, limit, offset } = parsePagination(req.query as Record<string, string>);
    const unreadOnly = (req.query as Record<string, string>).unread === "true";
    const { rows, total } = await NotificationService.list(
      req.user.id,
      limit,
      offset,
      unreadOnly,
    );
    paginated(res, rows, { page, limit, total });
  },

  async unreadCount(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    const count = await NotificationService.unreadCount(req.user.id);
    ok(res, { unreadCount: count });
  },

  async markRead(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    await NotificationService.markOneRead(req.params.id as string, req.user.id);
    ok(res, { id: req.params.id, isRead: true });
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    const count = await NotificationService.markAllRead(req.user.id);
    ok(res, { markedRead: count });
  },
};
