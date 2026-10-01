import type { Request, Response } from "express";
import { FacilityService } from "./facility.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok, paginated } from "../../utils/response.js";

export const FacilityController = {
  async list(req: Request, res: Response): Promise<void> {
    const q = req.query as Record<string, string>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { rows, total } = await FacilityService.list({
      typeId: q.typeId,
      minCapacity: q.minCapacity ? Number(q.minCapacity) : undefined,
      status: q.status,
      building: q.building,
      limit,
      offset: (page - 1) * limit,
    });
    paginated(res, rows, { page, limit, total });
  },

  async getOne(req: Request, res: Response): Promise<void> {
    ok(res, await FacilityService.getOrThrow(req.params.id as string));
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    created(res, await FacilityService.create(req.user.id, req.body));
  },

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(res, await FacilityService.update(req.user.id, req.params.id as string, req.body));
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(res, await FacilityService.updateStatus(req.user.id, req.params.id as string, req.body.status));
  },

  async getOperatingHours(req: Request, res: Response): Promise<void> {
    ok(res, await FacilityService.getOperatingHours(req.params.id as string));
  },

  async putOperatingHours(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(
      res,
      await FacilityService.putOperatingHours(req.user.id, req.params.id as string, req.body.hours),
    );
  },

  async availability(req: Request, res: Response): Promise<void> {
    const q = req.query as Record<string, string>;
    ok(res, await FacilityService.getAvailability(req.params.id as string, q.date as string));
  },
};
