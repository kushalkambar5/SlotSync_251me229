import type { Request, Response } from "express";
import { BookingService } from "./booking.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok, paginated } from "../../utils/response.js";

function isAdminView(req: Request): boolean {
  return (
    req.user?.permissions.includes("approve_booking") === true ||
    req.user?.permissions.includes("manage_facilities") === true
  );
}

export const BookingController = {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    created(res, await BookingService.createBooking(req.user.id, req.body));
  },

  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    const q = req.query as Record<string, string>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const admin = isAdminView(req);
    const { rows, total } = await BookingService.listBookings({
      status: q.status,
      facilityId: q.facilityId,
      userId: q.userId,
      date: q.date,
      scopeUserId: req.user.id,
      isAdmin: admin,
      limit,
      offset: (page - 1) * limit,
    });
    paginated(res, rows, { page, limit, total });
  },

  async getOne(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(res, await BookingService.getBooking(req.user.id, isAdminView(req), req.params.id as string));
  },

  async approve(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(
      res,
      await BookingService.approveBooking(
        req.user.id,
        req.params.id as string,
        req.ip,
        req.headers["user-agent"],
      ),
    );
  },

  async reject(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(
      res,
      await BookingService.rejectBooking(
        req.user.id,
        req.params.id as string,
        req.body.reason,
        req.ip,
        req.headers["user-agent"],
      ),
    );
  },
};
