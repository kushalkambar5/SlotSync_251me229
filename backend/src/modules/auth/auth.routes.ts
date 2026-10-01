import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/rate-limit.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { AuthController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, validate(registerSchema), asyncHandler(AuthController.register));
authRoutes.post("/login", authLimiter, validate(loginSchema), asyncHandler(AuthController.login));
authRoutes.post("/logout", asyncHandler(AuthController.logout));
authRoutes.get("/me", authenticate, asyncHandler(AuthController.me));
