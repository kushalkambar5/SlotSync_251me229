import type { NextFunction, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db } from "../db/client.js";
import { permissions, rolePermissions, roles, users } from "../db/schema/index.js";
import { Errors } from "../utils/errors.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

interface JwtPayload {
  sub: string;
}

export function signToken(userId: string): string {
  // jsonwebtoken types require SignOptions; cast expiresIn via options object.
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as unknown as jwt.SignOptions["expiresIn"],
  });
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  const cookie = (req as Request & { cookies?: Record<string, string> }).cookies?.[
    env.COOKIE_NAME
  ];
  if (typeof cookie === "string" && cookie.length > 0) return cookie;
  return null;
}

/** backend_plan.md §12 — verify session, load user from DB, never trust client roles. */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) throw Errors.unauthenticated();
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw Errors.unauthenticated("Invalid or expired session.");
    }
    const rows = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    const user = rows[0];
    if (!user || !user.isActive) throw Errors.unauthenticated("Account is inactive.");
    const roleRows = await db.select().from(roles).where(eq(roles.id, user.roleId)).limit(1);
    const role = roleRows[0];
    if (!role || !role.isActive) throw Errors.unauthenticated("Role is inactive.");
    const permRows = await db
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        and(eq(rolePermissions.roleId, role.id)),
      );
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      roleName: role.name,
      permissions: permRows.map((p) => p.name),
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Optional auth: attaches user when a valid token exists, otherwise continues anonymous. */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req);
  if (!token) return next();
  return authenticate(req, _res, next);
}
