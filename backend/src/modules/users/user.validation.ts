import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const listUsersQuerySchema = z.object({
  roleId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
