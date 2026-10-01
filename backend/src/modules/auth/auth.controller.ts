import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { isProd } from "../../config/env.js";
import { AuthService } from "./auth.service.js";
import { Errors } from "../../utils/errors.js";
import { created, ok } from "../../utils/response.js";

function setAuthCookie(res: Response, token: string): void {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export const AuthController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await AuthService.register(req.body);
    setAuthCookie(res, result.token);
    created(res, result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body);
    setAuthCookie(res, result.token);
    ok(res, result);
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(env.COOKIE_NAME, { path: "/" });
    ok(res, { loggedOut: true });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw Errors.unauthenticated();
    const result = await AuthService.me(req.user.id);
    ok(res, result);
  },
};
