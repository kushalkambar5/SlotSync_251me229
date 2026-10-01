import type { Request, Response } from "express";
import { CancellationService } from "./cancellation.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok, paginated } from "../../utils/response.js";

export const CancellationController = {
  async request(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    created(
      res,
      await CancellationService.requestCancellation(
        req.user.id,
        req.params.id as string,
        req.body.reason,
      ),
    );
  },

  async list(req: Request, res: Response): Promise<void> {
    const q = req.query as Record<string, string>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { rows, total } = await CancellationService.list({
      status: q.status,
      limit,
      offset: (page - 1) * limit,
    });
    paginated(res, rows, { page, limit, total });
  },

  async approve(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(
      res,
      await CancellationService.approveCancellation(
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
      await CancellationService.rejectCancellation(
        req.user.id,
        req.params.id as string,
        req.body.reason,
        req.ip,
        req.headers["user-agent"],
      ),
    );
  },
};
