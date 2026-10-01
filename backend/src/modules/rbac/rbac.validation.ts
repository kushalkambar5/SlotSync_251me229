import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

export const assignPermissionSchema = z.object({
  permissionId: z.string().uuid(),
});

export const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
});
