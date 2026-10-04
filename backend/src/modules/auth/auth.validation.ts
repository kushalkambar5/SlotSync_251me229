import { z } from "zod";

export const NITK_EMAIL_DOMAIN = "@nitk.edu.in";

const nitkEmail = (max = 255) =>
  z
    .string()
    .trim()
    .email("Enter a valid email.")
    .max(max)
    .refine((v) => v.toLowerCase().endsWith(NITK_EMAIL_DOMAIN), {
      message: `Only ${NITK_EMAIL_DOMAIN} email addresses are allowed.`,
    });

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: nitkEmail(),
  password: z.string().min(6).max(128),
  departmentId: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: nitkEmail(),
  password: z.string().min(1).max(128),
});
