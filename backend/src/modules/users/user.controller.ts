import type { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { RbacService } from "../rbac/rbac.service.js";
import { Errors } from "../../utils/errors.js";
import { ok, paginated } from "../../utils/response.js";

export const UserController = {
  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(res, await UserService.getOrThrow(req.user.id));
  },

  async patchMe(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(res, await UserService.updateProfile(req.user.id, req.body));
  },

  async list(req: Request, res: Response): Promise<void> {
    const q = req.query as Record<string, string>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 20);
    const { rows, total } = await UserService.list({
      roleId: q.roleId,
      search: q.search,
      isActive: q.isActive === undefined ? undefined : q.isActive === "true",
      limit,
      offset: (page - 1) * limit,
    });
    paginated(res, rows, { page, limit, total });
  },

  async getOne(req: Request, res: Response): Promise<void> {
    ok(res, await UserService.getOrThrow(req.params.id as string));
  },

  async updateOne(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(res, await UserService.updateUser(req.user.id, req.params.id as string, req.body));
  },

  async setStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    ok(res, await UserService.setStatus(req.user.id, req.params.id as string, req.body.isActive));
  },

  async setRole(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    // Body already validated by validate(assignRoleSchema) in user.routes.ts —
    // do not re-parse here (single source of truth for validation).
    const { roleId } = req.body as { roleId: string };
    const fresh = await RbacService.assignRoleToUser(req.user.id, req.params.id as string, roleId);
    ok(res, fresh);
  },
};
