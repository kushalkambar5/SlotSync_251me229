import type { NextFunction, Request, Response } from "express";
import { Errors } from "../utils/errors.js";

/**
 * backend_plan.md §§13–14 — permission-driven authorization.
 * Never hardcodes role names; checks the DB-loaded permission list.
 */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(Errors.unauthenticated());
    if (!req.user.permissions.includes(permission)) return next(Errors.forbidden());
    return next();
  };
}

export function requireAnyPermission(...perms: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(Errors.unauthenticated());
    if (!perms.some((p) => req.user?.permissions.includes(p)))
      return next(Errors.forbidden());
    return next();
  };
}
