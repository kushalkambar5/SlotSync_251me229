import type { Request, Response } from "express";
import { AuditService } from "../audit/audit.service.js";
import { RbacService } from "./rbac.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok } from "../../utils/response.js";

export const RbacController = {
  async listRoles(_req: Request, res: Response): Promise<void> {
    ok(res, await RbacService.listRoles());
  },
  async getRole(req: Request, res: Response): Promise<void> {
    ok(res, await RbacService.getRoleOrThrow(req.params.id as string));
  },
  async createRole(req: Request, res: Response): Promise<void> {
    const role = await RbacService.createRole(req.body);
    if (req.user)
      await AuditService.log({
        actorUserId: req.user.id,
        action: "ROLE_CREATED",
        entityType: "role",
        entityId: role.id,
        newValues: { name: role.name },
      });
    created(res, role);
  },
  async updateRole(req: Request, res: Response): Promise<void> {
    ok(res, await RbacService.updateRole(req.params.id as string, req.body));
  },
  async deactivateRole(req: Request, res: Response): Promise<void> {
    await RbacService.deactivateRole(req.params.id as string);
    ok(res, { id: req.params.id, isActive: false });
  },
  async assignPermission(req: Request, res: Response): Promise<void> {
    await RbacService.assignPermission(req.params.id as string, req.body.permissionId);
    ok(res, { roleId: req.params.id, permissionId: req.body.permissionId });
  },
  async removePermission(req: Request, res: Response): Promise<void> {
    await RbacService.removePermission(
      req.params.id as string,
      req.params.permissionId as string,
    );
    ok(res, { removed: true });
  },
  async listPermissions(_req: Request, res: Response): Promise<void> {
    ok(res, await RbacService.listPermissions());
  },
  async assignRoleToUser(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    await RbacService.assignRoleToUser(req.user.id, req.params.userId as string, req.body.roleId);
    ok(res, { userId: req.params.userId, roleId: req.body.roleId });
  },
};
